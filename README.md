# Ali Omar Abdelhady — Neural Road Portfolio

An immersive, cinematic **3D developer portfolio** built around the **"Neural Road"**
concept: visitors scroll *forward* through a glowing futuristic road of stations —
a hero entry portal, an identity node, an orbiting skill system, 3D project &
repository stations, an AI/computer-vision lab, a data-science dashboard, a
timeline road, and a contact transmission terminal.

Dark mode is the default (a polished light mode is one click away). The WebGL
background is fully optional — the site stays usable without it.

> Built to the spec in [`PROJECT_PLAN.md`](./PROJECT_PLAN.md).

---

## ✨ Highlights

- **Scroll-driven "Neural Road"** — a fixed React Three Fiber canvas (glowing
  perspective grid, rising particle field, distorted AI core, floating data
  blocks) sits behind the content. The camera advances down the road as you
  scroll, reacts to the pointer, and adapts its colors to the active theme.
- **9 immersive stations** wired to scroll-spy navigation + a `⌘K` command palette.
- **Glassmorphic UI** — frosted cards, neon glow, animated conic borders,
  gradient text, scanlines, a custom two-part cursor, and magnetic buttons.
- **Live GitHub integration** — the *Code Vault* fetches your real public
  repositories from the GitHub API (`/api/repositories`) and renders them first.
- **Accessible & resilient** — `prefers-reduced-motion`, mobile fallbacks,
  keyboard-friendly dialogs, and a graceful no-WebGL degradation path.

---

## 🧰 Tech stack

| Area        | Choice                                                        |
| ----------- | ------------------------------------------------------------ |
| Framework   | **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** (strict) |
| Styling     | **Tailwind CSS v4** (`@theme` tokens) · **shadcn/ui** primitives |
| 3D          | **React Three Fiber 9** · **@react-three/drei 10** · **three 0.185** · **@react-three/postprocessing** |
| Animation   | **GSAP + ScrollTrigger** · **Lenis** (smooth scroll) · **motion** (Motion for React) |
| Theme       | **next-themes** (class strategy, dark default)               |
| Icons       | **lucide-react** + **react-icons** (brand glyphs)            |
| Other       | **cmdk** (command palette)                                   |

> ⚠️ React Three Fiber's peer deps lag behind React 19. The repo pins
> `legacy-peer-deps=true` in [`.npmrc`](./.npmrc) so installs don't hang.

---

## 🚀 Getting started

```bash
npm install        # uses legacy-peer-deps via .npmrc
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build (Turbopack)
npm run start      # serve the production build
npm run lint       # eslint (flat config)
npx tsc --noEmit   # type-check only
```

---

## 🗂 Project structure

```
src/
  app/
    layout.tsx            # fonts (Space Grotesk / Inter / JetBrains / Orbitron), SEO, ThemeProvider
    page.tsx              # composition: canvas + overlays + navbar + 9 sections + footer + ⌘K
    globals.css           # Tailwind v4 design tokens, glassmorphism, neon, keyframes
    api/repositories/route.ts  # live GitHub profile + repos (ISR, 30 min)
  components/
    layout/               # navbar, footer, theme-toggle, command-palette, smooth-scroll, bg-fx, scroll-progress
    sections/             # hero, about, skills, projects, repositories, ai-lab, data, timeline, contact
    three/                # immersive-canvas, camera-rig, neural-road, particle-field, ai-core, data-tunnel, effects, error boundary
    ui/                   # shadcn primitives + custom: glass-card, reveal, section-heading, tech-badge, magnetic, custom-cursor, …
  data/                   # projects, repositories, skills, timeline, social-links
  hooks/                  # use-lenis, use-media-query, use-reduced-motion, use-mouse-position, use-scroll-progress
  lib/                    # utils, constants (SITE), animation, github, runtime-state
```

---

## 🔌 Live GitHub data

The **Code Vault** section calls `GET /api/repositories`, which fetches your
public profile + repositories from the GitHub REST API and maps them into the
portfolio model. Live repos always render **first**; curated **showcase**
capsules (clearly labelled) fill the vault so it's never empty.

To raise the GitHub rate limit (60 → 5000 req/h), set a token:

```bash
cp .env.example .env.local
# GITHUB_TOKEN=ghp_xxx   (classic PAT, public-read scope)
```

Until public repositories are published, the vault shows the labelled showcase
set. **Publish a repo and it appears automatically** (ISR refreshes every 30 min).

---

## ✍️ Making it yours (replace the placeholders)

Almost everything is data-driven. The fields marked **TODO** in
[`src/lib/constants.ts`](src/lib/constants.ts) are the only placeholders:

```ts
export const SITE = {
  email: "…",         // TODO: your real email
  linkedinUrl: "…",   // TODO: your LinkedIn
  resumeUrl: "",      // TODO: drop a PDF in /public and set e.g. "/resume.pdf"
  url: "https://…",   // TODO: deployed URL (used for SEO canonical + OG)
  // name / institution / location / GitHub / ORCID / avatar are already real
};
```

Then edit the data files to add real content:

- [`src/data/projects.ts`](src/data/projects.ts) — featured projects (problem /
  solution / features / tech / links). Set `showcase: false` once a project is real.
- [`src/data/repositories.ts`](src/data/repositories.ts) — curated showcase repos
  (real ones arrive automatically via the API).
- [`src/data/skills.ts`](src/data/skills.ts) · [`src/data/timeline.ts`](src/data/timeline.ts)
  · [`src/data/social-links.ts`](src/data/social-links.ts)

---

## 🎨 Theming

All colors live as CSS variables in
[`src/app/globals.css`](src/app/globals.css), with `:root` (light) and `.dark`
(dark) blocks. The 3D scene reads its colors (`--grid-color`, `--fog-color`,
`--particle-a/b/c`) from the same variables and re-tints on theme change.

---

## ♿ Accessibility, motion & performance

- `prefers-reduced-motion` collapses animations and freezes the 3D scene.
- The custom cursor and heavy FX are disabled on touch / small screens.
- The WebGL scene is lazy (`next/dynamic`, `ssr:false`), DPR-clamped, and wrapped
  in an error boundary — if WebGL is unavailable, the CSS gradient takes over.
- Particle counts and Bloom are scaled down on mobile.

---

## ▲ Deploy

Optimized for **Vercel** (zero config). Set `NEXT_PUBLIC_SITE_URL` (and optional
`GITHUB_TOKEN`) in the project env vars, then deploy.

---

## 📄 License

Personal portfolio. Project text/design © Ali Omar Abdelhady. Third-party
libraries retain their respective licenses.
