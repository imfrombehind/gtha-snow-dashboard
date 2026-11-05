# GTHA Snow Plowing Dashboard

Next.js + TypeScript + Tailwind + D3 dashboard of winter road maintenance across the 26 GTHA municipalities. Builds to a fully static site.

## Run

```bash
npm install
npm run dev      # runs the data script, then http://localhost:3000
npm run build    # runs the data script, then writes the static site to /out
```

## Data pipeline — `scripts/process-data.ts`

Inputs (kept in the repo so Vercel can rebuild):

- `data/avg-snow-by-municipality.csv` — wide, one `total-avg-snow-YYYY` column per year
- `data/fir-data.csv` — FIR winter control expenses per municipality per year
- `data/municipality-directory.csv` — population (2016, 2021), road length (2019)
- `geospatial data/Municipal_Boun_FeaturesToJSO.geojson`

Steps: unpivot snow to long format → join all three on `mun-id` → population = 2016 Census for years ≤ 2016, else 2021 → compute indicators (null when an input is missing) → filter the GeoJSON to GTHA municipalities, fix ring winding for D3 and round coordinates.

Outputs: `src/data/municipal-metrics.json` (bundled into the page) and `public/data/gtha-boundaries.geojson` (fetched by the map).

Assumptions (`ASSUMPTIONS` in the script): 8 m average road width, 0.1 t/m³ fresh-snow density.

## Code map

- `src/app/page.tsx` — left/right layout and shared state (year, metric, comparison picks)
- `src/components/Sidebar.tsx` — About, Findings, Methods, Data sources, year slider
- `src/components/Map.tsx` — D3 choropleth, legend, hover tooltip, click-to-compare
- `src/components/Comparison.tsx` — A vs B table and trend chart
- `src/lib/metrics.ts` — metric definitions, formatters, colours

## Deploy to Vercel

Import the folder as a project. Framework preset: Next.js. No settings to change — `next.config.ts` sets `output: "export"`, and `prebuild` regenerates the data.
