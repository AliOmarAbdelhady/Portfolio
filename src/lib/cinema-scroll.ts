/**
 * Cinema-scroll engine state — module singleton shared between the virtual
 * camera controller and every consumer (navbar, progress bar, 3D camera).
 *
 * Kept OUTSIDE React on purpose: the WebGL render loop (useFrame) and the
 * rAF damping loop read/write these values every frame without triggering
 * React re-renders. React consumers subscribe via `subscribe()` and translate
 * notifications into MotionValues/state at their own cadence.
 *
 * DOLLY MODEL — the page is not scrolled, it is entered:
 *   Every section (and the footer) is a full-screen DEPTH LAYER. A single
 *   depth value `g` (in viewport units) is the camera position along the
 *   road. Layer i owns a depth window:
 *
 *     [ b_i , b_i + dwell_i ]  dwell: layer sits at 1:1; taller-than-viewport
 *                              content pans INSIDE the layer ("being in it")
 *     [b_i + dwell_i, b_i + dwell_i + T]  depart/approach band shared with
 *                              the next layer: the current layer scales up
 *                              past the screen edges and fades while the next
 *                              emerges from the centre — flying through.
 *
 * Input (wheel/touch/keys) accumulates into `target`; the controller damps
 * `g` toward it each frame and paints every layer's scale/translate/opacity
 * from the plan below. One synced value drives the DOM, the 3D camera
 * (`scrollState`), the progress bar and the scroll-spy.
 */

export type CinemaListener = () => void;

/** Width of the shared depart/approach band, in viewport units. */
export const TRANSITION = 0.6;
/** Every layer holds at 1:1 for at least this long before departing. */
export const MIN_DWELL = 0.15;

type LayerPlan = {
  id: string;
  el: HTMLElement;
  /** natural content height in px (measured, transform-independent). */
  height: number;
  /** depth where the layer is centred at 1:1 (pan starts). */
  b: number;
  /** dwell length in viewport units (pan + hold). */
  dwell: number;
  /** pan travel in px for content taller than the viewport. */
  panPx: number;
};

export const cinema = {
  /** Damped camera depth in viewport units (0..total). */
  y: 0,
  /** Where the visitor wants to be (input accumulator). */
  target: 0,
  /** Viewport units per frame — feeds the 3D camera's speed effects. */
  velocity: 0,
  /** Total travelable depth. */
  limit: 0,
  /** y / limit (0..1) — the value the 3D camera flies along the road. */
  progress: 0,
  /** Section id the camera is currently "inside" (scroll-spy + reveals). */
  activeId: null as string | null,
  /** Depth plan per layer (set by the controller on measure). */
  layers: [] as LayerPlan[],
};

// Debug/testing handle — lets the browser console (and automated checks)
// inspect the camera without reaching into module internals.
if (typeof window !== "undefined") {
  (window as unknown as { __cinema: typeof cinema }).__cinema = cinema;
}

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

/* ------------------------------ depth plan ------------------------------- */

/**
 * (Re)build the depth plan from the live layer elements. Called on mount,
 * resize, and whenever a layer's height changes (filters collapsing grids,
 * accordions, images loading).
 *
 * Re-measures NEVER re-anchor the camera absolutely — that would snap the
 * scene whenever a filter re-layouts a section. Instead the camera keeps its
 * relative position inside the layer it is currently in (same fraction of
 * that layer's dwell), and an in-flight glide is preserved.
 */
export function planCinema(layers: HTMLElement[]) {
  const vh =
    typeof window === "undefined" ? 0 : window.visualViewport?.height ?? window.innerHeight;
  const firstPlan = cinema.layers.length === 0 || cinema.limit === 0;

  // Where were we inside the old plan? Prefer the active layer; fall back to
  // whichever layer's window contains the camera.
  const prev =
    cinema.layers.find((L) => L.id === cinema.activeId) ||
    cinema.layers.find((L) => cinema.y >= L.b - TRANSITION && cinema.y <= L.b + L.dwell + TRANSITION) ||
    null;
  const anchor =
    prev && prev.dwell > 0
      ? { id: prev.id, frac: clamp((cinema.y - prev.b) / prev.dwell, 0, 1) }
      : prev
        ? { id: prev.id, frac: 0 }
        : null;
  const settled = Math.abs(cinema.target - cinema.y) < 0.01;

  let b = 0;
  cinema.layers = layers.map((el) => {
    const height = el.offsetHeight;
    const panPx = Math.max(0, height - vh);
    const dwell = MIN_DWELL + (vh > 0 ? panPx / vh : 0);
    const plan: LayerPlan = { id: el.id || "", el, height, b, dwell, panPx };
    b += dwell + TRANSITION;
    return plan;
  });
  // The last layer has no depart band.
  cinema.limit = Math.max(0, b - (cinema.layers.length > 0 ? TRANSITION : 0));

  if (firstPlan) {
    cinema.y = 0;
    cinema.target = 0;
  } else {
    // Glue the camera to the same relative spot inside its (possibly
    // re-measured) layer so filter re-layouts never jolt the scene.
    const anchorLayer = anchor ? cinema.layers.find((L) => L.id === anchor.id) : null;
    if (anchorLayer && anchor) {
      cinema.y = anchorLayer.b + anchor.frac * anchorLayer.dwell;
    } else {
      cinema.y = clamp(cinema.y, 0, cinema.limit);
    }
    cinema.target = settled ? cinema.y : clamp(cinema.target, 0, cinema.limit);
  }

  cinema.progress = cinema.limit > 0 ? clamp(cinema.y / cinema.limit, 0, 1) : 0;
  updateActive();
  notify();
}

function updateActive() {
  const { y, layers } = cinema;
  let active: string | null = layers[0]?.id ?? null;
  for (let i = 0; i < layers.length; i++) {
    const L = layers[i];
    const dwellEnd = L.b + L.dwell;
    if (y >= L.b && y < dwellEnd) {
      active = L.id;
      break;
    }
    if (y >= dwellEnd && y < dwellEnd + TRANSITION) {
      // Transition band: incoming owns the second half.
      active = y - dwellEnd > TRANSITION / 2 ? layers[i + 1]?.id ?? L.id : L.id;
      break;
    }
  }
  cinema.activeId = active;
}

/** Layer lookup by element id (sections + footer). */
export function findLayer(id: string): LayerPlan | undefined {
  return cinema.layers.find((L) => L.id === id);
}

/* -------------------------------- input ---------------------------------- */

/** User input entry point (wheel/touch/keys): shift the camera depth. */
export function cinemaScrollBy(delta: number) {
  cinema.target = clamp(cinema.target + delta, 0, cinema.limit);
  notify();
}

/** Programmatic depth jump (nav, palette, hash, PageUp/Down). */
export function cinemaScrollTo(depth: number, immediate = false) {
  cinema.target = clamp(depth, 0, cinema.limit);
  if (immediate) {
    cinema.y = cinema.target;
    cinema.velocity = 0;
    updateActive();
    notify();
  } else {
    notify();
  }
}

/** Glide the camera to a section/footer layer by id — lands at its 1:1 spot. */
export function cinemaGotoLayer(id: string, immediate = false) {
  const L = findLayer(id);
  if (L) cinemaScrollTo(L.b, immediate);
}

/** Next / previous layer boundary for PageDown/Space/PageUp. */
export function cinemaStepLayer(direction: 1 | -1) {
  const { layers } = cinema;
  if (layers.length === 0) return;
  // Compare against where the camera is HEADED, so rapid key presses keep
  // advancing instead of re-targeting a station the glide hasn't reached.
  const cur = Math.max(cinema.y, cinema.target);
  const curMin = Math.min(cinema.y, cinema.target);
  if (direction === 1) {
    const next = layers.find((L) => L.b > cur + 0.05);
    cinemaScrollTo(next ? next.b : cinema.limit);
  } else {
    const prev = [...layers].reverse().find((L) => L.b < curMin - 0.35);
    cinemaScrollTo(prev ? prev.b : 0);
  }
}

/**
 * One damping step — called from the controller's rAF loop. Returns true
 * while still moving (so frames are only requested while in flight).
 */
export function stepCinema(dt: number, reducedMotion: boolean): boolean {
  const delta = cinema.target - cinema.y;
  if (Math.abs(delta) < 0.0005 && Math.abs(cinema.velocity) < 0.00005) {
    if (cinema.velocity !== 0) cinema.velocity = 0;
    return false;
  }
  if (reducedMotion) {
    cinema.y = cinema.target;
    cinema.velocity = 0;
  } else {
    // Frame-rate independent exponential damping toward the target depth.
    const t = 1 - Math.exp(-6.5 * dt);
    const next = cinema.y + delta * t;
    cinema.velocity = next - cinema.y;
    cinema.y = next;
  }
  cinema.progress = cinema.limit > 0 ? clamp(cinema.y / cinema.limit, 0, 1) : 0;
  updateActive();
  notify();
  return true;
}
