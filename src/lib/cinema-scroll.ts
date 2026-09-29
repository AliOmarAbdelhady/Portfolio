/**
 * Cinema-scroll engine state — module singleton shared between the virtual
 * scroll controller and every consumer (navbar, progress bar, 3D camera).
 *
 * Kept OUTSIDE React on purpose: the WebGL render loop (useFrame) and the
 * rAF damping loop read/write these values every frame without triggering
 * React re-renders. React consumers subscribe via `subscribe()` and translate
 * notifications into MotionValues/state at their own cadence.
 *
 * The model is a "virtual document scroll": the page has NO native scrollbar.
 * Wheel / touch / keyboard input accumulates into `target`; the controller
 * damps `y` toward it each frame and translates the DOM track by `-y`. That
 * means everything that worked with real scroll (IntersectionObserver
 * reveals, scroll-spy, per-section layout) keeps working unchanged — the
 * sections physically travel through the viewport.
 */

export type CinemaListener = () => void;

export const cinema = {
  /** Damped virtual scroll position in px (0..limit). */
  y: 0,
  /** Where the visitor wants to be (input accumulator). */
  target: 0,
  /** px per frame — feeds the 3D camera's speed-reactive effects. */
  velocity: 0,
  /** track height − viewport height. */
  limit: 0,
  /** y / limit (0..1) — the value the 3D camera travels along the road. */
  progress: 0,
  /** True while a programmatic glide (nav jump) is running. */
  animating: false,
};

const listeners = new Set<CinemaListener>();

/** Subscribe to per-frame cinema updates. Returns an unsubscribe fn. */
export function subscribeCinema(fn: CinemaListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn();
}

/** Clamp helper. */
export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Remeasure after layout/resize. `trackHeight` is the full unstretched height. */
export function measureCinema(trackHeight: number) {
  const vh =
    typeof window === "undefined" ? 0 : window.visualViewport?.height ?? window.innerHeight;
  cinema.limit = Math.max(0, trackHeight - vh);
  cinema.target = clamp(cinema.target, 0, cinema.limit);
  cinema.progress = cinema.limit > 0 ? clamp(cinema.y / cinema.limit, 0, 1) : 0;
  notify();
}

/** User input entry point (wheel/touch/keys): shift the target by a delta. */
export function cinemaScrollBy(delta: number) {
  cinema.target = clamp(cinema.target + delta, 0, cinema.limit);
  notify();
}

/** Programmatic jump (nav links, command palette, hash). */
export function cinemaScrollTo(y: number, immediate = false) {
  cinema.target = clamp(y, 0, cinema.limit);
  cinema.animating = true;
  if (immediate) {
    cinema.y = cinema.target;
    cinema.velocity = 0;
    cinema.animating = false;
  }
  notify();
}

/**
 * One damping step — called from the controller's rAF loop. Returns true
 * while still moving (so the loop can keep requesting frames only when
 * needed). Frame-rate independent exponential damping.
 */
export function stepCinema(dt: number, reducedMotion: boolean): boolean {
  const delta = cinema.target - cinema.y;
  if (Math.abs(delta) < 0.1 && Math.abs(cinema.velocity) < 0.1) {
    if (cinema.velocity !== 0) cinema.velocity = 0;
    cinema.animating = false;
    return false;
  }
  if (reducedMotion) {
    cinema.y = cinema.target;
    cinema.velocity = 0;
    cinema.animating = false;
  } else {
    // k = 7 → glide that feels like the Lenis ease this site was tuned for.
    const t = 1 - Math.exp(-7 * dt);
    const next = cinema.y + delta * t;
    cinema.velocity = next - cinema.y;
    cinema.y = next;
  }
  cinema.progress = cinema.limit > 0 ? clamp(cinema.y / cinema.limit, 0, 1) : 0;
  notify();
  return true;
}
