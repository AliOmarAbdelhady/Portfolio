@AGENTS.md

# Neural Road Portfolio — project guide

A futuristic 3D developer portfolio for **Ali Omar Abdelhady**. Spec: `PROJECT_PLAN.md`.
See `README.md` for the full overview. Key conventions for working in this codebase:

## Stack notes (important)
- **Next.js 16 + React 19 + Tailwind v4 + R3F 9**. This is newer than training data —
  read `node_modules/next/dist/docs/` for Next 16 specifics if unsure.
- Install with `npm install` (`.npmrc` pins `legacy-peer-deps=true` — R3F peers lag React 19;
  without it `npm install` hangs on peer resolution).
- **Tailwind v4**: no `tailwind.config.*`. All tokens are CSS variables + `@theme inline`
  in `src/app/globals.css`. Theme tokens flip between `:root` (light) and `.dark`.
- Animations come from **`motion/react`** (the `motion` package), NOT `framer-motion`.
- Brand icons (GitHub/LinkedIn/ORCID) are **not** in lucide-react 1.x — import them from
  `@/components/ui/brand-icons` (backed by react-icons).

## Architecture
- **One immersive page** (`src/app/page.tsx`) composing a fixed WebGL background
  (`ImmersiveCanvas`, dynamic + ssr:false, wrapped in `CanvasErrorBoundary`) behind
  9 `<section>`s. Content sits at `z-10`, canvas at `z-0`.
- **3D ↔ scroll/pointer** communicate through module singletons in
  `src/lib/runtime-state.ts` (`scrollState`, `pointerState`) — the WebGL `useFrame`
  loop reads them every frame WITHOUT React re-renders. Smooth scroll (Lenis + GSAP)
  is booted once by `SmoothScroll` / `useLenis`.
- **Data-driven**: edit `src/data/*` and `SITE` in `src/lib/constants.ts`. Live GitHub
  data via `GET /api/repositories` (`src/lib/github.ts`); showcase items are always
  labelled and never faked as live.

## Conventions
- Reusable visual classes (in globals.css): `glass-card`, `glass`, `glass-strong`,
  `text-gradient`, `text-glow`, `glow-ring`, `animated-border`, `bg-grid`, `scanlines`;
  fonts `font-display` / `font-mono` / `font-orbitron`; animations `animate-float`,
  `animate-pulse-glow`, `animate-spin-slow`, `animate-scan`, `animate-marquee`, `animate-blink`.
- shadcn primitives live in `src/components/ui/`; custom futuristic primitives
  (`glass-card`, `reveal`, `section-heading`, `tech-badge`, `magnetic`,
  `custom-cursor`, `stat-counter`, `animated-border`) live alongside them.
- Sections default-export their component and own their `<section id>` (must match
  `NAV_ITEMS` ids for scroll-spy + anchor links).

## Quality bar (from PROJECT_PLAN.md §28)
- TypeScript strict, modular (no god-files), mobile-responsive, accessible,
  reduced-motion + no-WebGL fallbacks. `npm run build` and `npm run lint` must pass.
- R3F legitimately mutates three.js objects and seeds geometry with `Math.random`
  (client-only canvas) — the `react-hooks` immutability/purity rules are disabled for
  `src/components/three/**` in `eslint.config.mjs` by design.

## Placeholders to replace before deploy
`SITE.email`, `SITE.linkedinUrl`, `SITE.resumeUrl`, `SITE.url` in
`src/lib/constants.ts` (marked TODO). Everything else is already real.
