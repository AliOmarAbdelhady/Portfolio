"use client";

import { useEffect, useRef } from "react";

export type NormalizedMouse = { x: number; y: number };

/**
 * Returns a ref to normalized (-1..1) pointer coords, updated via rAF.
 * For the 3D scene / parallax that should NOT trigger re-renders.
 * Use the shared `pointerState` singleton for the global camera instead.
 */
export function useMousePosition() {
  const ref = useRef<NormalizedMouse>({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;
    const update = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        ref.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        ref.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      });
    };
    window.addEventListener("mousemove", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", update);
    };
  }, []);

  return ref;
}
