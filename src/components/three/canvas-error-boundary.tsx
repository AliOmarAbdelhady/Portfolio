"use client";

import * as React from "react";

/**
 * Gracefully degrades the immersive WebGL background. If WebGL is unavailable
 * or the scene throws (e.g. headless browsers, blocked GPU, unsupported
 * driver), we fall back to `null` so the CSS layered gradient still shows —
 * the site remains fully usable without 3D (PROJECT_PLAN.md §25/§26).
 */
export class CanvasErrorBoundary extends React.PureComponent<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state: { hasError: boolean } = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Surface in dev only; in prod the fallback (CSS background) takes over.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ImmersiveCanvas] WebGL scene disabled:", error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
