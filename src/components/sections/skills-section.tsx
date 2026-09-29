"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  SKILL_CATEGORIES,
  ALL_SKILLS,
  type SkillCategory,
} from "@/data/skills";

/** Map a category accent token to a Tailwind indicator background class. */
const ACCENT_TO_BAR: Record<
  SkillCategory["accent"],
  string
> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  tertiary: "bg-tertiary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

/** Map accent token to a soft ring/text tint for the orbit chips. */
const ACCENT_TO_RING: Record<SkillCategory["accent"], string> = {
  primary: "border-primary/40 text-primary",
  secondary: "border-secondary/40 text-secondary",
  tertiary: "border-tertiary/40 text-tertiary",
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  danger: "border-danger/40 text-danger",
};

/**
 * A spread of representative skill labels drawn from across every category,
 * used to decorate the orbit visual (desktop only).
 */
const ORBIT_SKILLS: string[] = ALL_SKILLS.filter((_, i) => i % 4 === 1).slice(
  0,
  9,
);

export default function SkillsSection() {
  const reduce = useReducedMotion();
  const [active, setActive] = React.useState(SKILL_CATEGORIES[0].id);

  return (
    <section id="skills" className="relative scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading
          index="02"
          station="Orbit Station"
          title="Skill Constellation"
          subtitle="A breakdown of the technologies, frameworks, and disciplines I work with across languages, AI, robotics, web, and data."
        />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          {/* ---------- Tabs + skill rows ---------- */}
          <Reveal delay={0.05} className="lg:sticky lg:top-24">
            <Tabs
              value={active}
              onValueChange={setActive}
              className="w-full"
            >
              <TabsList className="flex w-full flex-wrap justify-start gap-1">
                {SKILL_CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id}>
                    {cat.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {SKILL_CATEGORIES.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-6">
                  <AnimatePresence mode="wait">
                    {active === cat.id ? (
                      <motion.div
                        key={cat.id}
                        initial={reduce ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2"
                      >
                        {cat.skills.map((skill) => (
                          <div
                            key={skill.name}
                            className="flex flex-col gap-1.5"
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-sm font-medium text-foreground">
                                {skill.name}
                              </span>
                              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                                {skill.level}%
                              </span>
                            </div>
                            <Progress
                              value={skill.level}
                              indicatorClassName={cn(
                                ACCENT_TO_BAR[cat.accent],
                              )}
                            />
                          </div>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </TabsContent>
              ))}
            </Tabs>
          </Reveal>

          {/* ---------- Decorative orbit (desktop) / marquee (mobile) ---------- */}
          <Reveal delay={0.1}>
            {/* Desktop orbit */}
            <div className="pointer-events-none relative hidden aspect-square w-full max-w-md justify-self-center md:block">
              <SkillOrbit reduce={!!reduce} />
            </div>

            {/* Mobile marquee */}
            <div className="relative block w-full overflow-hidden md:hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
              <div
                className={cn(
                  "flex w-max gap-2",
                  !reduce && "animate-marquee",
                )}
              >
                {[...ALL_SKILLS, ...ALL_SKILLS].map((skill, i) => (
                  <span
                    key={`${skill}-${i}`}
                    className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface/70 px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Decorative spinning orbit: a centered ring with representative skill chips
 * placed around its edge at varying radii. The ring rotates with
 * `animate-spin-slow`; each chip counter-rotates so its label stays upright.
 */
function SkillOrbit({ reduce }: { reduce: boolean }) {
  const count = ORBIT_SKILLS.length;
  const ringDuration = 42; // seconds — slow, ambient

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Soft glow core */}
      <div className="absolute h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

      {/* Concentric guide rings */}
      <div className="absolute h-[92%] w-[92%] rounded-full border border-border/60" />
      <div className="absolute h-[64%] w-[64%] rounded-full border border-border/40" />
      <div className="absolute h-[36%] w-[36%] rounded-full border border-border/30" />

      {/* Rotating chip layer */}
      <div
        className="absolute h-[92%] w-[92%]"
        style={{
          animation: reduce
            ? undefined
            : `spin-slow ${ringDuration}s linear infinite`,
        }}
      >
        {ORBIT_SKILLS.map((label, i) => {
          const angle = (i / count) * Math.PI * 2;
          // Alternate between outer and inner radius for depth.
          const radiusPct = i % 2 === 0 ? 46 : 30;
          const x = 50 + Math.cos(angle) * radiusPct;
          const y = 50 + Math.sin(angle) * radiusPct;

          return (
            <Chip
              key={label}
              label={label}
              x={x}
              y={y}
              reduce={reduce}
              duration={ringDuration}
              index={i}
            />
          );
        })}
      </div>

      {/* Center label */}
      <div className="absolute flex flex-col items-center gap-1 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          stack
        </span>
        <span className="font-display text-lg font-semibold text-gradient">
          Core
        </span>
        <span className="text-[11px] text-text-soft">always in orbit</span>
      </div>
    </div>
  );
}

/**
 * A single orbiting chip. It is translated to its position on the rotating
 * layer, then counter-rotates at the same duration (offset by half its index
 * to keep it deterministic) so the label text remains upright while the ring
 * spins.
 */
function Chip({
  label,
  x,
  y,
  reduce,
  duration,
  index,
}: {
  label: string;
  x: number;
  y: number;
  reduce: boolean;
  duration: number;
  index: number;
}) {
  const accent = SKILL_CATEGORIES[index % SKILL_CATEGORIES.length].accent;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div
        style={{
          animation: reduce
            ? undefined
            : `spin-slow ${duration}s linear infinite reverse`,
          animationDelay: reduce ? undefined : `${-(index / 16) * duration}s`,
        }}
      >
        <span
          className={cn(
            "inline-flex items-center rounded-full border bg-card/80 px-2.5 py-1 font-mono text-[10px] backdrop-blur-md shadow-sm",
            ACCENT_TO_RING[accent],
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
