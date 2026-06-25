"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "motion/react";

import { useIsFinePointer } from "@/hooks/use-media-query";

type Variant = "default" | "link" | "view" | "scan";

const LABEL: Record<Variant, string> = {
  default: "",
  link: "OPEN",
  view: "VIEW",
  scan: "SCAN",
};

/**
 * Two-part cursor: a tight dot + a lagging ring that grows + labels over
 * interactive elements (via `data-cursor="view|scan|link"` on targets).
 * Auto-disabled on touch devices and under reduced motion.
 */
export function CustomCursor() {
  const reduce = useReducedMotion();
  const fine = useIsFinePointer();
  const enabled = fine && !reduce;

  const [variant, setVariant] = React.useState<Variant>("default");
  const [visible, setVisible] = React.useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 26, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 320, damping: 26, mass: 0.5 });

  React.useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("custom-cursor-active");

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const t = e.target as HTMLElement | null;
      const tagged = t?.closest?.("[data-cursor]") as HTMLElement | null;
      if (tagged) {
        setVariant((tagged.dataset.cursor as Variant) || "default");
        return;
      }
      if (
        t?.closest?.(
          "a,button,[role=button],[data-magnetic],input,textarea,select,label,summary",
        )
      ) {
        setVariant("link");
        return;
      }
      setVariant("default");
    };
    const hide = () => setVisible(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = variant === "default" ? 34 : variant === "link" ? 58 : 76;
  const label = LABEL[variant];

  return (
    <>
      {/* Tight dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      >
        <div className="-translate-x-1/2 -translate-y-1/2">
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary-glow)]" />
        </div>
      </motion.div>

      {/* Lagging ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
        style={{
          x: ringX,
          y: ringY,
          opacity: visible ? (variant === "default" ? 0.55 : 1) : 0,
        }}
      >
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/70 font-mono text-[9px] font-semibold uppercase tracking-wider text-primary backdrop-blur-[2px]"
          animate={{
            width: size,
            height: size,
            backgroundColor:
              variant === "default"
                ? "rgba(0,0,0,0)"
                : "color-mix(in oklab, var(--primary) 16%, transparent)",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          {label}
        </motion.div>
      </motion.div>
    </>
  );
}
