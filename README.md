# GTHA Snow Plowing Dashboard

Next.js + TypeScript + Tailwind + D3 + MapLibre dashboard of winter road maintenance spending and levels of service across the 26 GTHA municipalities. Builds to a fully static site.

By Thuan Truong and Thinh Lang. Live at [gtha-snow-dashboard.vercel.app](https://gtha-snow-dashboard.vercel.app).

## Run

```bash
npm install
npm run dev      # runs the data scripts, then http://localhost:3000
npm run build    # runs the data scripts, then writes the static site to /out
npm run lint     # type-check
```

Run only one `npm run dev` per folder. Two dev servers sharing the same `.next` folder can make pages hang.

### Map basemap key (optional)

The map uses the CARTO Positron basemap. It works without a key. To use a CARTO key, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_CARTO_API_KEY`. `.env.local` and every other `.env*` file except the example are git-ignored, so never put a key in the code or in a committed file. On Vercel, add the same variable under Project → Settings → Environment Variables.

## Site structure

Every page shares one header (`SiteHeader`) with the tabs **Project overview · Dashboard · Level of service ▾**, and one footer (`FeedbackFooter`, added in the root layout) with a feedback form and the same tabs stacked vertically.

- `/`: **Dashboard**. The map (left) and the A vs B comparison (right) sit side by side, so both are visible without scrolling. Below: spending per resident by area, and snowfall vs spending. The map colours each year on its own scale (quantiles of the selected year). Old `/?tab=overview` links redirect to `/project`.
- `/municipality/[slug]`: **Municipality profile**. Level of service, latest figures, spending by year.
- `/level-of-service`: **Compare levels of service**, opened from a municipality profile, with a back button to that profile. One road type across all municipalities and Regions, in alphabetical order, with a completion clock filter.
- `/project`: **Project overview**. Findings, methods, worked example, limitations, data sources.

### Feedback form

The site is static, so there is no server to send email. Submit opens the visitor's own email app with the message addressed to both authors (a `mailto:` link). The line under the button always links to both authors' websites in case no email app opens.

### Link share image

`src/app/opengraph-image.png` (1200×630) is a screenshot of the dashboard in its default view, with alt text in `opengraph-image.alt.txt`. Next.js adds the Open Graph and Twitter tags; `metadataBase` in `src/app/layout.tsx` must match the live URL. It is a fixed image: retake it when the map's look or data changes.

## Data pipeline (`npm run data`)

Runs automatically before `dev` and `build`.

### 1. Spending and snowfall: `scripts/process-data.ts`

Inputs (kept in the repo so Vercel can rebuild):

- `data/winter-costs-update-2-21-11-26.csv`: the single source for spending and snowfall. One row per municipality per year, 2015–2025: roads (0621), sidewalks and parking lots (0622), the tier (Single-tier for Toronto and Hamilton, Lower-tier for municipalities within a Region), the total, cost per resident, 2021 population, snowfall in mm (baseline total snowfall from the CanDCS-M6 CMIP6 projections on ClimateData.ca: the average of the ensemble medians across SSP1-2.6, SSP2-4.5, SSP3-7.0 and SSP5-8.5), and the municipality's total operating expense. Edit this file directly. Blank totals mean the municipality did not report that year. Sidewalk zeros mean the municipality reports them with roads.
- `data/municipality-directory.csv`: names and regions
- `geospatial data/Municipal_Boun_FeaturesToJSO.geojson`

Steps: read winter costs → join the directory on `mun-id` → compute measures (null when an input is missing, never 0): spending per resident, spending per km of road, change since 2016, and winter spending as a share of operating expenses → filter the GeoJSON to GTHA municipalities, fix ring winding for D3 and round coordinates.

Outputs: `src/data/municipal-metrics.json` (bundled into the page) and `public/data/gtha-boundaries.geojson` (fetched by the map).

### 2. Levels of service: `scripts/process-los.ts`

Input: `Level of Services/GTHA_Winter_Maintenance_LOS_Dataset_2026.md` (revised November 23, 2026). The script reads the first `.md` file in that folder, so keep only one there. Keeps the 26 mapped municipalities; values marked NS / NF / N/A / DATA GAP are shown with their reason; values from secondary sources are flagged. Disputed cells arrive written as "Sources differ: A (source), B (source)" and are shown as written. A cell or note that mentions "conflict" or "vs" without that marker stops the build, so fix the wording in the dataset.

Output: `src/data/level-of-service.json` (used by the municipality profiles).

Public-facing text avoids "FIR" and the 0621/0622 codes. Road length (`total-km-road-length` in the winter costs CSV) is used to calculate spending per km for the 26 mapped municipalities. The snow-mass estimates were removed.

## Code map

- `src/components/SiteHeader.tsx`: shared header, and `SiteNav` (the tabs and the municipality picker; horizontal in the header, `vertical` in the footer)
- `src/components/FeedbackFooter.tsx`: footer on every page: feedback form (mailto) and vertical navigation
- `src/app/page.tsx`: dashboard, shared state (year, metric, comparison picks)
- `src/app/municipality/[slug]/page.tsx`: municipality profile pages
- `src/components/ServiceLevels.tsx`: level of service section of a profile (responsibility, trigger ruler, table)
- `src/app/level-of-service/page.tsx`, `src/components/ServiceCompare.tsx`: compare one road type across municipalities
- `src/components/PageContents.tsx`: on-page contents list for long pages
- `src/app/project/page.tsx`: project description
- `src/components/Map.tsx`: MapLibre + D3 choropleth, legend, hover card, click-to-compare
- `src/components/Comparison.tsx`: A vs B table and trend chart
- `src/components/AreaComparison.tsx`, `SnowScatter.tsx`: area bars and snowfall vs spending chart (with GTHA average lines)
- `src/components/StoryCards.tsx`: findings cards on the project description
- `src/lib/typography.ts`: shared text and table styles for long-form pages, so the project overview and profiles match
- `src/lib/metrics.ts`: metric definitions, formatters, colours
- `src/lib/insights.ts`: headline year and the summaries behind the cards and charts

## Deploy to Vercel

Import the folder as a project. Framework preset: Next.js. `next.config.ts` sets `output: "export"`, and `prebuild` regenerates the data. If you use a CARTO key, add `NEXT_PUBLIC_CARTO_API_KEY` in the Vercel project settings.
