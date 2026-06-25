"use client";

import * as React from "react";
import { motion, useReducedMotion, useInView } from "motion/react";
import {
  Mail,
  FileText,
  ArrowRight,
  Terminal,
} from "lucide-react";

import { SITE, TERMINAL_LINES } from "@/lib/constants";
import { SOCIAL_LINKS, type SocialLink } from "@/data/social-links";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Magnetic } from "@/components/ui/magnetic-button";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Resolve an icon glyph for a channel. Brand glyphs (GitHub, LinkedIn, ORCID)
 * were removed from lucide-react, so we render compact styled text marks for
 * those and keep the real Mail icon for email.
 */
function ChannelIcon({
  icon,
  className,
}: {
  icon: SocialLink["icon"];
  className?: string;
}) {
  if (icon === "mail") return <Mail className={className} aria-hidden />;

  // Brand marks rendered as monospace badges.
  const mark = icon === "github" ? "GH" : icon === "linkedin" ? "in" : "iD";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[0.25em] bg-primary/15 font-mono text-[0.58em] font-bold leading-none tracking-tight",
        className,
      )}
      aria-hidden
    >
      {mark}
    </span>
  );
}

/**
 * Terminal transcript that "types" TERMINAL_LINES sequentially when scrolled
 * into view. Each line shows a `>` prompt, the command, then the output on a
 * new line. A blinking cursor block sits at the end.
 */
function TerminalTranscript() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  // Number of lines revealed so far — advances on a timer once in view.
  const [count, setCount] = React.useState(0);
  const shown = reduce ? TERMINAL_LINES.length : count;

  React.useEffect(() => {
    if (!inView || reduce) return;
    if (count >= TERMINAL_LINES.length) return;
    const t = window.setTimeout(
      () => setCount((c) => c + 1),
      count === 0 ? 260 : 760,
    );
    return () => window.clearTimeout(t);
  }, [inView, count, reduce]);

  const done = shown >= TERMINAL_LINES.length;

  return (
    <div
      ref={ref}
      className="relative scanlines min-h-[14rem] overflow-hidden rounded-xl border border-border/60 bg-background/70 p-5 font-mono text-sm leading-relaxed text-foreground/90 md:p-6"
    >
      {/* Window chrome */}
      <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Terminal className="size-3.5" aria-hidden />
          transmission.log
        </span>
      </div>

      <div className="space-y-1.5">
        {TERMINAL_LINES.map((line, i) => {
          const visible = i < shown;
          return (
            <motion.div
              key={line.cmd}
              initial={false}
              animate={
                reduce
                  ? undefined
                  : visible
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 6 }
              }
              transition={{ duration: 0.32, ease: EASE }}
              className={cn(!visible && "pointer-events-none")}
              aria-hidden={!visible}
            >
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="select-none text-success">&gt;</span>
                <span className="text-primary">{line.cmd}</span>
              </p>
              <p className="pl-4 text-text-soft">{line.out}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Blinking cursor — appears once the transcript finishes (or immediately under reduced motion) */}
      <span
        className={cn(
          "mt-2 inline-block h-4 w-[0.6ch] translate-y-[2px] bg-primary align-middle",
          (done || reduce) ? "animate-blink" : "opacity-0",
        )}
        aria-hidden
      />
    </div>
  );
}

/** A single contact-channel glass button. */
function ChannelCard({ link }: { link: SocialLink }) {
  const isMail = link.icon === "mail";
  return (
    <StaggerItem className="h-full">
      <Magnetic strength={0.25} className="h-full w-full">
        <GlassCard
          tilt
          glow
          className={cn(
            "group flex h-full w-full flex-col items-start gap-3 p-5",
            "transition-colors hover:border-primary/50",
          )}
        >
          <a
            href={link.href}
            target={isMail ? undefined : "_blank"}
            rel={isMail ? undefined : "noopener noreferrer"}
            aria-label={link.label}
            className="contents"
          >
          <div className="flex w-full items-center justify-between">
            <span className="inline-flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <ChannelIcon icon={link.icon} className="size-5" />
            </span>
            <ArrowRight
              className="size-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden
            />
          </div>
          <div className="space-y-1">
            <p className="font-display text-base font-semibold text-foreground">
              {link.label}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {link.href && link.href !== "#"
                ? link.href.replace(/^mailto:/, "")
                : "set link"}
            </p>
          </div>
            {link.placeholder ? (
              <Badge variant="warning" className="mt-auto">
                {link.icon === "mail" ? "verify" : "set link"}
              </Badge>
            ) : null}
          </a>
        </GlassCard>
      </Magnetic>
    </StaggerItem>
  );
}

/** Lightweight accessible form that builds a mailto: link — no backend. */
function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  const subject = `Portfolio transmission — ${name || "New connection"}`;
  const body = `${message}${email ? `\n\n— ${name} (${email})` : ""}`;
  const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <GlassCard className="flex flex-col gap-4 p-5 md:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="h-10 w-full rounded-md border border-border bg-background/60 px-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="h-10 w-full rounded-md border border-border bg-background/60 px-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Encode your message here..."
          className="w-full resize-none rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <Button asChild variant="glow" size="lg" className="mt-1 w-full sm:w-auto">
        <a href={mailto}>
          <Mail className="size-4" aria-hidden />
          Compose in mail
        </a>
      </Button>
    </GlassCard>
  );
}

export default function ContactSection() {
  return (
    <section id="contact" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          index="08"
          station="Final Transmission"
          title="Open a channel"
          subtitle="System online and receiving. Pick a frequency below or encode a direct message — every transmission is read."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Left column: terminal transcript + channels */}
          <div className="flex flex-col gap-6">
            <Reveal>
              <TerminalTranscript />
            </Reveal>

            <StaggerGroup
              className="grid gap-4 sm:grid-cols-2"
              stagger={0.08}
            >
              {SOCIAL_LINKS.map((link) => (
                <ChannelCard key={link.id} link={link} />
              ))}
            </StaggerGroup>

            {/* Resume link */}
            <Reveal>
              <Magnetic strength={0.3} className="inline-flex w-full sm:w-auto">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <a
                    href={SITE.resumeUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!SITE.resumeUrl}
                    onClick={(e) => {
                      if (!SITE.resumeUrl) e.preventDefault();
                    }}
                  >
                    <FileText className="size-4" aria-hidden />
                    {SITE.resumeUrl ? "View Résumé" : "Résumé pending"}
                  </a>
                </Button>
              </Magnetic>
            </Reveal>
          </div>

          {/* Right column: contact form + primary CTA */}
          <div className="flex flex-col gap-6">
            <Reveal delay={0.05}>
              <ContactForm />
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  direct transmission
                </p>
                <Magnetic strength={0.4}>
                  <Button asChild variant="glow" size="lg" className="px-8">
                    <a href={`mailto:${SITE.email}`}>
                      <ArrowRight className="size-4" aria-hidden />
                      Send Transmission
                    </a>
                  </Button>
                </Magnetic>
                <p className="font-mono text-sm text-text-soft">
                  {SITE.email}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
