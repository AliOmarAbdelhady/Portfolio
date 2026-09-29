import { cinemaGotoLayer } from "@/lib/cinema-scroll";

/**
 * Glide the cinema camera to a section by id — the layer zooms up to 1:1
 * from the centre of the screen (damped dolly through the intermediate
 * depth layers).
 */
export function scrollToSection(id: string) {
  if (typeof document === "undefined") return;
  cinemaGotoLayer(id);
}
