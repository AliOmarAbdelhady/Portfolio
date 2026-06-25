"use client";

import { useScroll, type MotionValue } from "motion/react";

/**
 * Returns a MotionValue (0..1) of total page scroll progress.
 * Bind it to a transform (e.g. scaleX) for a zero-rerender progress bar.
 * Works alongside Lenis because Lenis drives native scroll.
 */
export function useScrollProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
}
