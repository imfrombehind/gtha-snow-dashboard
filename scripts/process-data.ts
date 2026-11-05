/**
 * Build-time data pipeline.
 *
 * Reads the raw CSVs + GeoJSON, then writes:
 *   src/data/municipal-metrics.json   – one record per municipality per year (long format)
 *   public/data/gtha-boundaries.geojson – GTHA polygons only, trimmed for the web
 *
 * Run with: npm run data   (also runs automatically before `npm run build`)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { csvParse } from "d3-dsv";
import { geoArea } from "d3-geo";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";
import type { MunicipalRecord, MetricsFile } from "../src/lib/types";

const ROOT = process.cwd();
const RAW = {
  snow: path.join(ROOT, "data/avg-snow-by-municipality.csv"),
  fir: path.join(ROOT, "data/fir-data.csv"),
  directory: path.join(ROOT, "data/municipality-directory.csv"),
  geo: path.join(ROOT, "geospatial data/Municipal_Boun_FeaturesToJSO.geojson"),
};
const OUT = {
  metrics: path.join(ROOT, "src/data/municipal-metrics.json"),
  geo: path.join(ROOT, "public/data/gtha-boundaries.geojson"),
};

// Model assumptions (kept in one place so the Methods panel can show them).
export const ASSUMPTIONS = {
  roadWidthM: 8, // average municipal road width
  snowDensityTPerM3: 0.1, // 100 kg/m³ fresh snow
} as const;

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

/** Divide, returning null when either side is missing or the divisor is 0. */
function safeDiv(a: number | null, b: number | null): number | null {
  if (a == null || b == null || b === 0) return null;
  return a / b;
}

// ---------- 1. Unpivot snow data (wide → long) ----------

const SNOW_COL = /^(?:total-)?avg-snow-(\d{4})$/;

interface SnowRow {
  munId: string;
  year: number;
  avgSnowMm: number | null;
}

const snowLong: SnowRow[] = [];
for (const row of readCsv(RAW.snow)) {
  const munId = row["mun-id"]!.trim();
  for (const [col, value] of Object.entries(row)) {
    const match = SNOW_COL.exec(col);
    if (match) snowLong.push({ munId, year: Number(match[1]), avgSnowMm: num(value) });
  }
}

// ---------- 2. Index FIR expenses and directory by mun-id ----------

const expenses = new Map<string, number | null>(); // key: `${munId}|${year}`
for (const row of readCsv(RAW.fir)) {
  expenses.set(`${row["mun-id"]!.trim()}|${Number(row.year)}`, num(row["total-expenses"]));
}

interface DirectoryRow {
  munId: string;
  name: string;
  fullName: string;
  region: string;
  type: string;
  pop2016: number | null;
  pop2021: number | null;
  roadKm: number | null;
}
const directory = new Map<string, DirectoryRow>();
for (const row of readCsv(RAW.directory)) {
  const munId = row["mun-id"]!.trim();
  directory.set(munId, {
    munId,
    name: row.municipality!.trim(),
    fullName: row["full-name"]!.trim(),
    region: row.region!.trim(),
    type: row["municipal-type"]!.trim(),
    pop2016: num(row["total-pop-2016"]),
    pop2021: num(row["total-pop-2021"]),
    roadKm: num(row["total-km-road-length-2019"]),
  });
}

// ---------- 3–4. Merge, pick population, compute indicators ----------

const records: MunicipalRecord[] = [];
const warnings: string[] = [];

for (const s of snowLong) {
  const dir = directory.get(s.munId);
  if (!dir) {
    warnings.push(`Snow row for mun-id ${s.munId} has no directory entry – skipped`);
    continue;
  }
  const totalExpenses = expenses.get(`${s.munId}|${s.year}`) ?? null;
  const activePopulation = s.year <= 2016 ? dir.pop2016 : dir.pop2021;
  const roadKm = dir.roadKm;

  const roadAreaM2 = roadKm == null ? null : roadKm * 1000 * ASSUMPTIONS.roadWidthM;
  const snowVolumeM3 =
    s.avgSnowMm == null || roadAreaM2 == null ? null : (s.avgSnowMm / 1000) * roadAreaM2;
  const snowTons = snowVolumeM3 == null ? null : snowVolumeM3 * ASSUMPTIONS.snowDensityTPerM3;

  records.push({
    munId: s.munId,
    name: dir.name,
    fullName: dir.fullName,
    region: dir.region,
    year: s.year,
    avgSnowMm: s.avgSnowMm,
    totalExpenses,
    activePopulation,
    roadKm,
    roadAreaM2,
    snowVolumeM3,
    snowTons,
    kmPer1000Residents: safeDiv(roadKm, activePopulation == null ? null : activePopulation / 1000),
    spendPerKm: safeDiv(totalExpenses, roadKm),
    spendPerCapita: safeDiv(totalExpenses, activePopulation),
    tonsPerDollar: safeDiv(snowTons, totalExpenses),
  });
}

records.sort((a, b) => a.name.localeCompare(b.name) || a.year - b.year);
const years = [...new Set(records.map((r) => r.year))].sort((a, b) => a - b);

const missingExpenses = records.filter((r) => r.totalExpenses == null);
for (const r of missingExpenses) warnings.push(`No expenses for ${r.name} ${r.year}`);

const metricsFile: MetricsFile = {
  generatedAt: new Date().toISOString(),
  years,
  assumptions: ASSUMPTIONS,
  records,
};

mkdirSync(path.dirname(OUT.metrics), { recursive: true });
writeFileSync(OUT.metrics, JSON.stringify(metricsFile));

// ---------- 5. GeoJSON: keep GTHA features, fix winding, trim precision ----------

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

console.log(`✔ ${records.length} records (${directory.size} municipalities × ${years.length} years: ${years[0]}–${years.at(-1)})`);
console.log(`✔ ${gthaFeatures.length} boundary features written`);
if (warnings.length) {
  console.log(`⚠ ${warnings.length} notes:`);
  for (const w of warnings) console.log(`  - ${w}`);
}
