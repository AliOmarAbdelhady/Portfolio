"use client";

import * as React from "react";

import { scrollState, attachPointer } from "@/lib/runtime-state";
import {
  cinema,
  subscribeCinema,
  planCinema,
  clamp,
  stepCinema,
  cinemaScrollBy,
  cinemaScrollTo,
  cinemaGotoLayer,
  cinemaStepLayer,
  findLayer,
  TRANSITION,
} from "@/lib/cinema-scroll";

/**
 * CinemaScroll — the dolly camera. There is NO page scroll and no vertical
 * track: every section (and the footer) is a full-screen depth layer stacked
 * in the stage. A single damped depth value is the camera position.
 *
 * Paint per frame, per layer (see cinema-scroll.ts for the depth plan):
 *
 *   approach  scale 0.30 → 1.00, fading in  — the scene flies TOWARD you
 *   dwell     scale 1, content pans inside the layer when taller than the
 *             viewport — you are INSIDE the scene, not under it
 *   depart    scale grows past the screen edges + fade — the grids and
 *             buttons sweep off the monitor as you plunge deeper
 *
 * The 3D road camera, progress bar, navbar tint and scroll-spy all read the
 * same depth. Elements marked `data-cinema-prevent` (the AI chat) keep their
 * own native scrolling; gestures that start inside them are ignored.
 */

/** Context: id of the layer the camera is currently inside. Reveal
 *  animations gate on it (IntersectionObserver can't — every layer is
 *  technically "in viewport" at all times in this model). */
export const CinemaActiveContext = React.createContext<string | null>("hero");

/**
 * True while the camera is inside the layer that owns this element —
 * the cinema equivalent of "is in view". Callers pass a ref to any element
 * inside a section/footer; ownership is resolved once via closest().
 */
export function useLayerActive(
  ref: React.RefObject<HTMLElement | null>,
): boolean {
  const activeId = React.useContext(CinemaActiveContext);
  const [ownerId, setOwnerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const owner = ref.current?.closest("section, footer");
    setOwnerId(owner?.id || null);
  }, [ref]);

  return ownerId === null ? true : ownerId === activeId;
}

function insidePrevent(target: EventTarget | null): boolean {
  const el = target as Element | null;
  if (!el || typeof (el as Element).closest !== "function") return false;
  return !!(el as Element).closest("[data-cinema-prevent]");
}

function focusInEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

export function CinemaScroll({ children }: { children?: React.ReactNode }) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = React.useState<string | null>("hero");

  React.useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    html.classList.add("cinema-mode");

    /* ------------------------------ layers ------------------------------- */

    const collectLayers = (): HTMLElement[] => {
      const main = stage.querySelector("main");
      const sections = main ? Array.from(main.children) : [];
      const footer = Array.from(stage.children).filter(
        (el) => el.tagName === "FOOTER" || el.id === "footer",
      );
      return [...sections, ...footer] as HTMLElement[];
    };
    const layers = collectLayers();
    planCinema(layers);

    const measure = () => planCinema(collectLayers());
    const ro = new ResizeObserver(() => measure());
    layers.forEach((el) => ro.observe(el));
    window.addEventListener("resize", measure);
    // Late assets (fonts, avatars) change layout — remeasure once settled.
    const settle = window.setTimeout(measure, 900);

    /* -------------------------- deep link (#about) ---------------------- */

    if (window.location.hash) {
      const id = window.location.hash.replace(/^#/, "");
      if (findLayer(id)) cinemaGotoLayer(id, true);
    }

    /* ------------------------------- input ------------------------------ */

    const vh = () => window.visualViewport?.height ?? window.innerHeight;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || insidePrevent(e.target)) return; // pinch-zoom + chat
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 100 : e.deltaY;
      cinemaScrollBy(clamp(d / vh(), -0.6, 0.6) * 1.15);
    };

    let touchY = 0;
    let touchX = 0;
    let touchDepth = 0;
    let touchLocked = false;
    const onTouchStart = (e: TouchEvent) => {
      if (insidePrevent(e.target)) return;
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
      touchDepth = cinema.target;
      touchLocked = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (insidePrevent(e.target)) return;
      const dy = touchY - e.touches[0].clientY;
      const dx = Math.abs(touchX - e.touches[0].clientX);
      if (!touchLocked) {
        if (Math.abs(dy) < 8 || Math.abs(dy) <= dx) return;
        touchLocked = true;
      }
      e.preventDefault();
      cinema.target = clamp(touchDepth + (dy / vh()) * 1.5, 0, cinema.limit);
      cinemaScrollBy(0); // nudge: notify + kick without changing target twice
    };

    const onKey = (e: KeyboardEvent) => {
      if (focusInEditable(e.target) || insidePrevent(e.target)) return;
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); cinemaScrollBy(0.16); break;
        case "ArrowUp": e.preventDefault(); cinemaScrollBy(-0.16); break;
        case "PageDown": e.preventDefault(); cinemaStepLayer(1); break;
        case "PageUp": e.preventDefault(); cinemaStepLayer(-1); break;
        case " ": e.preventDefault(); cinemaStepLayer(e.shiftKey ? -1 : 1); break;
        case "Home": e.preventDefault(); cinemaScrollTo(0); break;
        case "End": e.preventDefault(); cinemaScrollTo(cinema.limit); break;
        default: return;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    /* ---------------------------- dolly loop ---------------------------- */
    // Frames while the glide is in flight; parked when settled. rAF is the
    // preferred clock; a timer takes over if the host starves rAF (hidden
    // panes, embedded webviews) so the camera never freezes mid-glide.

    let raf = 0;
    let timer = 0;
    let last = performance.now();
    let lastTick = 0;
    let idle = true;
    let lastActive: string | null = null;

    const scheduleNext = () => {
      raf = requestAnimationFrame((n) => tick(n));
      timer = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        timer = window.setTimeout(() => tick(performance.now()), 0);
      }, 120);
    };

    const tick = (now: number) => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      // Both clocks may fire for the same frame — take the first only.
      if (now - lastTick < 8) {
        scheduleNext();
        return;
      }
      lastTick = now;

      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const moving = stepCinema(dt, reducedMotion);
      paint();
      if (moving) scheduleNext();
      else idle = true;
    };

    /** Paint every layer from the current depth — the dolly itself. */
    const paint = () => {
      const g = cinema.y;
      const view = vh();

      for (let i = 0; i < cinema.layers.length; i++) {
        const L = cinema.layers[i];
        const dwellEnd = L.b + L.dwell;

        // Approach band (before the layer's 1:1 spot).
        const a = clamp((g - (L.b - TRANSITION)) / TRANSITION, 0, 1);
        // Depart band (after its dwell).
        const d = clamp((g - dwellEnd) / TRANSITION, 0, 1);
        // Internal pan while centred (taller-than-viewport content).
        const pan = L.dwell > 0 ? clamp((g - L.b) / L.dwell, 0, 1) : 0;

        const far = a === 0 || d === 1;

        // Visibility / interactivity / a11y for far layers.
        if (far) {
          if (L.el.dataset.cinemaNear === "1") {
            L.el.style.visibility = "hidden";
            L.el.style.pointerEvents = "none";
            L.el.setAttribute("aria-hidden", "true");
            (L.el as HTMLElement & { inert?: boolean }).inert = true;
            L.el.dataset.cinemaNear = "0";
          }
          continue;
        }
        if (L.el.dataset.cinemaNear !== "1") {
          L.el.style.visibility = "visible";
          L.el.style.pointerEvents = "auto";
          L.el.removeAttribute("aria-hidden");
          (L.el as HTMLElement & { inert?: boolean }).inert = false;
          L.el.dataset.cinemaNear = "1";
        }
        L.el.style.zIndex = String(i);

        // Scale: approach grows the scene toward you; depart multiplies it
        // past the screen edges as you plunge through.
        let scale = 0.3 + 0.7 * easeOutCubic(a);
        scale *= 1 + 2.6 * easeInCubic(d);
        // Opacity: fade in while approaching, fade out while departing.
        const inO = clamp((a - 0.25) / 0.75, 0, 1);
        const outO = Math.pow(1 - d, 1.25);
        const opacity = clamp(inO * outO, 0, 1);

        const ty = -Math.round(pan * L.panPx);
        L.el.style.transform = `translate3d(0, ${ty}px, 0) scale(${scale.toFixed(4)})`;
        L.el.style.opacity = opacity.toFixed(3);
      }

      // Mirror into the shared scrollState the WebGL camera reads per frame.
      scrollState.y = g * view;
      scrollState.velocity = cinema.velocity * view;
      scrollState.limit = cinema.limit * view;
      scrollState.progress = cinema.progress;

      if (cinema.activeId !== lastActive) {
        lastActive = cinema.activeId;
        setActiveId(cinema.activeId);
      }
    };

    const kick = () => {
      if (idle) {
        idle = false;
        last = performance.now();
        scheduleNext();
      }
    };

    const unsubscribe = subscribeCinema(kick);
    const detachPointer = attachPointer();
    paint(); // initial paint (a hash jump may have landed instantly)
    kick();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      unsubscribe();
      detachPointer();
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(settle);
      html.classList.remove("cinema-mode");
    };
  }, []);

  return (
    <CinemaActiveContext.Provider value={activeId}>
      <div ref={stageRef} className="cinema-stage">
        {children}
      </div>
    </CinemaActiveContext.Provider>
  );
}
