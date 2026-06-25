import { lenisInstance } from "@/lib/runtime-state";

/** Offset for the fixed navbar so headings aren't hidden under it. */
const NAVBAR_OFFSET = -76;

/**
 * Smooth-scroll to a section by id.
 *
 * Routes through Lenis when it is active so the scroll *glides* — native
 * `scrollIntoView` is overridden to `auto` while Lenis owns scrolling, so
 * calling it directly would snap. When Lenis is disabled (e.g. reduced motion,
 * or no smooth-scroll engine), falls back to native smooth scroll.
 */
export function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const lenis = lenisInstance.current;
  if (lenis) {
    lenis.scrollTo(el, { offset: NAVBAR_OFFSET, duration: 1.15 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
