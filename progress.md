# Progress — Ju'un K'in (Maya Calendar)

## Status
- Rebuilt as a multi-page site with shared assets (commit `4c9ce66`) — current architecture.
- 8 pages, PWA-packaged (service worker + manifest), sitemap auto-generated from `pages.json`.
- Working tree clean; branch up to date with `origin/main`. Remote: `github.com/followorbounce/Maya-Calendar`.

## Recent work (most recent first)
- 2026-09-16 — Added CLAUDE.md and progress.md for ongoing tracking.
- Sitemap regenerated/updated.
- Rebuilt as a multi-page site with shared `assets/` (from an earlier single-page or differently-structured version).
- Deleted an earlier `maya-calendar-ru` (Russian-language variant) — consistent with the project's current no-Russian-unless-spec'd convention.

- 2026-09-19 — Added a Cloudflare Web Analytics beacon (cross-repo rollout across every deployed followorbounce/client site). See [[cloudflare-analytics-setup]] in the assistant's memory for the account/token map.

## Next steps
- No open TODOs found in-repo (README's "Scope / caveats" section already documents known reconstruction caveats — not action items).
- Confirm `sources.html` bibliography stays current if calendar engine logic (`assets/calendar.js`) is ever touched.
