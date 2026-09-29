"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { useLayerActive } from "@/components/layout/cinema-scroll";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** delay in seconds */
  delay?: number;
  /** initial Y offset in px */
  y?: number;
  /** animate only once vs every enter */
  once?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Layer-arrival reveal. Animates opacity + translate + blur when the cinema
 * camera is inside the section that owns this element — the dolly equivalent
 * of a scroll reveal. Collapses to a plain element under reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const active = useLayerActive(ref);
  const Comp = motion[as as "div"] as typeof motion.div;

  // `once` is kept for API compatibility; in cinema mode reveals replay when
  // the camera re-enters a layer, which is the intended station behaviour.
  const state = active
    ? { opacity: 1, y: 0, filter: "blur(0px)" }
    : { opacity: 0, y, filter: "blur(8px)" };

  if (reduce) {
    const Tag = as as unknown as React.ComponentType<
      React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
    >;
    return (
      <Tag ref={ref} className={className}>
        {children}
      </Tag>
    );
  }

  return (
    <Comp
      ref={ref}
      className={className}
      initial={false}
      animate={state}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

type StaggerGroupProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
};

/** Parent that staggers the entrance of its <StaggerItem> children. */
export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
}: StaggerGroupProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const active = useLayerActive(ref);
  if (reduce) return <div ref={ref} className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.6, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
