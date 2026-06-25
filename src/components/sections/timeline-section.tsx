"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { TIMELINE, type TimelineItem } from "@/data/timeline";

/**
 * The center rail draws itself downward as the timeline scrolls into view.
 * We track the section's scroll progress and map it to a scaleY on the line's
 * "fill" gradient. Reduced-motion users get a fully drawn, static line.
 */
function ProgressiveRail({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Bias the drawing so the line fills as the rail passes through the viewport.
    offset: ["start 85%", "end 60%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      className="pointer-events-none absolute left-4 top-0 h-full w-px md:left-1/2 md:-translate-x-1/2"
      aria-hidden="true"
    >
      {/* Base track (dim, full height) */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-border to-primary/10" />
      {/* Glowing fill that draws with scroll. transformOrigin top so it grows downward. */}
      {reduce ? (
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-accent/70 to-tertiary/70" />
      ) : (
        <motion.div
          style={{ scaleY, transformOrigin: "top" }}
          className="absolute inset-0 bg-gradient-to-b from-primary/80 via-accent/70 to-tertiary/80 shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
        />
      )}
    </div>
  );
}

/**
 * Explicit accent → class map. Tailwind needs complete class literals to emit
 * them, so we cannot interpolate `bg-${accent}`. Each value is a real token.
 */
const ACCENT_DOT_CLASS: Record<TimelineItem["accent"], string> = {
  primary: "bg-primary",
  secondary: "bg-secondary-foreground",
  tertiary: "bg-tertiary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Glowing node dot that sits on the rail. Color matches the item's accent. */
function TimelineDot({ accent }: { accent: TimelineItem["accent"] }) {
  const color = ACCENT_DOT_CLASS[accent];
  return (
    <span
      className="pointer-events-none relative flex h-4 w-4 items-center justify-center"
      aria-hidden="true"
    >
      {/* Outer halo */}
      <span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-60 blur-[3px]",
          color,
        )}
      />
      {/* Core */}
      <span
        className={cn(
          "relative inline-flex h-2.5 w-2.5 rounded-full ring-2 ring-background",
          color,
        )}
      />
    </span>
  );
}

/** Map an accent token to a Badge variant so tags share the node's hue. */
const ACCENT_BADGE_VARIANT: Record<
  TimelineItem["accent"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  primary: "default",
  secondary: "secondary",
  tertiary: "tertiary",
  success: "success",
  warning: "warning",
  danger: "danger",
};

/** One timeline entry: node + card. Alternates sides on md+ via the `flip` prop. */
function TimelineEntry({
  item,
  index,
  flip,
}: {
  item: TimelineItem;
  index: number;
  flip: boolean;
}) {
  return (
    <li className="relative flex w-full md:grid md:grid-cols-2 md:gap-12">
      {/* --- Node (rail-anchored) --- */}
      <div className="absolute left-4 top-1 z-10 -translate-x-1/2 md:left-1/2">
        <TimelineDot accent={item.accent} />
      </div>

      {/* --- Card --- */}
      <Reveal
        delay={0.05 * index}
        y={32}
        className={cn(
          "w-full pl-12 md:pl-0",
          // On md+, push to the opposite column from the dot side and align.
          flip ? "md:col-start-2 md:pl-0" : "md:col-start-1 md:pr-12 md:text-right",
        )}
      >
        <GlassCard className="p-5 md:p-6">
          <div
            className={cn(
              "flex flex-col gap-2",
              flip ? "md:items-start" : "md:items-end md:text-right",
            )}
          >
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {item.period}
            </span>
            <h3 className="font-display text-lg font-bold leading-tight text-foreground md:text-xl">
              {item.title}
            </h3>
            <p className="font-mono text-xs text-muted-foreground">{item.org}</p>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-text-soft">
            {item.description}
          </p>

          <div
            className={cn(
              "mt-4 flex flex-wrap gap-1.5",
              flip ? "md:justify-start" : "md:justify-end",
            )}
          >
            {item.tags.map((tag) => (
              <Badge key={tag} variant={ACCENT_BADGE_VARIANT[item.accent]}>
                {tag}
              </Badge>
            ))}
          </div>
        </GlassCard>
      </Reveal>
    </li>
  );
}

/**
 * TimelineSection — "Timeline Road" (station 07).
 *
 * Vertical journey timeline. Center gradient rail on md+ with alternating
 * left/right cards; a left rail on mobile. Each node is a glowing accent dot
 * on the line, paired with a GlassCard (period, title, org, description, tags).
 * The connecting line draws progressively with scroll, cards reveal on enter.
 */
export default function TimelineSection() {
  const railRef = React.useRef<HTMLDivElement>(null);

  return (
    <section id="timeline" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          index="07"
          station="Timeline Road"
          title={
            <>
              The road so <span className="text-gradient">far</span>
            </>
          }
          subtitle="Milestones along the journey — education, research, and the systems shipped in between."
        />

        {/* Timeline body. The rail lives inside this scroll-tracked wrapper. */}
        <div ref={railRef} className="relative mt-14 md:mt-16">
          <ProgressiveRail containerRef={railRef} />

          <ol className="relative flex flex-col gap-10 md:gap-14">
            {TIMELINE.map((item, i) => (
              <TimelineEntry
                key={item.id}
                item={item}
                index={i}
                flip={i % 2 === 1}
              />
            ))}
          </ol>
        </div>

        {/* Honest, subtle note: education is real, milestones are representative. */}
        <Reveal delay={0.1}>
          <p className="mt-12 max-w-2xl text-xs leading-relaxed text-muted-foreground/80 md:text-sm">
            <span className="font-mono text-muted-foreground">note —</span>{" "}
            Education is verifiable; the milestone entries above are
            representative of focus areas and may not reflect exact dates.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
