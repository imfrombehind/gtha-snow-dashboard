# CLAUDE.md

Static Next.js dashboard of GTHA winter maintenance spending and levels of service. See README.md for the site structure, data pipeline and code map.

## Commands

- `npm run dev`: regenerates data (`predev`), then serves http://localhost:3000. Run only one dev server per folder; two sharing `.next` make pages hang.
- `npm run build`: regenerates data (`prebuild`), then writes the static site to `out/`.
- `npm run lint`: type-check (`tsc --noEmit`). There is no test suite; the data scripts assert on their own rules and stop on bad input.
- `npm run data`: only the two data scripts.

## Rules that are easy to miss

- **Static export** (`output: "export"`). No server, API routes or server actions. Anything that "sends" (like the feedback form) must run in the browser.
- **Generated files**: `src/data/*.json` and `public/data/gtha-boundaries.geojson` come from `scripts/`. Change the inputs or scripts, never the JSON by hand. Every dev/build rewrites `generatedAt` in `municipal-metrics.json`; if that is its only change, revert it instead of committing it.
- **Levels-of-service dataset**: `scripts/process-los.ts` reads the first `.md` in `Level of Services/`, so keep exactly one file there. Disputed cells must say "Sources differ: A (source), B (source)"; other "conflict"/"vs" wording stops the build on purpose. To update the dataset, replace the file, run `npm run data`, and review the diff of `src/data/level-of-service.json`.
- **Public wording**: page text avoids "FIR" and the 0621/0622 item codes. Toronto and Hamilton are "single-tier". Missing values are null, never 0.
- **Snowfall** is baseline total snowfall from CanDCS-M6 (CMIP6) via ClimateData.ca, averaged across four SSP scenarios. Keep the project page, the formula list and the `Comparison.tsx` info text consistent when it changes.
- **Styling**: colours are tokens in `src/app/globals.css` (`ink`, `ink-2`, `seq-*`, `line`, `panel`, `surface`). Long-form pages use the shared classes in `src/lib/typography.ts`. Check text contrast on the grey footer (`#d4dadc`, the basemap water colour): use `text-ink` there, not `text-ink-2`.
- **Navigation** lives in `SiteNav` (`src/components/SiteHeader.tsx`), used by the header and, with `vertical`, by the footer. Change tabs in one place.
- **Share image** `src/app/opengraph-image.png` is a manual screenshot of the dashboard; retake it if the map changes. `metadataBase` in `src/app/layout.tsx` must match the live URL.

## Git

- Work on `main`. Push to `origin` (imfrombehind/gtha-snow-dashboard); the `thuan` remote is Thuan's fork, so don't push there unless asked.
- Commit and push only when asked.
