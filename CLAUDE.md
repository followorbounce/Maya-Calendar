# Ju'un K'in — Classic Maya Calendar reference

Small static site (no build step) exploring the Classic Maya calendar and the modern Dreamspell count. Every reading is computed client-side from one running day tally using the **GMT 584283** correlation.

## Structure
- 8 pages: `index.html`, `tzolkin.html`, `haab.html`, `calendar-round.html`, `long-count.html`, `cosmology.html`, `dreamspell.html`, `sources.html`.
- `assets/calendar.js` — the calendar engine (`window.MC`); pure functions, no DOM.
- `assets/styles.css` — shared design system, light + dark (`prefers-color-scheme` + `data-theme` toggle).
- `assets/site.js` — shared top bar, section nav, footer, nav overlay, theme toggle, sticky "today" readout, deep-link + toast helpers, keyboard access, JSON-LD.
- `pages.json` — the section manifest; nav and `sitemap.xml` are both generated from it.
- `sw.js` + `manifest.webmanifest` — offline PWA packaging.

Adding a page: create the HTML, add an entry to `pages.json`, push — the sitemap workflow regenerates `sitemap.xml`.

## Conventions
- Aerospace-style visual/structural conventions (see the sibling `aerospace` repo for the shared house style this follows).
- GMT correlation constant is **584283** — do not silently change it; see `sources.html` for the correlation debate.
- Reconstructed/approximated elements (Lord of the Night sequence, 819-day count anchor, lunar series) must stay labelled as such, not presented as certain.
- Dreamspell is a modern (1987) system, kept clearly distinguished from the traditional Tzolk'in.
- All links relative — site must also run from any subpath or `file://`.
- Never use Russian in code/UI/docs unless the task explicitly calls for it.

## Deploy
GitHub Pages from `main`, served at `https://followorbounce.github.io/Maya-Calendar/`. Remote: `github.com/followorbounce/Maya-Calendar`.

## Analytics
Cloudflare Web Analytics beacon added 2026-09-19, shares the `followorbounce.github.io` Web Analytics site (see `[[cloudflare-analytics-setup]]` in memory).
