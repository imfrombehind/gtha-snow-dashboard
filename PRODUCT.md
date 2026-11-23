# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Researchers and planners are the primary audience: academic, policy, and planning readers studying winter road maintenance in the Greater Toronto and Hamilton Area (GTHA). They come to compare municipalities, spot gaps worth investigating, and judge whether the figures are sound enough to build on. They care about method, sources, and limitations as much as the numbers.

## Product Purpose

The GTHA Winter Maintenance dashboard compares winter road maintenance spending, snowfall, and levels of service across the region's 26 municipalities, using public financial, geographic, and demographic data. It shows where the money goes and what might explain the differences.

Success is a better question. A visitor finds a gap between municipalities, understands how the figures behind it were built, and leaves asking what explains it.

## Positioning

A single, method-transparent view of winter maintenance across all 26 GTHA municipalities, joining spending, snowfall, road length, and normalized levels of service. It is an exploratory and benchmarking resource, and it is explicitly not a ranking of municipal efficiency or performance.

## Operating Context

- Visitors pick a year and an indicator, read the map, hover for a municipality's figures, and select two municipalities to compare side by side.
- Municipality profiles cover level of service, latest figures, where the money goes, and the year-by-year record.
- The project description is part of the evaluation workflow: readers use it to check study area, formulas, a worked example, limitations, and sources.

## Capabilities and Constraints

- Coverage: 11 reporting years, 2015 to 2025. The 26 mapped municipalities are 2 single-tier (Toronto, Hamilton) and 24 lower-tier. The data also holds records for the 4 upper-tier Regions (Durham, Halton, Peel, York).
- Indicators: spending per resident, spending per km of road, total spending, winter share of operating expenses, change since 2016, and estimated snowfall.
- Road length comes from the 2019 Ontario Road Network and can include regional and provincial roads, so per-km figures carry that stated limitation.
- The site is a fully static Next.js export deployed on Vercel. Data is regenerated from the repository's source files at build time.
- Terminology: "single-tier", "lower-tier", and "upper-tier" are used on the public site. "FIR" and the 0621/0622 cost codes stay out of public-facing text.

## Brand Commitments

- Name: GTHA Winter Maintenance. Created by Thuan Truong and Thinh Lang.
- Voice: plain, public language that stays neutral and frames findings as starting points for questions.
- Never rank municipalities or imply that higher or lower spending means better or worse performance.
- Missing data stays visibly missing. Unreported values are never shown as 0 or filled with an estimate.

## Evidence on Hand

- Spending and snowfall by municipality and year: `data/winter-costs-update-2-21-11-26.csv`, with source workbook `data/raw-fir-data.xlsx`.
- Normalized levels of service: `Level of Services/GTHA Winter Maintenance Levels of Service_ Normalized Dataset for 30 Jurisdictions (2026).md`.
- Municipal boundaries: `geospatial data/Municipal_Boun_FeaturesToJSO.geojson`.
- Method, worked example, limitations, and source citations: `src/app/project/page.tsx`.
- No testimonials, adoption figures, or institutional endorsements exist. Do not imply any.

## Product Principles

1. Prompt inquiry, not verdicts. Every comparison should open a question and never declare a winner.
2. Keep the method within reach. A reader should be able to trace any figure to its definition, source, and limitation.
3. Make uncertainty visible. Gaps, conflicting sources, and known data limits stay in view at the point of use.
4. Be rigorous in plain language. Serve expert readers without relying on internal codes or jargon.
