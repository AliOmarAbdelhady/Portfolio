# CI/CD & Deployment

Deploys go to **Vercel** (project `portfolio`, team `aliomarsaleh2005-2791's
projects`) and are driven entirely by **GitHub Actions** — no deploy happens
from a laptop, and no Vercel credentials live in the repo (three GitHub
Actions secrets carry them).

## Pipeline at a glance

```
push to main ──► CI (lint · typecheck · build) ─┐
                                                ├─► Deploy: build on Actions
pull request ──► CI (lint · typecheck · build) ─┘   ├─ main → Vercel PRODUCTION
                                                    └─ PR   → Vercel PREVIEW + URL comment
weekly       ──► Dependabot (npm + GitHub Actions bumps)
```

- **Production:** <https://ali-omar-abdelhady.vercel.app>
- **Preview:** every PR gets an isolated URL, posted as a PR comment.

## Workflows

| File                       | What it does                                                            |
| -------------------------- | ----------------------------------------------------------------------- |
| `.github/workflows/ci.yml` | `npm ci` → lint → typecheck → production `next build` on every push/PR. |
| `.github/workflows/deploy.yml` | Pulls Vercel settings, builds with the Vercel adapter, uploads a prebuilt deployment (`--prod` for `main`, preview otherwise), comments the preview URL on PRs. |
| `.github/dependabot.yml`   | Weekly npm + GitHub Actions updates (minor/patch grouped).              |

CI runs on Node 24 to match the Vercel project runtime. Concurrent runs on
the same ref are cancelled automatically.

## Required secrets

Set in **Settings → Secrets and variables → Actions**:

| Secret              | Where to find it                                                       |
| ------------------- | ---------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | vercel.com → Account Settings → Tokens                                 |
| `VERCEL_ORG_ID`     | Vercel project → Settings → General → "Vercel Organization ID"         |
| `VERCEL_PROJECT_ID` | Vercel project → Settings → General → "Vercel Project ID"              |

## Notes

- Vercel's native **Git integration is currently disconnected** for this
  project (push-triggered deployments come out `BLOCKED`). Deployments are
  handled by `deploy.yml` instead. If you reconnect GitHub in the Vercel
  dashboard (Settings → Git Integration), **remove `deploy.yml`** so pushes
  don't deploy twice.
- Environment variables are configured in the Vercel project settings and
  pulled in at build/runtime time — never committed here. Currently:
  `NEXT_PUBLIC_SITE_URL` (SEO) and `GROQ_API_KEY` (powers the
  `/api/chat` AI assistant; server-side only, with per-IP rate limits,
  strict input validation, and a topic-locked system prompt — see
  `src/app/api/chat/route.ts` and `src/lib/chatbot-knowledge.ts`).
- Optional hardening: add a branch protection rule for `main` requiring the
  `Lint · Typecheck · Build` and `Vercel` checks before merge.
