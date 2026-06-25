/**
 * Fixed, non-interactive cinematic overlays: a soft vignette + film grain +
 * faint scanlines. Sits above the 3D canvas, below page content. Subtle enough
 * to never hurt legibility.
 */
export function BackgroundFx() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Faint moving scanline */}
      <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-primary/[0.06] to-transparent" />
      {/* Vignette framing */}
      <div className="bg-vignette absolute inset-0" />
    </div>
  );
}
