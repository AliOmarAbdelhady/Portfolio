/**
 * Module-singleton runtime state shared between the smooth-scroll layer and the
 * WebGL scene. Kept OUTSIDE React so the 3D render loop (useFrame) can read it
 * every frame without triggering re-renders.
 *
 * - scrollState: total page progress (0..1), raw scrollY, velocity.
 * - pointerState: normalized (-1..1) + pixel pointer position.
 */

import type Lenis from "lenis";

/**
 * Holds the active Lenis instance so non-React callers (the `scrollToSection`
 * util used by nav links / CTAs) can drive smooth, eased scrolling.
 */
export const lenisInstance: { current: Lenis | null } = { current: null };

export const scrollState = {
  progress: 0,
  y: 0,
  velocity: 0,
  /** document height minus viewport, for normalisation */
  limit: 0,
};

export const pointerState = {
  x: 0,
  y: 0,
  /** normalized to [-1, 1] */
  nx: 0,
  ny: 0,
};

let pointerAttached = false;

/** Attach a single passive pointermove listener. Returns a cleanup fn. */
export function attachPointer(): () => void {
  if (pointerAttached || typeof window === "undefined") return () => {};
  pointerAttached = true;

  const handler = (e: PointerEvent) => {
    const { innerWidth: w, innerHeight: h } = window;
    pointerState.x = e.clientX;
    pointerState.y = e.clientY;
    pointerState.nx = w > 0 ? (e.clientX / w) * 2 - 1 : 0;
    pointerState.ny = h > 0 ? (e.clientY / h) * 2 - 1 : 0;
  };

  window.addEventListener("pointermove", handler, { passive: true });
  return () => {
    window.removeEventListener("pointermove", handler);
    pointerAttached = false;
  };
}
