import type { Variants, Transition } from "motion/react";

/**
 * Shared easing curves used across Motion + GSAP transitions.
 * Keep these in one place so the whole site animates with one rhythm.
 */
export const EASE = [0.22, 1, 0.36, 1] as const; // "easeOutExpo"-ish, smooth + premium
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const springSoft: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.9,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 26,
  mass: 0.7,
};

/** Fade + rise into place. Pair with a stagger parent. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

/** Parent container that staggers its children's entrance. */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/**
 * For `prefers-reduced-motion`: a no-op variant that just fades (no transform).
 */
export const reducedMotion: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};
