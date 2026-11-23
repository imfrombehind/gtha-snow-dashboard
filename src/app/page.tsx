"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { FeatureCollection, Geometry } from "geojson";

import SiteHeader from "@/components/SiteHeader";
import GthaMap, { type LegendItem, type MunFeatureProps } from "@/components/Map";
import Comparison from "@/components/Comparison";
import AreaComparison from "@/components/AreaComparison";
import SnowScatter from "@/components/SnowScatter";
import metricsJson from "@/data/municipal-metrics.json";
import {
  CHANGE_LABELS,
  CHANGE_RAMP,
  CHANGE_THRESHOLDS,
  METRIC_BY_KEY,
  NO_DATA_FILL,
  SEQ_RAMP,
  indexRecords,
  seriesByMunicipality,
  type MetricKey,
} from "@/lib/metrics";
import { HEADLINE_YEAR } from "@/lib/insights";
import type { MetricsFile } from "@/lib/types";

/** Measures offered in the map dropdown, in display order. */
const DROPDOWN_METRICS: MetricKey[] = [
  "spendPerCapita",
  "spendPerKm",
  "totalExpenses",
  "winterShareOfOperating",
  "changeSince2016",
  "avgSnowMm",
];

const data = metricsJson as MetricsFile;
// The 26 mapped municipalities. Regions keep their profile pages, but their budgets stay out of every comparison.
const records = data.records.filter((r) => r.tier !== "Upper-tier");
const byYear = indexRecords(records);
const seriesById = seriesByMunicipality(records);
const MIN_YEAR = data.years[0]!;
const MAX_YEAR = data.years.at(-1)!;

/** Short instructions shown at the top of the dashboard. */
const HOW_TO_STEPS = [
  "Select a year using the slider to explore available historical data.",
  "Choose an indicator above the map to view spending or other municipal characteristics.",
  "Hover over a municipality to see its available indicators and supporting information.",
  "Select two municipalities to compare their results side by side.",
];

const PAIR_KEY = "gtha-compare-pair";
const KNOWN_IDS = new Set(records.map((r) => r.munId));
const DEFAULT_PAIR: [string, string] = ["20002", "21005"]; // Toronto, Mississauga

/** The last comparison pair this browser saved, or null if none is usable. */
function readSavedPair(): [string, string] | null {
  try {
    const raw = window.localStorage.getItem(PAIR_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (Array.isArray(value) && value.length === 2 && value.every((id) => typeof id === "string" && KNOWN_IDS.has(id))) {
      return [value[0] as string, value[1] as string];
    }
  } catch {
    // Storage can be blocked or hold bad data; fall back to the default pair.
  }
  return null;
}

function savePair(a: string, b: string) {
  try {
    window.localStorage.setItem(PAIR_KEY, JSON.stringify([a, b]));
  } catch {
    // Ignore: the comparison still works without saving.
  }
}



export default function Page() {
  const router = useRouter();
  const howToRef = useRef<HTMLDetailsElement>(null);
  const [year, setYear] = useState(HEADLINE_YEAR);
  const [metric, setMetric] = useState<MetricKey>("spendPerCapita");
  const [selA, setSelA] = useState<string | null>(DEFAULT_PAIR[0]);
  const [selB, setSelB] = useState<string | null>(DEFAULT_PAIR[1]);
  const [nextSlot, setNextSlot] = useState<"A" | "B">("A");
  const [geo, setGeo] = useState<FeatureCollection<Geometry, MunFeatureProps> | null>(null);
  const [geoError, setGeoError] = useState(false);

  // The Overview tab was merged into the project description; send old "/?tab=overview" links there.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "overview") router.replace("/project");
  }, [router]);

  // Close the "How to explore" dropdown on a click outside it or on Escape.
  useEffect(() => {
    function close(e: Event) {
      const el = howToRef.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !el.contains(e.target as Node)) {
        el.open = false;
        if (e instanceof KeyboardEvent) el.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  // Restore the last saved pair after mount, so the server render matches the default.
  useEffect(() => {
    const saved = readSavedPair();
    if (saved) {
      setSelA(saved[0]);
      setSelB(saved[1]);
    }
  }, []);

  useEffect(() => {
    fetch("/data/gtha-boundaries.geojson")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setGeo)
      .catch(() => setGeoError(true));
  }, []);

  const recordsById = byYear.get(year) ?? new Map();
  const recordsList = [...recordsById.values()];
  const def = METRIC_BY_KEY[metric];

  // Colour scale. Change since 2016 uses fixed bands (blue = fell, rust = grew).
  // Other measures use quantiles over the selected year only.
  const { colorScale, legend } = useMemo((): { colorScale: (v: number) => string; legend: LegendItem[] } => {
    if (def.diverging) {
      const scale = d3.scaleThreshold<number, string>().domain(CHANGE_THRESHOLDS).range(CHANGE_RAMP);
      return {
        colorScale: (v) => scale(v),
        legend: CHANGE_RAMP.map((color, i) => ({ color, label: CHANGE_LABELS[i]! })),
      };
    }
    const values = [...recordsById.values()].map((r) => r[metric]).filter((v): v is number => v != null);
    if (values.length === 0) return { colorScale: () => NO_DATA_FILL, legend: [] };
    const scale = d3.scaleQuantile<string>().domain(values).range(SEQ_RAMP);
    const breaks = scale.quantiles();
    return {
      colorScale: (v) => scale(v),
      legend: SEQ_RAMP.map((color, i) => ({
        color,
        label: i === 0 ? `Under ${def.formatShort(breaks[0]!)}` : `${def.formatShort(breaks[i - 1]!)}+`,
      })),
    };
  }, [def, metric, recordsById]);

  /** Sets both comparison slots and saves the pair once both are filled. */
  function updatePair(a: string | null, b: string | null) {
    setSelA(a);
    setSelB(b);
    if (a && b) savePair(a, b);
  }

  function handleMapSelect(id: string) {
    if (id === selA || id === selB) return;
    if (nextSlot === "A") updatePair(id, selB);
    else updatePair(selA, id);
    setNextSlot(nextSlot === "A" ? "B" : "A");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="dashboard" />

      <main
        id="panel-dashboard"
        className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6"
      >
        <details ref={howToRef} className="group relative self-start">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-ink hover:underline hover:underline-offset-2 [&::-webkit-details-marker]:hidden">
            How to explore the dashboard
            <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-ink-2 transition-transform group-open:rotate-180">
              <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <ol className="absolute left-0 top-full z-10 mt-1 flex w-[min(28rem,calc(100vw-1.5rem))] flex-col gap-2 rounded-md border border-line bg-panel p-4 text-sm leading-snug text-ink-2 shadow-lg">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-semibold text-ink tabular-nums">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </details>

        {/* Map on the left, comparison on the right, so both are visible together */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{METRIC_BY_KEY[metric].label}</h2>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <div className="flex w-full items-center gap-2 rounded-md border border-line bg-panel px-3 py-1.5 text-sm sm:w-auto">
              <label htmlFor="year" className="font-medium">
                Year
              </label>
              <span className="text-xs text-ink-3 tabular-nums">{MIN_YEAR}</span>
              <input
                id="year"
                type="range"
                min={MIN_YEAR}
                max={MAX_YEAR}
                step={1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="year-slider w-auto min-w-0 flex-1 sm:w-36 sm:flex-none"
                style={{ "--fill": `${((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100}%` } as React.CSSProperties}
              />
              <span className="text-xs text-ink-3 tabular-nums">{MAX_YEAR}</span>
              <output htmlFor="year" className="w-12 text-right font-semibold tabular-nums">
                {year}
              </output>
            </div>
            <label className="sr-only" htmlFor="metric">
              Map metric
            </label>
            {/* Native arrow hidden and replaced with the same chevron as "How to explore the dashboard" */}
            <span className="relative w-full sm:w-auto">
              <select
                id="metric"
                value={metric}
                onChange={(e) => setMetric(e.target.value as MetricKey)}
                className="w-full cursor-pointer appearance-none rounded-md border border-line bg-panel py-1.5 pl-3 pr-8 text-sm font-medium text-ink sm:w-auto"
              >
                {DROPDOWN_METRICS.map((key) => (
                  <option key={key} value={key}>
                    {METRIC_BY_KEY[key].label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-2"
              >
                <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <section className="relative h-[70svh] max-h-[560px] min-h-[380px] overflow-hidden rounded-xl border border-line bg-panel lg:h-auto lg:max-h-none lg:min-h-[520px] lg:flex-1">
          {geo ? (
            <GthaMap
              geo={geo}
              year={year}
              metric={metric}
              recordsById={recordsById}
              seriesById={seriesById}
              colorScale={colorScale}
              legend={legend}
              selectedA={selA}
              selectedB={selB}
              onSelect={handleMapSelect}
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-ink-2">
              {geoError ? "Could not load the boundary file." : "Loading map…"}
            </div>
          )}
          <p className="pointer-events-none absolute top-3 left-3 max-w-[calc(100%-4.5rem)] rounded bg-panel/90 px-2 py-1 text-xs italic text-ink-2">
            Click a municipality to set comparison <strong>{nextSlot}</strong>
          </p>
        </section>
        </div>

        <Comparison
          records={records}
          years={data.years}
          year={year}
          metric={metric}
          selA={selA}
          selB={selB}
          onChangeA={(id) => updatePair(id, selB)}
          onChangeB={(id) => updatePair(selA, id)}
        />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <AreaComparison records={records} year={year} />
          <SnowScatter records={records} />
        </div>
      </main>
    </div>
  );
}
