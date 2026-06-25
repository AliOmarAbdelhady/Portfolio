"use client";

import * as React from "react";

import { useLenis } from "@/hooks/use-lenis";

/**
 * Mount once near the app root to boot Lenis + GSAP smooth scrolling and the
 * shared scroll/pointer runtime state. Renders its children untouched.
 */
export function SmoothScroll({ children }: { children?: React.ReactNode }) {
  useLenis();
  return <>{children}</>;
}
