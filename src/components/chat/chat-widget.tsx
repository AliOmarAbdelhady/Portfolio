"use client";

import * as React from "react";
import Image from "next/image";
import nextDynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircleIcon } from "lucide-react";

import { SITE } from "@/lib/constants";
import { CHATBOT_NAME } from "@/lib/chatbot-knowledge";

// The panel (and its logic) lives in its own chunk: the launcher below is
// all that renders up front. The chunk is prefetched on idle so opening
// feels instant, but nothing chat-related blocks first paint.
const panelLoader = () => import("./chat-panel");
const ChatPanel = nextDynamic(panelLoader, { ssr: false });

const NUDGE_KEY = "ali-ai-nudged";

export function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [panelMounted, setPanelMounted] = React.useState(false);
  const [nudge, setNudge] = React.useState(false);

  // Warm the panel chunk once the page has settled.
  React.useEffect(() => {
    const warm = () => void panelLoader();
    let idleId = 0;
    let timeoutId = 0;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warm, { timeout: 4000 });
    } else {
      timeoutId = window.setTimeout(warm, 4000);
    }
    return () => {
      if (typeof window.cancelIdleCallback === "function")
        window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  // One-time nudge per session, a few seconds after landing.
  React.useEffect(() => {
    if (sessionStorage.getItem(NUDGE_KEY)) return;
    const show = window.setTimeout(() => {
      setNudge(true);
      sessionStorage.setItem(NUDGE_KEY, "1");
    }, 6000);
    const hide = window.setTimeout(() => setNudge(false), 18000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  const openChat = React.useCallback(() => {
    setPanelMounted(true);
    setNudge(false);
    setOpen(true);
  }, []);

  const toggleChat = React.useCallback(() => {
    setPanelMounted(true);
    setNudge(false);
    setOpen((o) => !o);
  }, []);

  // ⌘J / Ctrl+J toggles the chat (⌘K belongs to the site command palette).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        toggleChat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleChat]);

  return (
    <>
      {panelMounted && <ChatPanel open={open} onClose={() => setOpen(false)} />}

      <div className="fixed right-3 bottom-4 z-[70] flex items-end gap-3 sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {nudge && !open && (
            <motion.button
              type="button"
              onClick={openChat}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="glass relative mb-1 hidden max-w-56 cursor-pointer rounded-2xl rounded-br-md border border-border/60 px-4 py-2.5 text-left text-sm text-foreground shadow-lg sm:block"
            >
              <span className="absolute -top-1.5 left-1/2 size-1.5 animate-pulse-glow rounded-full bg-primary" />
              <span className="font-medium">Curious about Ali?</span>{" "}
              <span className="text-muted-foreground">
                Ask his AI twin — it knows him inside out.
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={toggleChat}
          aria-label={open ? `Close ${CHATBOT_NAME} chat` : `Chat with ${CHATBOT_NAME} AI`}
          className="group relative flex size-14 cursor-pointer items-center justify-center rounded-full border border-primary/40 bg-card/80 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-[0_0_32px_-6px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
        >
          {/* liquid blob halo — morphing gradient behind the portrait */}
          <span
            aria-hidden
            className="absolute -inset-1 animate-liquid-morph bg-gradient-to-br from-primary/40 via-accent/50 to-primary-glow/40 opacity-70 blur-md"
          />
          {/* slow orbit ring */}
          <span
            aria-hidden
            className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-primary/30 group-hover:border-primary/60"
          />
          {open ? (
            <MessageCircleIcon className="relative size-6 text-primary" />
          ) : (
            <span className="relative size-10 overflow-hidden rounded-full border border-primary/50">
              <Image
                src={SITE.avatarUrl}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
              />
            </span>
          )}
          {/* online spark */}
          {!open && (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative size-2 rounded-full bg-primary shadow-[0_0_10px_2px_color-mix(in_oklab,var(--primary)_60%,transparent)]" />
            </span>
          )}
          {/* hover label (desktop) */}
          <span className="pointer-events-none absolute right-full mr-3 hidden items-center rounded-full border border-border/60 bg-card/80 px-3.5 py-1.5 font-mono text-xs font-medium whitespace-nowrap opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 sm:flex">
            Ask {CHATBOT_NAME} · ⌘J
          </span>
        </button>
      </div>
    </>
  );
}
