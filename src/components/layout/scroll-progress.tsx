"use client";

import { motion } from "motion/react";

import { useScrollProgress } from "@/hooks/use-scroll-progress";

/**
 * Thin gradient progress bar pinned to the very top of the viewport.
 * Bound directly to a MotionValue (zero re-renders).
 */
export function ScrollProgress() {
  const progress = useScrollProgress();
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[80] h-[3px] origin-left bg-gradient-to-r from-primary via-tertiary to-accent shadow-[0_0_12px_var(--primary-glow)]"
      style={{ scaleX: progress }}
    />
  );
}
