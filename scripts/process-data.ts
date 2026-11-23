/**
 * Build-time data pipeline.
 *
 * Reads the raw CSV + GeoJSON, then writes:
 *   src/data/municipal-metrics.json   – one record per municipality per year (long format)
 *   public/data/gtha-boundaries.geojson – GTHA polygons only, trimmed for the web
 *
 * Spending and snowfall come from data/winter-costs-update-2-21-11-26.csv, the single source. Names and regions come
 * from data/municipality-directory.csv.
 *
 * Run with: npm run data   (also runs automatically before `npm run build`)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { csvParse } from "d3-dsv";
import { geoArea } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import type { MunicipalRecord, MetricsFile, Tier } from "../src/lib/types";

const ROOT = process.cwd();
const RAW = {
  costs: path.join(ROOT, "data/winter-costs-update-2-21-11-26.csv"),
  directory: path.join(ROOT, "data/municipality-directory.csv"),
  geo: path.join(ROOT, "geospatial data/Municipal_Boun_FeaturesToJSO.geojson"),
};
const OUT = {
  metrics: path.join(ROOT, "src/data/municipal-metrics.json"),
  geo: path.join(ROOT, "public/data/gtha-boundaries.geojson"),
};

/** Spending per resident is compared against this year for the "change since" measure. */
const BASE_YEAR = 2016;

// ---------- helpers ----------

/** Read a CSV, stripping the UTF-8 BOM and CRLF line endings. */
function readCsv(file: string) {
  const text = readFileSync(file, "utf8").replace(/^﻿/, "").replace(/\r/g, "");
  return csvParse(text);
}

/** Parse numbers like " 2,731,571.00 " → 2731571. Blank → null. */
function num(value: string | undefined): number | null {
  if (value == null) return null;
  const cleaned = value.replace(/[,\s$]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Population for a year, from the 2016 and 2021 Census counts.
 * 2015 to 2020: the 2016 count. 2021 onward: the 2021 count. This matches winter-cost-per-resident in the source CSV.
 * If only one count exists, it is used for every year.
 */
function populationForYear(year: number, pop2016: number | null, pop2021: number | null): number | null {
  if (pop2016 == null || pop2021 == null) return pop2021 ?? pop2016;
  return year <= 2020 ? pop2016 : pop2021;
}

/** Divide, returning null when either side is missing or the divisor is 0. */
function safeDiv(a: number | null, b: number | null): number | null {
  if (a == null || b == null || b === 0) return null;
  return a / b;
}

// ---------- 1. Municipal directory (names and regions) ----------

interface DirectoryRow {
  munId: string;
  name: string;
  fullName: string;
  region: string;
}
const directory = new Map<string, DirectoryRow>();
for (const row of readCsv(RAW.directory)) {
  const munId = row["mun-id"]!.trim();
  directory.set(munId, {
    munId,
    name: row.municipality!.trim(),
    fullName: row["full-name"]!.trim(),
    region: row.region!.trim(),
  });
}

// ---------- 2. Winter costs: one row per municipality per year ----------

const records: MunicipalRecord[] = [];
const warnings: string[] = [];

for (const row of readCsv(RAW.costs)) {
  const munId = row["mun-id"]!.trim();
  const dir = directory.get(munId);
  if (!dir) {
    warnings.push(`Cost row for mun-id ${munId} has no directory entry – skipped`);
    continue;
  }
  const year = Number(row.year);
  const tier = row.tier!.trim();
  if (tier !== "Single-tier" && tier !== "Lower-tier" && tier !== "Upper-tier") {
    warnings.push(`Unknown tier "${tier}" for mun-id ${munId} ${year} – skipped`);
    continue;
  }
  const population = populationForYear(year, num(row["population-2016"]), num(row["population-2021"]));
  // A blank total means the municipality did not report that year: keep it null, never 0.
  const totalExpenses = num(row["municipality-winter-cost"]);
  const reported = totalExpenses != null;
  const operatingExpense = num(row["municipality-total-expense"]);
  const roadKm = num(row["total-km-road-length"]);

  records.push({
    munId,
    name: dir.name,
    fullName: dir.fullName,
    region: dir.region,
    area: row.region!.trim(),
    tier: tier as Tier,
    year,
    avgSnowMm: num(row["avg-snow-mm"]),
    totalExpenses,
    roadsCost: reported ? num(row["roads-0621"]) : null,
    sidewalksCost: reported ? num(row["sidewalks-0622"]) : null,
    population,
    spendPerCapita: safeDiv(totalExpenses, population),
    roadKm,
    spendPerKm: safeDiv(totalExpenses, roadKm),
    changeSince2016: null, // filled in below, once every year is loaded
    operatingExpense,
    winterShareOfOperating: safeDiv(totalExpenses, operatingExpense),
  });
}

// ---------- 3. Change in spending per resident since the base year ----------

const baseById = new Map(
  records.filter((r) => r.year === BASE_YEAR).map((r) => [r.munId, r.spendPerCapita] as const),
);
for (const r of records) {
  const base = baseById.get(r.munId) ?? null;
  if (r.year > BASE_YEAR && base != null && r.spendPerCapita != null) r.changeSince2016 = r.spendPerCapita / base - 1;
}

records.sort((a, b) => a.name.localeCompare(b.name) || a.year - b.year);
const years = [...new Set(records.map((r) => r.year))].sort((a, b) => a - b);

for (const r of records.filter((r) => r.totalExpenses == null)) warnings.push(`Not reported: ${r.name} ${r.year}`);
for (const r of records.filter((r) => r.totalExpenses != null && r.operatingExpense == null))
  warnings.push(`No operating expense: ${r.name} ${r.year}`);

const metricsFile: MetricsFile = {
  generatedAt: new Date().toISOString(),
  years,
  records,
};

mkdirSync(path.dirname(OUT.metrics), { recursive: true });
writeFileSync(OUT.metrics, JSON.stringify(metricsFile));

// ---------- 4. GeoJSON: keep GTHA features, fix winding, trim precision ----------

const geo = JSON.parse(readFileSync(RAW.geo, "utf8")) as FeatureCollection<Geometry>;
const PRECISION = 1e4; // 4 decimals ≈ 11 m – plenty for a regional map

function roundRing(ring: Position[]): Position[] {
  const out: Position[] = [];
  for (const [x, y] of ring) {
    const p: Position = [Math.round(x! * PRECISION) / PRECISION, Math.round(y! * PRECISION) / PRECISION];
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  return out;
}

/**
 * d3-geo expects clockwise exterior rings (the opposite of RFC 7946).
 * If a polygon's spherical area is > half the globe, its rings are reversed.
 */
function rewindPolygon(rings: Position[][]): Position[][] {
  const rounded = rings.map(roundRing).filter((r) => r.length >= 4);
  if (rounded.length === 0) return rounded;
  const area = geoArea({ type: "Polygon", coordinates: rounded });
  return area > 2 * Math.PI ? rounded.map((r) => [...r].reverse()) : rounded;
}

const gthaFeatures: Feature[] = [];
for (const f of geo.features) {
  const munId = String(f.properties?.MUNID ?? "").trim();
  const dir = directory.get(munId);
  if (!dir || !f.geometry) continue; // drop neighbouring municipalities outside the study area

  let geometry: Geometry;
  if (f.geometry.type === "Polygon") {
    geometry = { type: "Polygon", coordinates: rewindPolygon(f.geometry.coordinates) };
  } else if (f.geometry.type === "MultiPolygon") {
    geometry = {
      type: "MultiPolygon",
      coordinates: f.geometry.coordinates.map(rewindPolygon).filter((p) => p.length > 0),
    };
  } else {
    continue;
  }
  gthaFeatures.push({
    type: "Feature",
    properties: { munId, name: dir.name, region: dir.region },
    geometry,
  });
}

const missingShapes = [...directory.keys()].filter(
  (id) => !gthaFeatures.some((f) => f.properties?.munId === id),
);
for (const id of missingShapes) warnings.push(`No boundary polygon for mun-id ${id}`);

mkdirSync(path.dirname(OUT.geo), { recursive: true });
writeFileSync(OUT.geo, JSON.stringify({ type: "FeatureCollection", features: gthaFeatures }));

// ---------- report ----------

const munCount = new Set(records.map((r) => r.munId)).size;
console.log(`✔ ${records.length} records (${munCount} municipalities × ${years.length} years: ${years[0]}–${years.at(-1)})`);
console.log(`✔ ${gthaFeatures.length} boundary features written`);
if (warnings.length) {
  console.log(`⚠ ${warnings.length} notes:`);
  for (const w of warnings) console.log(`  - ${w}`);
}
