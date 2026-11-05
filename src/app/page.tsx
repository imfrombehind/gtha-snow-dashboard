"use client";

import { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import type { FeatureCollection, Geometry } from "geojson";

import Sidebar from "@/components/Sidebar";
import GthaMap, { type MunFeatureProps } from "@/components/Map";
import Comparison from "@/components/Comparison";
import metricsJson from "@/data/municipal-metrics.json";
import { METRICS, METRIC_BY_KEY, SEQ_RAMP, indexRecords, type MetricKey, type ScaleMode } from "@/lib/metrics";
import type { MetricsFile } from "@/lib/types";

const data = metricsJson as MetricsFile;
const byYear = indexRecords(data.records);
const MIN_YEAR = data.years[0]!;
const MAX_YEAR = data.years.at(-1)!;


export default function Page() {
  const [year, setYear] = useState(2020);
  const [metric, setMetric] = useState<MetricKey>("tonsPerDollar");
  const [scaleMode, setScaleMode] = useState<ScaleMode>("all-years");
  const [selA, setSelA] = useState<string | null>("20002"); // Toronto
  const [selB, setSelB] = useState<string | null>("21005"); // Mississauga
  const [nextSlot, setNextSlot] = useState<"A" | "B">("A");
  const [geo, setGeo] = useState<FeatureCollection<Geometry, MunFeatureProps> | null>(null);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    fetch("/data/gtha-boundaries.geojson")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setGeo)
      .catch(() => setGeoError(true));
  }, []);

  const recordsById = byYear.get(year) ?? new Map();

  // Colour scale: quantiles over all years (so colours are comparable year to year)
  // or over the selected year only (to spread out the colours for that year).
  const colorScale = useMemo(() => {
    const source = scaleMode === "all-years" ? data.records : [...recordsById.values()];
    const values = source.map((r) => r[metric]).filter((v): v is number => v != null);
    return d3.scaleQuantile<string>().domain(values).range(SEQ_RAMP);
  }, [metric, scaleMode, recordsById]);

  function handleMapSelect(id: string) {
    if (id === selA || id === selB) return;
    if (nextSlot === "A") setSelA(id);
    else setSelB(id);
    setNextSlot(nextSlot === "A" ? "B" : "A");
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* Left: context & controls */}
      <aside className="w-full shrink-0 border-b border-line bg-panel lg:w-[380px] lg:overflow-y-auto lg:border-r lg:border-b-0">
        <Sidebar
          year={year}
          minYear={MIN_YEAR}
          maxYear={MAX_YEAR}
          onYearChange={setYear}
          recordsById={recordsById}
          assumptions={data.assumptions}
        />
      </aside>

      {/* Right: visualization */}
      <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:overflow-y-auto lg:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-ink-2">GTHA municipalities · {year}</p>
            <h2 className="text-xl font-semibold">{METRIC_BY_KEY[metric].label}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="metric">
              Map metric
            </label>
            <select
              id="metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricKey)}
              className="rounded-md border border-line bg-panel px-3 py-1.5 text-sm"
            >
              {METRICS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="flex rounded-md border border-line bg-panel p-0.5 text-sm" role="group" aria-label="Colour scale range">
              {(
                [
                  ["all-years", "Scale: all years"],
                  ["this-year", "Scale: this year"],
                ] as const
              ).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setScaleMode(mode)}
                  aria-pressed={scaleMode === mode}
                  className={`rounded px-2.5 py-1 ${scaleMode === mode ? "bg-ink text-white" : "text-ink-2 hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-line bg-panel lg:min-h-[480px]">
          {geo ? (
            <GthaMap
              geo={geo}
              year={year}
              metric={metric}
              recordsById={recordsById}
              colorScale={colorScale}
              selectedA={selA}
              selectedB={selB}
              onSelect={handleMapSelect}
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-ink-2">
              {geoError ? "Could not load the boundary file." : "Loading map…"}
            </div>
          )}
          <p className="pointer-events-none absolute top-3 right-3 rounded bg-panel/90 px-2 py-1 text-xs text-ink-2">
            Click a municipality to set comparison <strong>{nextSlot}</strong>
          </p>
        </section>

        <Comparison
          records={data.records}
          years={data.years}
          year={year}
          metric={metric}
          selA={selA}
          selB={selB}
          onChangeA={setSelA}
          onChangeB={setSelB}
        />
      </main>
    </div>
  );
}
