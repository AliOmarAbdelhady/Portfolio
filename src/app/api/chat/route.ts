import { CHATBOT_SYSTEM_PROMPT } from "@/lib/chatbot-knowledge";
import { recordChat } from "@/lib/chat-log";

/**
 * POST /api/chat — portfolio AI assistant backed by Groq.
 *
 * Security model (the API key NEVER reaches the client):
 *  - GROQ_API_KEY lives only in server env (Vercel project settings).
 *  - The system prompt is locked server-side; client "system" messages are
 *    stripped, so visitors cannot rewrite the persona.
 *  - Strict input validation: shape, roles, per-message and history caps.
 *  - Per-IP sliding-window rate limit (short + long window) → 429.
 *    (Serverless caveat: the counters are per warm instance; they blunt
 *    abuse, and max_tokens bounds the worst-case Groq spend per request.)
 *  - Hard generation caps: max_tokens + 30s upstream timeout + AbortController.
 *  - No CORS headers are emitted, so browsers can only call same-origin.
 *    Cross-site browser POSTs are refused outright: text/plain "simple"
 *    requests never bypass the JSON content-type gate, and a mismatched
 *    Origin header (always sent by browsers on POST) is rejected with 403 —
 *    other sites cannot burn the Groq budget or rate limit.
 *  - Every validated message is recorded to the private CHAT_LOG_REPO
 *    (see lib/chat-log.ts); rate-limited/malformed hits are logged too.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ----------------------------- configuration ---------------------------- */

const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"] as const;
const MAX_HISTORY = 16; // messages kept from the client transcript
const MAX_MESSAGE_CHARS = 2000; // per message
const MAX_TOTAL_CHARS = 16_000; // whole transcript
const MAX_TOKENS = 700;
const UPSTREAM_TIMEOUT_MS = 30_000;

/** Short window: burst limit. Long window: hourly budget. */
const RATE_LIMITS = {
  short: { limit: 8, windowMs: 60_000 },
  long: { limit: 40, windowMs: 10 * 60_000 },
} as const;

/* ------------------------------ rate limiter ---------------------------- */

type Bucket = { short: number[]; long: number[] };
const buckets = new Map<string, Bucket>();
const MAX_TRACKED_IPS = 5_000;

function prune(list: number[], now: number, windowMs: number): number[] {
  const cutoff = now - windowMs;
  return list.filter((t) => t > cutoff);
}

function rateLimited(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(ip) ?? { short: [], long: [] };
  b.short = prune(b.short, now, RATE_LIMITS.short.windowMs);
  b.long = prune(b.long, now, RATE_LIMITS.long.windowMs);

  const retryAfter = Math.max(
    b.short.length >= RATE_LIMITS.short.limit
      ? Math.ceil((b.short[0] + RATE_LIMITS.short.windowMs - now) / 1000)
      : 0,
    b.long.length >= RATE_LIMITS.long.limit
      ? Math.ceil((b.long[0] + RATE_LIMITS.long.windowMs - now) / 1000)
      : 0,
  );

  if (retryAfter > 0) return { ok: false, retryAfter };

  b.short.push(now);
  b.long.push(now);
  buckets.set(ip, b);

  // Opportunistic cleanup so the Map cannot grow unbounded.
  if (buckets.size > MAX_TRACKED_IPS) {
    for (const [key, bucket] of buckets) {
      if (
        bucket.short.every((t) => now - t > RATE_LIMITS.short.windowMs) &&
        bucket.long.every((t) => now - t > RATE_LIMITS.long.windowMs)
      ) {
        buckets.delete(key);
      }
    }
  }
  return { ok: true, retryAfter: 0 };
}

/* -------------------------------- helpers ------------------------------- */

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Common fields shared by every log entry for this request. */
function logBase(req: Request, ip: string) {
  // Vercel injects edge-computed geo headers (city is percent-encoded).
  const decoded = (name: string): string | undefined => {
    const v = req.headers.get(name);
    if (!v) return undefined;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  return {
    ts: new Date().toISOString(),
    ip,
    userAgent: req.headers.get("user-agent") ?? "unknown",
    referrer: req.headers.get("referer") ?? "none",
    geo: {
      city: decoded("x-vercel-ip-city"),
      country: req.headers.get("x-vercel-ip-country") ?? undefined,
      region: req.headers.get("x-vercel-ip-country-region") ?? undefined,
    },
  };
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function sanitizeTranscript(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const slice = input.slice(-MAX_HISTORY);
  let total = 0;
  const out: ChatMessage[] = [];
  for (const raw of slice) {
    if (typeof raw !== "object" || raw === null) return null;
    const { role, content } = raw as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null; // "system" dropped
    if (typeof content !== "string" || content.length === 0) return null;
    const trimmed = content.trim().slice(0, MAX_MESSAGE_CHARS);
    total += trimmed.length;
    if (total > MAX_TOTAL_CHARS) return null;
    out.push({ role, content: trimmed });
  }
  // A transcript must end with the visitor's turn.
  if (out[out.length - 1]!.role !== "user") return null;
  return out;
}

/** Minimal SSE encoder for the client stream (kexalo-style \`data: {"t":…}\`). */
function sse(token: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ t: token })}\n\n`);
}

/* --------------------------------- route -------------------------------- */

/**
 * Admit only requests the site itself could have made. Browsers always send
 * Origin on cross-origin (and fetch-POST) requests; non-browser clients
 * (curl, server-to-server) omit it and stay allowed. Non-JSON content types
 * are refused so a cross-site page cannot smuggle a "simple" text/plain POST
 * past the browser's CORS preflight.
 */
function originAllowed(req: Request): boolean {
  const contentType = (req.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.startsWith("application/json")) return false;

  const origin = req.headers.get("origin");
  if (!origin) return true; // not a browser — cannot be CSRF'd
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limiter = rateLimited(ip);
  if (!limiter.ok) {
    recordChat({ ...logBase(req, ip), type: "rate_limited" }, "blocked");
    return Response.json(
      {
        error: "rate_limited",
        message: "You're sending messages a bit too fast — take a breath and try again shortly.",
      },
      { status: 429, headers: { "retry-after": String(limiter.retryAfter) } },
    );
  }

  if (!originAllowed(req)) {
    recordChat(
      { ...logBase(req, ip), type: "invalid", error: "cross_origin_or_content_type" },
      "blocked",
    );
    return Response.json(
      { error: "forbidden", message: "Chat requests must come from this site." },
      { status: 403 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "unconfigured", message: "Chat is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const transcript = sanitizeTranscript((body as Record<string, unknown>)?.messages);
  if (!transcript) {
    recordChat({ ...logBase(req, ip), type: "invalid" }, "bad");
    return Response.json(
      { error: "bad_request", message: "Invalid message format." },
      { status: 400 },
    );
  }

  // Log the visitor's transcript the moment it validates — the "-q" file is
  // guaranteed even if the visitor closes the tab mid-reply.
  recordChat({ ...logBase(req, ip), type: "chat", messages: transcript }, "q");

  // Try the primary model, fall back to the lighter one if it is unavailable.
  const startedAt = Date.now();
  let model: (typeof MODELS)[number] | undefined;
  let upstream: Response | null = null;
  let lastError = "upstream_error";
  for (const candidate of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    try {
      upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: candidate,
          messages: [
            { role: "system", content: CHATBOT_SYSTEM_PROMPT },
            ...transcript,
          ],
          stream: true,
          temperature: 0.6,
          max_tokens: MAX_TOKENS,
          reasoning_effort: "low", // snappy portfolio answers, not deep thought
        }),
        signal: controller.signal,
      });
      if (upstream.ok) {
        model = candidate;
        break;
      }
      lastError = `upstream_${upstream.status}`;
      upstream = null;
    } catch (err) {
      lastError = (err as Error).name === "AbortError" ? "upstream_timeout" : "upstream_error";
    } finally {
      clearTimeout(timer);
    }
  }

  if (!upstream || !upstream.body) {
    recordChat(
      { ...logBase(req, ip), type: "upstream_error", model, messages: transcript, error: lastError },
      "err",
    );
    return Response.json(
      { error: lastError, message: "The assistant is unreachable right now — please try again." },
      { status: 502 },
    );
  }

  // Stream Groq's OpenAI-style SSE through as tiny token events.
  const reader = upstream.body.getReader();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      let reply = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep the partial tail for the next chunk
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const delta = (
                JSON.parse(data) as {
                  choices?: { delta?: { content?: string } }[];
                }
              ).choices?.[0]?.delta?.content;
              if (delta) {
                reply += delta;
                controller.enqueue(sse(delta));
              }
            } catch {
              // malformed chunk — skipping a token is cosmetic
            }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        // upstream or client aborted mid-stream — end what we have
      } finally {
        // Best-effort companion file with the assistant's reply ("-a").
        recordChat(
          {
            ...logBase(req, ip),
            type: "chat_completed",
            model,
            latencyMs: Date.now() - startedAt,
            replyChars: reply.length,
            reply: reply || undefined,
            messages: transcript,
          },
          "a",
        );
        controller.close();
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

export function GET() {
  return Response.json({ error: "method_not_allowed" }, { status: 405 });
}
