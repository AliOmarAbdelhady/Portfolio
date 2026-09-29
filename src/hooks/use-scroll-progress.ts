"use client";

import { useEffect } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

import { cinema, subscribeCinema } from "@/lib/cinema-scroll";

/**
 * Returns a MotionValue (0..1) of total virtual scroll progress.
 * Bind it to a transform (e.g. scaleX) for a zero-rerender progress bar.
 * The cinema-scroll controller notifies on every damped frame; motion
 * interpolates the value without React re-renders.
 */
export function useScrollProgress(): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    progress.set(cinema.progress);
    return subscribeCinema(() => progress.set(cinema.progress));
  }, [progress]);

  return progress;
}
