"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpIcon,
  BotIcon,
  CpuIcon,
  GraduationCapIcon,
  RocketIcon,
  SquareIcon,
  TrophyIcon,
  XIcon,
} from "lucide-react";

import { SITE } from "@/lib/constants";
import { CHATBOT_NAME } from "@/lib/chatbot-knowledge";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

type Status = "idle" | "thinking" | "streaming";

const SUGGESTIONS = [
  { icon: BotIcon, label: "Who is Ali Abdelhady?" },
  { icon: RocketIcon, label: "Tell me about his best projects" },
  { icon: GraduationCapIcon, label: "What is he studying?" },
  { icon: TrophyIcon, label: "What has he achieved?" },
];

/* ------------------------------ sub-elements ----------------------------- */

/** Ali's GitHub portrait — reused for the header, welcome, and every reply. */
function AliAvatar({ size = "size-8", rounded = "rounded-xl" }: { size?: string; rounded?: string }) {
  return (
    <span
      className={`relative ${size} ${rounded} shrink-0 overflow-hidden border border-primary/40 shadow-[0_0_18px_-6px_color-mix(in_oklab,var(--primary)_70%,transparent)]`}
    >
      <Image
        src={SITE.avatarUrl}
        alt={`${CHATBOT_NAME} avatar`}
        fill
        sizes="64px"
        className="object-cover"
      />
    </span>
  );
}

/** Streaming caret — a blinking cursor while tokens arrive. */
function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-[2px] animate-blink rounded-[2px] bg-primary"
    />
  );
}

/** Lightweight inline markdown: **bold**, `code`, links, email. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(
    /(\*\*[^*]+\*\*|`[^`]+`|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|https?:\/\/[^\s)]+)/g,
  );
  return parts
    .filter((part) => part.length > 0)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={key} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={key} className="rounded bg-accent/25 px-1 py-0.5 font-mono text-[0.85em] text-primary-glow">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("http") || part.includes("@")) {
        const href = part.startsWith("http") ? part : `mailto:${part}`;
        return (
          <a
            key={key}
            href={href}
            target={part.startsWith("http") ? "_blank" : undefined}
            rel={part.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary"
          >
            {part}
          </a>
        );
      }
      return <React.Fragment key={key}>{part}</React.Fragment>;
    });
}

/** Renders bot text with paragraphs + inline formatting. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className={i > 0 ? "mt-2" : undefined}>
          {renderInline(para, `p${i}`)}
        </p>
      ))}
    </>
  );
}

/* --------------------------------- panel -------------------------------- */

export default function ChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [status, setStatus] = React.useState<Status>("idle");
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const busy = status !== "idle";

  // Stick to the bottom while streaming unless the visitor scrolled up.
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  React.useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const send = React.useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, 1200);
      if (!content || abortRef.current) return;

      setInput("");
      const history = [...messages, { role: "user" as const, content }];
      setMessages(history);
      setStatus("thinking");

      const controller = new AbortController();
      abortRef.current = controller;
      const appendToken = (t: string) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = { ...last, content: last.content + t };
          }
          return next;
        });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-12) }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const detail = (await res.json().catch(() => null)) as
            | { message?: string }
            | null;
          throw new Error(detail?.message ?? `status ${res.status}`);
        }

        setStatus("streaming");
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const token = (JSON.parse(data) as { t?: string }).t;
              if (token) appendToken(token);
            } catch {
              // skip malformed chunk
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // keep any partial answer
        } else {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.content.length > 0) return prev;
            return [
              ...prev,
              {
                role: "assistant",
                content: `Connection hiccup on my end — mind trying that again? If it persists, reach Ali directly at ${SITE.email}.`,
              },
            ];
          });
        }
      } finally {
        abortRef.current = null;
        setStatus("idle");
      }
    },
    [messages],
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label={`${CHATBOT_NAME} AI chat`}
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed right-3 bottom-20 z-[70] flex h-[min(37rem,82dvh)] w-[min(24.5rem,calc(100vw-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/30 shadow-2xl backdrop-blur-2xl backdrop-saturate-150 sm:right-6 sm:bottom-24"
        >
          {/* liquid ambient glow — slow-morphing blobs behind everything */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-28 left-1/2 h-56 w-[130%] -translate-x-1/2 animate-aurora rounded-[50%] bg-primary/20 blur-[80px]" />
            <div className="absolute -bottom-24 -right-16 h-48 w-64 animate-aurora-slow rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-accent/15 blur-[70px]" />
          </div>

          {/* header */}
          <div className="relative flex items-center gap-3 border-b border-border/50 bg-card/40 px-4 py-3 backdrop-blur-md">
            <div className="relative">
              {busy && (
                <span
                  aria-hidden
                  className="absolute -inset-1 animate-pulse-glow rounded-2xl bg-primary/40 blur-sm"
                />
              )}
              <AliAvatar size="size-10" rounded="rounded-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold tracking-tight text-glow">
                {CHATBOT_NAME}
              </p>
              <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <span className="size-1.5 animate-pulse-glow rounded-full bg-primary" />
                AI Assistant · Online
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          {/* messages */}
          {messages.length === 0 ? (
            <div className="relative flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto px-6 py-4 text-center">
              <div className="relative mt-auto">
                <span
                  aria-hidden
                  className="absolute -inset-3 animate-pulse-glow rounded-full bg-primary/25 blur-xl"
                />
                {/* liquid morphing halo around the portrait */}
                <span
                  aria-hidden
                  className="absolute -inset-2 animate-liquid-morph bg-gradient-to-br from-primary/50 via-accent/40 to-primary-glow/50 opacity-70 blur-md"
                />
                <AliAvatar size="size-16" rounded="rounded-2xl" />
              </div>
              <div>
                <p className="font-display text-base font-semibold tracking-tight text-glow">
                  Hey! I&apos;m {CHATBOT_NAME} ⚡
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Ali&apos;s AI twin — ask me anything about his projects,
                  skills, robotics competitions, or experience.
                </p>
              </div>
              <div className="mb-auto grid w-full max-w-[17rem] grid-cols-1 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={s.label}
                    type="button"
                    onClick={() => void send(s.label)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2.5 text-left text-[13px] text-muted-foreground backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-foreground"
                  >
                    <s.icon className="size-3.5 shrink-0 text-primary" />
                    {s.label}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div
              ref={scrollRef}
              aria-live="polite"
              className="relative min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
            >
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[85%] rounded-2xl rounded-br-md border border-primary/30 bg-primary/20 px-3.5 py-2.5 text-sm leading-relaxed backdrop-blur-md">
                      {m.content}
                    </div>
                  </motion.div>
                ) : (
                  <div key={i} className="flex items-end gap-2">
                    <AliAvatar size="size-7" rounded="rounded-lg" />
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border/50 bg-card/80 px-3.5 py-2.5 text-sm leading-relaxed backdrop-blur">
                      {m.content.length > 0 ? (
                        <>
                          <Rich text={m.content} />
                          {i === messages.length - 1 && status === "streaming" && <Caret />}
                        </>
                      ) : (
                        status === "streaming" && <Caret />
                      )}
                    </div>
                  </div>
                ),
              )}
              {status === "thinking" && (
                <div className="flex items-end gap-2">
                  <AliAvatar size="size-7" rounded="rounded-lg" />
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border/50 bg-card/80 px-4 py-3 backdrop-blur">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="size-1.5 animate-pulse-glow rounded-full bg-primary"
                        style={{ animationDelay: `${i * 180}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* composer */}
          <div className="relative border-t border-border/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2 p-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${SITE.firstName}…`}
                maxLength={1200}
                autoComplete="off"
                disabled={busy}
                className="h-11 min-w-0 flex-1 rounded-full border border-border/60 bg-background/60 px-4 text-[16px] outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 disabled:opacity-50 sm:text-sm"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop generating"
                  className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-accent/40 text-foreground transition-colors hover:border-primary/50"
                >
                  <SquareIcon className="size-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="glow-ring flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary/50 bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
                >
                  <ArrowUpIcon className="size-4" />
                </button>
              )}
            </form>
            <p className="flex items-center justify-center gap-1 pb-2 font-mono text-[10px] text-muted-foreground/70">
              <CpuIcon className="size-3" />
              AI answers about {SITE.name} only
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
