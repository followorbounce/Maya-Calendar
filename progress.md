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

## Next steps- 2026-10-02 — Science review: engine verified (13.0.0.0.0 4 Ajaw 8 Kumk'u = JDN 584283 = 11 Aug 3114 BCE; 2012-12-21 = 13.0.0.0.0 4 Ajaw 3 K'ank'in; Dreamspell 2012-12-21 = Kin 207; LC/JDN round-trip ±2M days clean). Fixed: Dreamspell anchor label "Kin 34 (Blue Galactic Wizard)" → White (seal 14 = White Wizard) in `dreamspell.html` + comment in `assets/calendar.js`; bumped `sw.js` cache to `juunkin-v2`. Open question: 819-day stations are conventionally anchored at 12.19.19.17.17 1 Kaban 5 Kumk'u (era base − 3), not the era base — see `sources.html` caveat.

- No open TODOs found in-repo (README's "Scope / caveats" section already documents known reconstruction caveats — not action items).
- Confirm `sources.html` bibliography stays current if calendar engine logic (`assets/calendar.js`) is ever touched.
