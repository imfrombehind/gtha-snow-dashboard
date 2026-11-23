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

Every page shares one header (`SiteHeader`): **Dashboard · Municipality profile ▾ · Overview · Project description**.

- `/`: **Dashboard** tab. The map (left) and the A vs B comparison (right) sit side by side, so both are visible without scrolling. Below: spending per resident by area, and snowfall vs spending. The map colours each year on its own scale (quantiles of the selected year).
- `/?tab=overview`: **Overview** tab. Background text and how to use the dashboard.
- `/municipality/[slug]`: **Municipality profile**. Level of service, latest figures, spending by year.
- `/level-of-service`: **Compare levels of service**, opened from a municipality profile, with a back button to that profile. One road type across all municipalities and Regions, in alphabetical order, with a completion clock filter.
- `/project`: **Project description**. Findings, methods, worked example, limitations, data sources.

## Data pipeline (`npm run data`)

Runs automatically before `dev` and `build`.

### 1. Spending and snowfall: `scripts/process-data.ts`

Inputs (kept in the repo so Vercel can rebuild):

- `data/winter-costs-update-2-21-11-26.csv`: the single source for spending and snowfall. One row per municipality per year, 2015–2025: roads (0621), sidewalks and parking lots (0622), the tier (Single-tier for Toronto and Hamilton, Lower-tier for municipalities within a Region), the total, cost per resident, 2021 population, estimated snowfall in mm, and the municipality's total operating expense. Edit this file directly. Blank totals mean the municipality did not report that year. Sidewalk zeros mean the municipality reports them with roads.
- `data/municipality-directory.csv`: names and regions
- `geospatial data/Municipal_Boun_FeaturesToJSO.geojson`

Steps: read winter costs → join the directory on `mun-id` → compute measures (null when an input is missing, never 0): spending per resident, spending per km of road, change since 2016, and winter spending as a share of operating expenses → filter the GeoJSON to GTHA municipalities, fix ring winding for D3 and round coordinates.

Outputs: `src/data/municipal-metrics.json` (bundled into the page) and `public/data/gtha-boundaries.geojson` (fetched by the map).

### 2. Levels of service: `scripts/process-los.ts`

Input: the normalized dataset in `Level of Services/`. Keeps the 26 mapped municipalities; values marked NS / NF / N/A / DATA GAP are shown with their reason; values from secondary sources are flagged. Disputed values are listed in `DISPUTED` and show both figures, and a new conflict with no entry stops the build.

Output: `src/data/level-of-service.json` (used by the municipality profiles).

Public-facing text avoids "FIR" and the 0621/0622 codes. Road length (`total-km-road-length` in the winter costs CSV) is used to calculate spending per km for the 26 mapped municipalities. The snow-mass estimates were removed.

## Code map

- `src/components/SiteHeader.tsx`: shared header and navigation, including the municipality profile picker
- `src/app/page.tsx`: dashboard and overview tabs, shared state (year, metric, comparison picks)
- `src/components/Sidebar.tsx`: overview tab content
- `src/app/municipality/[slug]/page.tsx`: municipality profile pages
- `src/components/ServiceLevels.tsx`: level of service section of a profile (responsibility, trigger ruler, table)
- `src/app/project/page.tsx`: project description
- `src/components/Map.tsx`: MapLibre + D3 choropleth, legend, hover card, click-to-compare
- `src/components/Comparison.tsx`: A vs B table and trend chart
- `src/components/AreaComparison.tsx`, `SnowScatter.tsx`: area bars and snowfall vs spending chart (with GTHA average lines)
- `src/components/StoryCards.tsx`: findings cards on the project description
- `src/lib/typography.ts`: shared text and table styles for long-form pages, so the overview, project description and profiles match
- `src/lib/metrics.ts`: metric definitions, formatters, colours
- `src/lib/insights.ts`: headline year and the summaries behind the cards and charts

## Deploy to Vercel

Import the folder as a project. Framework preset: Next.js. `next.config.ts` sets `output: "export"`, and `prebuild` regenerates the data. If you use a CARTO key, add `NEXT_PUBLIC_CARTO_API_KEY` in the Vercel project settings.
