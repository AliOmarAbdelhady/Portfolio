# CI/CD & Deployment

The site deploys to **Vercel** via its native Git integration — no deploy
scripts or cloud tokens live in the repo.

## Pipeline at a glance

```
push to main ──► CI (lint · typecheck · build) ──► Vercel production deploy
                                                    └─► https://ali-omar-abdelhady.vercel.app
pull request ──► CI (lint · typecheck · build) ──► Vercel preview deploy (per PR)
weekly       ──► Dependabot (npm + GitHub Actions bumps)
```

## Continuous Integration — GitHub Actions

`.github/workflows/ci.yml` runs on every push to `main` and every PR:

1. `npm ci` (Node 24 — matches the Vercel runtime)
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build` (a production Next.js build must succeed)

Concurrent runs on the same branch are cancelled automatically.

## Continuous Deployment — Vercel Git integration

- **`main`** → production at <https://ali-omar-abdelhady.vercel.app>
- **Any PR** → an isolated preview URL, posted on the PR by Vercel
- Environment variables are configured in the Vercel project settings
  (`NEXT_PUBLIC_SITE_URL`, …) — never committed here.

## Recommended: require CI before merge

To make the checks blocking, add a branch protection rule (Settings →
Branches → Add rule) for `main` that requires the `Lint · Typecheck · Build`
check — plus Vercel's own `vercel/portfolio` check if you want deploys gated
too.
