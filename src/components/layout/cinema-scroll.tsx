"use client";

import * as React from "react";

import { scrollState, attachPointer } from "@/lib/runtime-state";
import {
  cinema,
  subscribeCinema,
  measureCinema,
  cinemaScrollBy,
  cinemaScrollTo,
  clamp,
  stepCinema,
} from "@/lib/cinema-scroll";

/**
 * CinemaScroll — replaces native document scrolling with a virtual one.
 *
 * The page becomes a fixed, overflow-hidden stage; the full content track is
 * translated by −y inside it. Wheel / touch / keyboard accumulate into a
 * target, a rAF loop damps y toward it (buttery glide), and three things stay
 * perfectly in sync from that single value:
 *
 *   1. the DOM track translate (what the visitor "scrolls"),
 *   2. `scrollState` (the 3D camera travelling along the neural road),
 *   3. `cinema` subscribers (navbar tint, progress bar, timeline line).
 *
 * Sections also get a subtle scale/opacity ramp by distance from the viewport
 * centre — the "zooming through stations" feel. Reduced motion snaps instead
 * of gliding and disables the ramp.
 *
 * Elements marked `data-cinema-prevent` (the AI chat panel) keep native
 * scrolling — the controller ignores gestures that start inside them.
 */

const NAVBAR_OFFSET = 76;

/** Wheel multipliers. deltaMode 1 = lines (Firefox) → px. */
function wheelDelta(e: WheelEvent): number {
  const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 100 : e.deltaY;
  // Trackpads fire many tiny events; wheels few big ones. Cap spikes so a
  // single fierce flick advances at most ~a viewport.
  return clamp(d, -240, 240);
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

export function CinemaScroll({ children }: { children?: React.ReactNode }) {
  const trackRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    html.classList.add("cinema-mode");

    /* ------------------------------ measuring ----------------------------- */

    const sections = Array.from(track.querySelectorAll<HTMLElement>("main > section"));

    const measure = () => {
      measureCinema(track.scrollHeight);
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    window.addEventListener("resize", measure);
    // Late assets (fonts, avatars) change layout — remeasure once settled.
    const settle = window.setTimeout(measure, 800);

    /* -------------------------- deep link (#about) ------------------------ */

    const jumpToHash = (hash: string, immediate: boolean) => {
      const id = hash.replace(/^#/, "");
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      const top = el.getBoundingClientRect().top + cinema.y - NAVBAR_OFFSET;
      cinemaScrollTo(top, immediate || reducedMotion);
    };
    if (window.location.hash) jumpToHash(window.location.hash, true);

    /* ------------------------------- input -------------------------------- */

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || insidePrevent(e.target)) return; // pinch-zoom + chat
      e.preventDefault();
      cinemaScrollBy(wheelDelta(e));
    };

    let touchY = 0;
    let touchX = 0;
    let touchTarget = 0;
    let touchLocked = false;
    const onTouchStart = (e: TouchEvent) => {
      if (insidePrevent(e.target)) return;
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
      touchTarget = cinema.target;
      touchLocked = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (insidePrevent(e.target)) return;
      const dy = touchY - e.touches[0].clientY;
      const dx = Math.abs(touchX - e.touches[0].clientX);
      // Only claim the gesture once it is clearly vertical.
      if (!touchLocked) {
        if (Math.abs(dy) < 8 || Math.abs(dy) <= dx) return;
        touchLocked = true;
      }
      e.preventDefault();
      cinema.target = clamp(touchTarget + dy * 1.7, 0, cinema.limit);
    };

    const onKey = (e: KeyboardEvent) => {
      if (focusInEditable(e.target) || insidePrevent(e.target)) return;
      const vh = window.visualViewport?.height ?? window.innerHeight;
      let delta: number | null = null;
      switch (e.key) {
        case "ArrowDown": delta = 320; break;
        case "ArrowUp": delta = -320; break;
        case "PageDown": delta = vh * 0.9; break;
        case "PageUp": delta = -vh * 0.9; break;
        case " ":
          if (e.shiftKey) delta = -vh * 0.9; else delta = vh * 0.9;
          break;
        case "Home": cinemaScrollTo(0); e.preventDefault(); return;
        case "End": cinemaScrollTo(cinema.limit); e.preventDefault(); return;
        case "Enter":
          if (e.target === document.body) { jumpToHash("#about", false); }
          return;
        default: return;
      }
      e.preventDefault();
      if (delta) cinemaScrollBy(delta);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);

    /* ---------------------------- damping loop ---------------------------- */
    // Run frames only while the glide is in flight; park when settled.

    let raf = 0;
    let last = performance.now();
    let idle = true;

    /** Translate the track, feed the 3D camera state, zoom nearby sections. */
    const paint = () => {
      track.style.transform = `translate3d(0, ${-Math.round(cinema.y * 100) / 100}px, 0)`;

      // Mirror into the shared scrollState the WebGL camera reads every frame.
      scrollState.y = cinema.y;
      scrollState.velocity = cinema.velocity;
      scrollState.limit = cinema.limit;
      scrollState.progress = cinema.progress;

      if (!reducedMotion) {
        const vh = window.visualViewport?.height ?? window.innerHeight;
        const centre = cinema.y + vh / 2;
        for (const section of sections) {
          const rect = section.getBoundingClientRect();
          const dist = rect.top + cinema.y + rect.height / 2 - centre;
          const r = Math.min(Math.abs(dist) / vh, 1.5); // 0 = centred
          if (r >= 1.2) {
            if (section.dataset.zoomed === "1") {
              section.style.transform = "";
              section.style.opacity = "";
              section.dataset.zoomed = "0";
            }
            continue;
          }
          // Fully visible → 1.0; a viewport away → 0.965 + slight fade.
          const t = r / 1.2;
          const scale = 1 - t * t * 0.035;
          const opacity = 1 - t * t * 0.22;
          section.style.transform = `scale(${scale.toFixed(4)})`;
          section.style.opacity = opacity.toFixed(3);
          section.dataset.zoomed = "1";
        }
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const moving = stepCinema(dt, reducedMotion);
      paint();
      if (moving) {
        raf = requestAnimationFrame(loop);
      } else {
        idle = true;
      }
    };
    const kickWhileMoving = () => {
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(loop);
      }
    };

    const unsubscribe = subscribeCinema(kickWhileMoving);
    const detachPointer = attachPointer();
    // Initial paint (a hash jump may have landed instantly on load).
    kickWhileMoving();

    return () => {
      cancelAnimationFrame(raf);
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
    <div className="cinema-stage">
      <div ref={trackRef} className="cinema-track">
        {children}
      </div>
    </div>
  );
}
