# Ju'un K'in — a Classic Maya Calendar reference

A small static site (no build step) exploring the Classic Maya calendar and the
modern Dreamspell count. Every reading is computed client-side from one running
day tally, using the **GMT 584283** correlation.

## Pages

| File | Section |
|------|---------|
| `index.html` | Today's reading, interactive wheel, date converter, next period endings |
| `tzolkin.html` | The 260-day Tzolk'in — origin theories, 20 trecenas, 260-day grid, day-sign reference |
| `haab.html` | The 365-day Haab' — 18 months + Wayeb', seating convention, year bearers, vague-year drift |
| `calendar-round.html` | The 52-year Calendar Round — meshing gears, ambiguity, recurrence finder |
| `long-count.html` | The Long Count — nested units, Distance Numbers, the 819-day count, lunar Supplementary Series |
| `cosmology.html` | Four directions, four colours, the World Tree — attestation vs. colonial systematization |
| `dreamspell.html` | Full Dreamspell Galactic Signature calculator + how it differs from the traditional Tzolk'in |
| `sources.html` | Evidence tiers, the correlation question, bibliography |

## Structure

- `assets/calendar.js` — the calendar engine (`window.MC`). Pure functions; no DOM.
- `assets/styles.css` — shared design system, light + dark (`prefers-color-scheme` + `data-theme` toggle).
- `assets/site.js` — shared top bar, section nav, footer, nav overlay, theme toggle,
  sticky "today" readout, deep-link + toast helpers, keyboard access, JSON-LD.
- `pages.json` — the section manifest. Nav and `sitemap.xml` are both generated from it.
- `sw.js` + `manifest.webmanifest` — offline PWA packaging.

Adding a page: create the HTML, add an entry to `pages.json`, push. The sitemap
workflow regenerates `sitemap.xml`.

## Scope / caveats

See `sources.html`. In short: the Lord of the Night sequence, the 819-day count
anchor, and the lunar series are reconstructions or approximations, labelled as
such. The Dreamspell is a modern (1987) system, not the Maya calendar.

## Deploy

GitHub Pages from `main`, served at `https://followorbounce.github.io/Maya-Calendar/`.
All links are relative, so it also runs from any subpath or `file://`.
