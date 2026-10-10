/**
 * Chat transcript recorder.
 *
 * Every message a visitor sends to the assistant is persisted to a PRIVATE
 * GitHub repo (CHAT_LOG_REPO, e.g. "user/portfolio-chat-logs") so the owner
 * can review conversations anytime. Vercel serverless has no persistent
 * disk, and this adds no vendor/dependency: files land in GitHub via the
 * Contents API.
 *
 * Design rules:
 *  - One JSON file per message under messages/YYYY/MM/DD/<ts>-<n>.json.
 *    Paths are unique per write, so the blind PUT can never conflict —
 *    no read-modify-write, no locks, no lost updates.
 *  - Fire-and-forget: logging failures are swallowed and never break chat.
 *  - Bounded work: 8s timeout per write, 5s per geo lookup, payload already
 *    capped upstream.
 *  - Each entry is geo-enriched: city/country from Vercel edge headers plus
 *    ISP/organization resolved from the IP (cached per IP, keyless API), so
 *    the owner can see where visitors are and via which network/company.
 *  - The only auth used is GITHUB_TOKEN (server-side env); nothing here is
 *    reachable from the client. There is intentionally NO public endpoint
 *    to read the logs — the owner reads them in the private repo itself.
 */

type ChatLogType =
  | "chat" // valid visitor message, about to hit Groq
  | "chat_completed" // assistant finished replying (best-effort companion file)
  | "rate_limited" // blocked by the per-IP limiter — potential abuse
  | "invalid" // malformed request — bot traffic
  | "upstream_error"; // Groq unreachable; visitor text preserved here

export type ChatLogEntry = {
  type: ChatLogType;
  ts: string;
  ip: string;
  userAgent: string;
  referrer: string;
  /** Visitor geo — city/country from Vercel edge headers, ISP/org from lookup. */
  geo?: {
    city?: string;
    country?: string;
    region?: string;
    isp?: string;
    org?: string;
    asn?: string;
  };
  model?: string;
  latencyMs?: number;
  replyChars?: number;
  reply?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  error?: string;
};

const GITHUB_CONTENTS = "https://api.github.com/repos";
const WRITE_TIMEOUT_MS = 8_000;
const GEO_TIMEOUT_MS = 5_000;

/* --------------------------- ip → geo/isp lookup -------------------------- */

type IpInfo = { city?: string; country?: string; isp?: string; org?: string; asn?: string };

const ipCache = new Map<string, IpInfo | null>();
const MAX_CACHED_IPS = 2_000;

function isPublicIp(ip: string): boolean {
  return !(
    ip === "unknown" ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip.startsWith("fe80:")
  );
}

/**
 * Resolve ISP/org/asn (+ city/country fallback) via ipwho.is — free, no key.
 * Successes are cached per IP (visitors repeat); failures are not cached so a
 * transient outage self-heals. Never throws.
 */
async function lookupIp(ip: string): Promise<IpInfo | null> {
  if (!isPublicIp(ip)) return null;
  const cached = ipCache.get(ip);
  if (cached !== undefined) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: { "user-agent": "portfolio-chat-logger" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success?: boolean;
      city?: string;
      country?: string;
      connection?: { isp?: string; org?: string; asn?: number };
    };
    if (!data.success) return null;
    const info: IpInfo = {
      city: data.city || undefined,
      country: data.country || undefined,
      isp: data.connection?.isp || undefined,
      org: data.connection?.org || undefined,
      asn: data.connection?.asn ? `AS${data.connection.asn}` : undefined,
    };
    if (ipCache.size >= MAX_CACHED_IPS) ipCache.clear();
    ipCache.set(ip, info);
    return info;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function logPath(ts: string, suffix: string): string {
  const [date] = ts.split("T");
  const rand = crypto.randomUUID().slice(0, 8);
  return `messages/${date!.replaceAll("-", "/")}/${ts}-${rand}-${suffix}.json`;
}

/** Queue one log write (geo-enriched). Never throws, never blocks the caller. */
export function recordChat(entry: ChatLogEntry, suffix: string): void {
  const repo = process.env.CHAT_LOG_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) return; // logging not configured — chat still works

  void enrichAndWrite(entry, suffix, repo, token);
}

async function enrichAndWrite(
  entry: ChatLogEntry,
  suffix: string,
  repo: string,
  token: string,
): Promise<void> {
  // Edge geo (city/country/region) wins; the lookup fills ISP/org/asn and
  // backs up city/country when edge headers are absent (e.g. local runs).
  const info = await lookupIp(entry.ip);
  const geo = info
    ? {
        city: entry.geo?.city ?? info.city,
        country: entry.geo?.country ?? info.country,
        region: entry.geo?.region,
        isp: info.isp,
        org: info.org,
        asn: info.asn,
      }
    : entry.geo;
  const payload = JSON.stringify(geo ? { ...entry, geo } : entry, null, 2);
  const path = logPath(entry.ts, suffix);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WRITE_TIMEOUT_MS);

  try {
    const res = await fetch(`${GITHUB_CONTENTS}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "content-type": "application/json",
        "user-agent": "portfolio-chat-logger",
        "x-github-api-version": "2022-11-28",
      },
      body: JSON.stringify({
        message: `chat/${entry.type} ${entry.ts}`,
        content: Buffer.from(payload).toString("base64"),
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`chat-log: GitHub write failed (${res.status})`);
    }
  } catch (err: unknown) {
    console.error("chat-log: write error", (err as Error).message);
  } finally {
    clearTimeout(timer);
  }
}
