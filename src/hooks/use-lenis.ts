"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { scrollState, attachPointer, lenisInstance } from "@/lib/runtime-state";

/**
 * Boot the smooth-scroll engine.
 *
 * - Lenis provides buttery wheel/touch smoothing over NATIVE scroll (so anchor
 *   links, hash routing, and motion's useScroll keep working).
 * - We pipe Lenis into GSAP's ticker and notify ScrollTrigger on every frame.
 * - Total page progress is written into the shared scrollState so the 3D camera
 *   rig can read it without React re-renders.
 * - Disabled entirely when the user prefers reduced motion.
 */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      lerp: 0.1,
    });
    lenisInstance.current = lenis;

    const updateLimit = () => {
      scrollState.limit = document.documentElement.scrollHeight - window.innerHeight;
    };
    updateLimit();

    lenis.on("scroll", ({ scroll, velocity, limit }: { scroll: number; velocity: number; limit: number }) => {
      scrollState.y = scroll;
      scrollState.velocity = velocity;
      scrollState.limit = limit;
      scrollState.progress = limit > 0 ? scroll / limit : 0;
      ScrollTrigger.update();
    });

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      updateLimit();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    const detachPointer = attachPointer();

    // Refresh once everything (fonts/images) has settled.
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 400);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(raf);
      detachPointer();
      lenisInstance.current = null;
      lenis.destroy();
    };
  }, [enabled]);
}
