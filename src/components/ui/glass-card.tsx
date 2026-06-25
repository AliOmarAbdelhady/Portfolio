"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Add a static neon ring */
  glow?: boolean;
  /** Enable pointer-based 3D tilt (disabled on touch / reduced motion) */
  tilt?: boolean;
  /** Stronger frosted surface */
  strong?: boolean;
};

/**
 * Glassmorphic surface (plan §20). Optionally tilts in 3D toward the pointer
 * for the "holographic" hover feel. Respects reduced motion + touch.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow, tilt, strong, children, onMouseMove, onMouseLeave, style, ...props }, ref) => {
    const reduce = typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseMove?.(e);
      if (!tilt || reduce) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(px * 10).toFixed(2)}deg`);
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    const handleLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);
      const el = e.currentTarget;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    return (
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={
          {
            transform:
              tilt && !reduce
                ? "perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))"
                : undefined,
            transition: "transform 0.25s ease",
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          strong ? "glass-strong" : "glass-card",
          "rounded-2xl",
          glow && "glow-ring",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GlassCard.displayName = "GlassCard";
