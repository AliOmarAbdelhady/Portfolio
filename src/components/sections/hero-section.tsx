"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ArrowRight, ChevronDown, FileText } from "lucide-react";
import { Github } from "@/components/ui/brand-icons";

import { SITE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic-button";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ROLE_CYCLE_MS = 2200;

/** Staggered entrance — fade-up on mount (above the fold, so not whileInView). */
function useEntranceVariants(reduce: boolean | null): Variants {
  if (reduce) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    };
  }
  return {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.7,
        delay: 0.15 + i * 0.12,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function HeroSection() {
  const reduce = useReducedMotion();
  const variants = useEntranceVariants(reduce);

  // Rotating role line.
  const [roleIndex, setRoleIndex] = React.useState(0);
  React.useEffect(() => {
    if (reduce) return; // static first role under reduced motion
    const id = window.setInterval(() => {
      setRoleIndex((i) => (i + 1) % SITE.roles.length);
    }, ROLE_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  const resumeHref = SITE.resumeUrl?.trim() ? SITE.resumeUrl : "#contact";

  return (
    <section
      id="hero"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden scroll-mt-24"
    >
      {/* Soft radial backdrop for legibility above the 3D road — keeps the
          scene visible while letting the hero text breathe. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,color-mix(in_oklab,var(--background)_72%,transparent),transparent_70%)]"
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-32 text-center">
        {/* Status badge */}
        <motion.div
          variants={variants}
          custom={0}
          initial="hidden"
          animate="visible"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 font-orbitron text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-primary" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            System Online · Neural Road Active
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={variants}
          custom={1}
          initial="hidden"
          animate="visible"
          className="mt-8 font-display text-6xl font-bold leading-[0.95] tracking-tight text-glow md:text-8xl"
        >
          <span className="text-gradient">{SITE.firstName}</span>{" "}
          <span className="text-foreground">Omar</span>
        </motion.h1>

        {/* Rotating role line */}
        <motion.div
          variants={variants}
          custom={2}
          initial="hidden"
          animate="visible"
          className="mt-5 flex h-7 items-center justify-center font-mono text-sm text-primary md:text-base"
        >
          <span className="mr-2 text-text-soft">{"//"}</span>
          <span className="relative inline-flex overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={roleIndex}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block font-semibold tracking-wide"
              >
                {SITE.roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.p
          variants={variants}
          custom={3}
          initial="hidden"
          animate="visible"
          className="mt-6 max-w-2xl text-balance text-base text-muted-foreground md:text-lg"
        >
          {SITE.headline}
        </motion.p>

        {/* CTA row */}
        <motion.div
          variants={variants}
          custom={4}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic strength={0.4}>
            <Button
              variant="glow"
              size="lg"
              data-cursor="view"
              onClick={() => {
                document
                  .getElementById("projects")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore Projects
              <ArrowRight className="ml-0.5" />
            </Button>
          </Magnetic>

          <Magnetic strength={0.4}>
            <Button variant="outline" size="lg" asChild>
              <a
                href={SITE.githubUrl}
                target="_blank"
                rel="noreferrer"
                data-cursor="link"
              >
                <Github />
                Open GitHub
              </a>
            </Button>
          </Magnetic>

          <Magnetic strength={0.4}>
            <Button variant="ghost" size="lg" asChild>
              <a
                href={resumeHref}
                {...(SITE.resumeUrl?.trim()
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                data-cursor="link"
              >
                <FileText />
                View Resume
              </a>
            </Button>
          </Magnetic>
        </motion.div>

        {/* Scroll cue */}
        <motion.button
          type="button"
          variants={variants}
          custom={5}
          initial="hidden"
          animate="visible"
          onClick={() =>
            document
              .getElementById("about")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          aria-label="Scroll to about section"
          className="group mt-16 flex flex-col items-center gap-2 text-text-soft transition-colors hover:text-primary"
        >
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.3em]">
            Scroll
          </span>
          <ChevronDown
            className={
              reduce
                ? "h-4 w-4"
                : "h-4 w-4 animate-bounce transition-transform group-hover:translate-y-0.5"
            }
          />
        </motion.button>
      </div>
    </section>
  );
}
