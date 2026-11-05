import type { MunicipalRecord } from "./types";

/** Five-step sequential blue ramp, light → dark, for the choropleth. */
export const SEQ_RAMP = ["#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#0d366b"];
export const NO_DATA_FILL = "#e9e8e4";
export const SERIES_A = "#2a78d6";
export const SERIES_B = "#eb6834";

export type ScaleMode = "all-years" | "this-year";

export type MetricKey =
  | "tonsPerDollar"
  | "spendPerKm"
  | "spendPerCapita"
  | "kmPer1000Residents"
  | "avgSnowMm"
  | "totalExpenses";

export interface MetricDef {
  key: MetricKey;
  label: string;
  short: string;
  unit: string;
  format: (v: number) => string;
}

const compact = new Intl.NumberFormat("en-CA", { notation: "compact", maximumFractionDigits: 1 });
const money0 = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 });
const dec2 = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 2 });
const dec3 = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 3, minimumFractionDigits: 3 });

export const METRICS: MetricDef[] = [
  {
    key: "tonsPerDollar",
    label: "Snow plowed per dollar",
    short: "Tons / $",
    unit: "t/$",
    format: (v) => `${dec3.format(v)} t`,
  },
  {
    key: "spendPerKm",
    label: "Winter spending per km of road",
    short: "$ / km",
    unit: "$/km",
    format: (v) => money0.format(v),
  },
  {
    key: "spendPerCapita",
    label: "Winter spending per resident",
    short: "$ / capita",
    unit: "$/person",
    format: (v) => money2.format(v),
  },
  {
    key: "kmPer1000Residents",
    label: "Road km per 1,000 residents",
    short: "km / 1k pop",
    unit: "km",
    format: (v) => `${dec2.format(v)} km`,
  },
  {
    key: "avgSnowMm",
    label: "Average snowfall",
    short: "Snow (mm)",
    unit: "mm",
    format: (v) => `${dec2.format(v)} mm`,
  },
  {
    key: "totalExpenses",
    label: "Total winter maintenance spending",
    short: "Total $",
    unit: "$",
    format: (v) => `$${compact.format(v)}`,
  },
];

export const METRIC_BY_KEY = Object.fromEntries(METRICS.map((m) => [m.key, m])) as Record<
  MetricKey,
  MetricDef
>;

export function formatMetric(key: MetricKey, value: number | null | undefined): string {
  return value == null ? "No data" : METRIC_BY_KEY[key].format(value);
}

export const formatInt = (v: number | null) =>
  v == null ? "No data" : new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(v);

/** Index records as year → munId → record for fast lookup. */
export function indexRecords(records: MunicipalRecord[]) {
  const byYear = new Map<number, Map<string, MunicipalRecord>>();
  for (const r of records) {
    if (!byYear.has(r.year)) byYear.set(r.year, new Map());
    byYear.get(r.year)!.set(r.munId, r);
  }
  return byYear;
}
