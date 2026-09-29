import { cinema, cinemaScrollTo } from "@/lib/cinema-scroll";

/** Offset for the fixed navbar so headings aren't hidden under it. */
const NAVBAR_OFFSET = -76;

/**
 * Glide to a section by id through the cinema-scroll engine.
 *
 * The element's live position is measured against the translating track
 * (getBoundingClientRect + current virtual y), then handed to the damped
 * glide — the same buttery easing as wheel input.
 */
export function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.getBoundingClientRect().top + cinema.y + NAVBAR_OFFSET;
  cinemaScrollTo(top);
}
