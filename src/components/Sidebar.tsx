"use client";

import * as d3 from "d3";
import type { MunicipalRecord, MetricsFile } from "@/lib/types";
import { formatMetric, type MetricKey } from "@/lib/metrics";

interface SidebarProps {
  year: number;
  minYear: number;
  maxYear: number;
  onYearChange: (year: number) => void;
  recordsById: Map<string, MunicipalRecord>;
  assumptions: MetricsFile["assumptions"];
}

export default function Sidebar({ year, minYear, maxYear, onYearChange, recordsById, assumptions }: SidebarProps) {
  const records = [...recordsById.values()];
  const withSpend = records.filter((r) => r.totalExpenses != null);

  return (
    <div className="flex flex-col">
      {/* Title + year slider stay pinned while the text scrolls */}
      <div className="sticky top-0 z-10 border-b border-line bg-panel p-5">
        <p className="text-xs font-medium tracking-wide text-ink-3 uppercase">GTHA Winter Maintenance</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight">Snow plowing across the GTHA</h1>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="year" className="text-sm font-medium">
              Year
            </label>
            <output htmlFor="year" className="text-2xl font-semibold tabular-nums">
              {year}
            </output>
          </div>
          <input
            id="year"
            type="range"
            min={minYear}
            max={maxYear}
            step={1}
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="year-slider mt-2 w-full"
          />
          <div className="flex justify-between text-xs text-ink-3 tabular-nums">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
          {withSpend.length < records.length && (
            <p className="mt-2 text-xs text-ink-2">
              {withSpend.length === 0
                ? `No spending data reported for ${year} yet — only snowfall is shown.`
                : `${records.length - withSpend.length} of ${records.length} municipalities have no spending data for ${year}.`}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 p-5 text-sm leading-relaxed text-ink-2">
        <Section title="About">
          <p>
            This dashboard compares how the 26 municipalities of the Greater Toronto and Hamilton Area (GTHA) spend on
            winter road maintenance, relative to their road networks, populations and the snow they receive.
          </p>
          <p>
            Pick a year with the slider, choose a metric above the map, hover a municipality for its full set of
            indicators, and click two municipalities to compare them side by side.
          </p>
        </Section>

        <Section title={`Findings · ${year}`}>
          <Findings records={records} year={year} />
        </Section>

        <Section title="Methods">
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>Snowfall is reshaped from one column per year into one row per municipality per year.</li>
            <li>
              Snowfall, FIR expenses and the municipal directory are joined on <code>mun-id</code>.
            </li>
            <li>Population uses the 2016 Census for years up to 2016 and the 2021 Census after.</li>
          </ol>
          <dl className="mt-3 space-y-2 rounded-md bg-surface p-3 text-xs">
            <Formula name="Road km per 1,000 residents" f="road km ÷ (population ÷ 1,000)" />
            <Formula name="Spending per km" f="winter expenses ÷ road km" />
            <Formula name="Spending per capita" f="winter expenses ÷ population" />
            <Formula
              name="Snow plowed per dollar (t/$)"
              f={`road km × 1,000 × ${assumptions.roadWidthM} m = road area → × snow depth (m) = volume → × ${assumptions.snowDensityTPerM3} t/m³ = tons → ÷ expenses`}
            />
          </dl>
          <p className="text-xs">
            Assumes an average road width of {assumptions.roadWidthM} m and fresh-snow density of{" "}
            {assumptions.snowDensityTPerM3 * 1000} kg/m³. Road length is fixed at 2019 values. Figures are estimates for
            comparison, not measured tonnage.
          </p>
        </Section>

        <Section title="Data sources">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>
              <strong className="font-medium text-ink">Financial Information Return (FIR)</strong>, Ontario Ministry of
              Municipal Affairs and Housing — winter control expenses (service code 0621).
            </li>
            <li>
              <strong className="font-medium text-ink">Average snowfall by municipality</strong>, {minYear}–{maxYear}.
            </li>
            <li>
              <strong className="font-medium text-ink">Municipal directory</strong> — 2016 & 2021 Census population,
              land area and 2019 road length.
            </li>
            <li>
              <strong className="font-medium text-ink">Municipal boundaries</strong> — Ontario municipal boundary
              GeoJSON.
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Formula({ name, f }: { name: string; f: string }) {
  return (
    <div>
      <dt className="font-medium text-ink">{name}</dt>
      <dd>{f}</dd>
    </div>
  );
}

/** Auto-generated highlights for the selected year. */
function Findings({ records, year }: { records: MunicipalRecord[]; year: number }) {
  const top = (key: MetricKey, dir: "max" | "min") => {
    const valid = records.filter((r) => r[key] != null);
    if (!valid.length) return null;
    return (dir === "max" ? d3.greatest : d3.least)(valid, (r) => r[key]!)!;
  };

  const items: { label: string; rec: MunicipalRecord | null; key: MetricKey }[] = [
    { label: "Most snow moved per dollar", rec: top("tonsPerDollar", "max"), key: "tonsPerDollar" },
    { label: "Highest spending per km", rec: top("spendPerKm", "max"), key: "spendPerKm" },
    { label: "Highest spending per resident", rec: top("spendPerCapita", "max"), key: "spendPerCapita" },
    { label: "Snowiest municipality", rec: top("avgSnowMm", "max"), key: "avgSnowMm" },
  ];

  const totalSpend = d3.sum(records, (r) => r.totalExpenses ?? 0);
  const anySpend = records.some((r) => r.totalExpenses != null);

  return (
    <ul className="space-y-2">
      {anySpend && (
        <li>
          Reporting municipalities spent{" "}
          <strong className="font-semibold text-ink">{formatMetric("totalExpenses", totalSpend)}</strong> on winter
          maintenance in {year}.
        </li>
      )}
      {items.map(
        ({ label, rec, key }) =>
          rec && (
            <li key={label} className="flex items-baseline justify-between gap-3">
              <span>
                {label}: <span className="font-medium text-ink">{rec.name}</span>
              </span>
              <span className="shrink-0 tabular-nums text-ink">{formatMetric(key, rec[key])}</span>
            </li>
          ),
      )}
    </ul>
  );
}
