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
 *  - Bounded work: 8s timeout per write, payload already capped upstream.
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
  model?: string;
  latencyMs?: number;
  replyChars?: number;
  reply?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  error?: string;
};

const GITHUB_CONTENTS = "https://api.github.com/repos";
const WRITE_TIMEOUT_MS = 8_000;

function logPath(ts: string, suffix: string): string {
  const [date] = ts.split("T");
  const rand = crypto.randomUUID().slice(0, 8);
  return `messages/${date!.replaceAll("-", "/")}/${ts}-${rand}-${suffix}.json`;
}

/** Queue one log write. Never throws, never blocks the caller. */
export function recordChat(entry: ChatLogEntry, suffix: string): void {
  const repo = process.env.CHAT_LOG_REPO;
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !token) return; // logging not configured — chat still works

  const payload = JSON.stringify(entry, null, 2);
  const path = logPath(entry.ts, suffix);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WRITE_TIMEOUT_MS);

  void fetch(`${GITHUB_CONTENTS}/${repo}/contents/${path}`, {
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
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`chat-log: GitHub write failed (${res.status})`);
      }
    })
    .catch((err: unknown) => {
      console.error("chat-log: write error", (err as Error).message);
    })
    .finally(() => clearTimeout(timer));
}
