// Parses the GTHA winter maintenance levels-of-service dataset (markdown) into JSON for the
// "Profiles" view. Only the 26 municipalities on the map are kept.
//
// Rules:
// - NS / NF / — / N/A / DATA GAP and "NS (…)" cells become null, with the reason kept in `missing`.
// - Disputed cells arrive as "Sources differ: A, B" and are kept as written. Older conflict
//   wording without that marker stops the build.
// - Values with "[2°]" are kept and listed in `secondaryFields`.

import assert from "node:assert/strict";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LOS_DIR = path.join(ROOT, "Level of Services");
const MAP_DATA = path.join(ROOT, "src", "data", "municipal-metrics.json");
const OUT = path.join(ROOT, "src", "data", "level-of-service.json");

type CategoryKey = "expressway" | "arterial" | "collector" | "local" | "sidewalks" | "cycling" | "windrows" | "busStops";

const CATEGORY_MAP: Record<string, CategoryKey> = {
  "Expressway": "expressway",
  "Arterial / Major Road": "arterial",
  "Collector Road": "collector",
  "Local / Residential Road": "local",
  "Sidewalks": "sidewalks",
  "Cycling Infrastructure / Multi-Use Trails": "cycling",
  "Driveway Windrows": "windrows",
  "Bus Stops & Pedestrian Crossovers": "busStops",
};
const CATEGORY_ORDER: CategoryKey[] = ["expressway", "arterial", "collector", "local", "sidewalks", "cycling", "windrows", "busStops"];
const CATEGORY_LABELS: Record<CategoryKey, string> = {
  expressway: "Expressways",
  arterial: "Arterial roads",
  collector: "Collector roads",
  local: "Local / residential roads",
  sidewalks: "Sidewalks",
  cycling: "Cycling & multi-use trails",
  windrows: "Driveway windrows",
  busStops: "Bus stops & pedestrian crossings",
};

const NA_VALUES = new Set(["", "NS", "NF", "—", "-", "N/A", "DATA GAP"]);

type MissingReason = "not-published" | "not-verified" | "not-applicable" | "not-listed";
type LevelField = "salting" | "plowing" | "completion" | "surface" | "mmsClass";
type ClockStart =
  | "After snowfall ends"
  | "After accumulation ends"
  | "After road plowing"
  | "From trigger depth"
  | "Per operating round"
  | "Not stated";

interface Cell {
  text: string | null;
  secondary: boolean;
  missing: MissingReason | null;
}

interface LevelOfService {
  terminology: string | null;
  salting: string | null;
  plowing: string | null;
  completion: string | null;
  surface: string | null;
  mmsClass: string | null;
  notes: string | null;
  /** Why a field is empty, using the dataset's own codes. */
  missing: Partial<Record<LevelField, MissingReason>>;
  /** Shown fields whose value comes from a news or directory source. */
  secondaryFields: LevelField[];
  /** When the completion clock starts. Null when no completion time is shown. */
  clock: ClockStart | null;
  /** Lowest and highest plowing depth published, in cm. Null when no depth is shown. */
  depth: [number, number] | null;
}

interface MunicipalityProfile {
  name: string;
  region: string;
  responsibility: string | null;
  sourceUrl: string | null;
  lastVerified: string | null;
  /** The official page could not be found or verified, so no category has data. */
  unverified: boolean;
  levels: Partial<Record<CategoryKey, LevelOfService | null>>;
}

function missingReason(text: string): MissingReason {
  if (/^NF\b|DATA GAP/.test(text)) return "not-verified";
  if (/^N\/A\b/.test(text)) return "not-applicable";
  if (/^NS\b/.test(text)) return "not-published";
  return "not-listed"; // Blank or a dash: the dataset's legend does not define these.
}

// Key Finding 2 of the dataset names the clock each municipality uses for its roads.
const SNOWFALL_CLOCK = new Set([
  "Mississauga", "Brampton", "Oakville", "Milton", "Halton Hills", "Vaughan", "Richmond Hill",
  "Newmarket", "Whitchurch-Stouffville", "Hamilton", "Oshawa",
]);
const ROAD_KEYS = new Set<CategoryKey>(["expressway", "arterial", "collector", "local"]);

/** The cell's own wording wins; otherwise roads fall back to the municipality's clock from Key Finding 2. */
function clockStart(name: string, key: CategoryKey, completion: string): ClockStart {
  if (/after (?:final |roads?\b|plow|primary)|adjacent roadway/i.test(completion)) return "After road plowing";
  if (name === "Toronto" || /per round|plow cycle/i.test(completion)) return "Per operating round";
  if (/from (?:when snow reaches|\d)/i.test(completion)) return "From trigger depth";
  if (/after accumulation/i.test(completion)) return "After accumulation ends";
  if (/after (?:end of|snow|storm|winter event|significant|event)|following (?:an? |winter )?events?/i.test(completion)) {
    return "After snowfall ends";
  }
  if (ROAD_KEYS.has(key) && SNOWFALL_CLOCK.has(name)) return "After snowfall ends";
  if (ROAD_KEYS.has(key) && name === "Scugog") return "From trigger depth";
  return "Not stated";
}

/** Every depth in a plowing value, as [lowest, highest]: "5 cm / 8 cm" → [5, 8]. */
function depthRange(text: string): [number, number] | null {
  const depths = [...text.matchAll(/(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?\s*cm/g)].flatMap((m) =>
    m[2] ? [Number(m[1]), Number(m[2])] : [Number(m[1])],
  );
  return depths.length ? [Math.min(...depths), Math.max(...depths)] : null;
}

// Self-check on real wording from the dataset; a wrong rule stops the build.
assert.equal(clockStart("Toronto", "local", "Salting 8 hrs; plowing 14 hrs; laneways 24 hrs from end of snowfall"), "Per operating round");
assert.equal(clockStart("Milton", "arterial", "All roads 24 hrs after end of snowfall"), "After snowfall ends");
assert.equal(clockStart("Milton", "collector", "24 hrs"), "After snowfall ends");
assert.equal(clockStart("Mississauga", "sidewalks", "Priority 12–24 hrs"), "Not stated");
assert.equal(clockStart("Markham", "windrows", "Within 4 hrs after road plowed"), "After road plowing");
assert.equal(clockStart("Scugog", "local", "24 hrs from 10 cm"), "From trigger depth");
assert.deepEqual(depthRange("Dispatch > 5 cm; Cl. 1 2.5 cm / Cl. 2 5 cm"), [2.5, 5]);
assert.deepEqual(depthRange("8 cm (3–8 cm per map)"), [3, 8]);
assert.equal(depthRange("Plowed continuously"), null);

function clean(raw: string | undefined): Cell {
  const v = (raw ?? "").trim();
  const secondary = v.includes("[2°]");
  const text = v
    .replace(/\s*\[2°\]/g, "")
    .replace(/\\?\[\d+\\?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const isNA = NA_VALUES.has(text) || /^(NS|NF|N\/A)\b/.test(text);
  return { text: isNA ? null : text, secondary, missing: isNA ? missingReason(text) : null };
}

function tableRows(lines: string[], heading: string): string[][] {
  const start = lines.findIndex((l) => l.startsWith(heading));
  if (start === -1) throw new Error(`Section not found: ${heading}`);
  const rows: string[][] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.startsWith("## ")) break;
    if (!line.startsWith("|") || /^\|\s*-{3}/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells[0] === "Region" || cells[0] === "Municipality") continue; // header rows
    rows.push(cells);
  }
  return rows;
}

const mdFile = readdirSync(LOS_DIR).find((f) => f.endsWith(".md"));
if (!mdFile) throw new Error(`No markdown file found in ${LOS_DIR}`);
const lines = readFileSync(path.join(LOS_DIR, mdFile), "utf8").replace(/\r/g, "").split("\n");

// The dashboard's own municipality list defines what is shown.
const mapData = JSON.parse(readFileSync(MAP_DATA, "utf8")) as { records: { name: string }[] };
const dashboardNames = [...new Set(mapData.records.map((r) => r.name))].sort();

// The dataset says "Region of Peel"; the rest of the site says "Peel Region".
const normalise = (name: string) => name.replace(/^City of /, "").replace(/^Region of (.+)$/, "$1 Region").trim();

// Tab 2: source directory (one row per municipality).
const directory = new Map<string, { region: string; url: string | null; lastVerified: string | null; responsibility: string | null }>();
for (const cells of tableRows(lines, "## Tab 2")) {
  const [municipality, region, url, lastVerified, summary] = cells;
  const u = clean(url);
  const v = clean(lastVerified);
  const s = clean(summary);
  directory.set(normalise(municipality ?? ""), {
    region: (region ?? "").trim() === "Single-Tier" ? "Single-tier cities" : (region ?? "").trim(),
    url: u.text && /^https?:\/\//.test(u.text) ? u.text : null,
    lastVerified: v.text,
    responsibility: s.text,
  });
}

// Tab 1: levels of service (one row per municipality and category).
const levels = new Map<string, Partial<Record<CategoryKey, LevelOfService | null>>>();
const unverified = new Set<string>();
for (const cells of tableRows(lines, "## Tab 1")) {
  const pad = (i: number) => cells[i] ?? "";
  const municipality = normalise(pad(1));
  const categoryLabel = pad(2);
  const notesRaw = pad(9);

  const salting = clean(pad(4));
  const plowing = clean(pad(5));
  const completion = clean(pad(6));
  const surface = clean(pad(7));
  const terminology = clean(pad(3));
  const mms = clean(pad(8));
  const notes = clean(notesRaw);

  const key = CATEGORY_MAP[categoryLabel];
  const map = levels.get(municipality) ?? {};
  if (key) {
    // Disputed cells carry "Sources differ: A, B" and are shown as-is; older conflict wording must be rewritten in the dataset first.
    const unmarked = [notesRaw, pad(4), pad(5), pad(6)].some((c) => /conflict|\svs\s/i.test(c) && !/sources differ/i.test(c));
    if (unmarked) throw new Error(`Unmarked source conflict in ${municipality}|${key}`);
    const fields: Record<LevelField, Cell> = { salting, plowing, completion, surface, mmsClass: mms };
    const shown = {} as Record<LevelField, string | null>;
    const missing: LevelOfService["missing"] = {};
    const secondaryFields: LevelField[] = [];
    for (const field of Object.keys(fields) as LevelField[]) {
      const cell = fields[field];
      shown[field] = cell.text;
      if (cell.missing) missing[field] = cell.missing;
      if (cell.secondary && shown[field]) secondaryFields.push(field);
    }
    map[key] = {
      terminology: terminology.text,
      ...shown,
      notes: notes.text,
      missing,
      secondaryFields,
      clock: shown.completion ? clockStart(municipality, key, shown.completion) : null,
      // Windrow figures are snow heights for clearing driveways, not plowing triggers.
      depth: shown.plowing && key !== "windrows" ? depthRange(shown.plowing) : null,
    };
  } else if (categoryLabel === "All 8 categories") {
    // Uxbridge and Brock: the page could not be verified, so every category is unavailable.
    for (const k of CATEGORY_ORDER) map[k] = null;
    unverified.add(municipality);
  }
  levels.set(municipality, map);
}

const profiles: MunicipalityProfile[] = [];
for (const name of dashboardNames) {
  const dir = directory.get(name);
  const lv = levels.get(name) ?? {};
  for (const k of CATEGORY_ORDER) if (!(k in lv)) lv[k] = null;
  if (!dir && !levels.has(name)) console.warn(`No levels-of-service data matched "${name}"`);
  profiles.push({
    name,
    region: dir?.region ?? "Unassigned",
    responsibility: dir?.responsibility ?? null,
    sourceUrl: dir?.url ?? null,
    lastVerified: dir?.lastVerified ?? null,
    unverified: unverified.has(name),
    levels: lv,
  });
}

const output = {
  source: mdFile,
  categories: CATEGORY_ORDER.map((key) => ({ key, label: CATEGORY_LABELS[key] })),
  municipalities: profiles,
};
writeFileSync(OUT, JSON.stringify(output, null, 2));
console.log(`Wrote ${profiles.length} municipality profiles to ${path.relative(ROOT, OUT)}`);
