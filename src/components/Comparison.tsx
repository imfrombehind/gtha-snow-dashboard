"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as d3 from "d3";
import type { MunicipalRecord } from "@/lib/types";
import {
  GTHA_AVG_ID,
  METRIC_BY_KEY,
  SERIES_A,
  SERIES_B,
  formatMetric,
  gthaAverageRecords,
  type MetricKey,
} from "@/lib/metrics";
import { TABLE, TABLE_CELL, TABLE_HEAD_ROW, TABLE_MISSING, TABLE_ROW, TABLE_ROW_HEADER, TABLE_TH } from "@/lib/typography";

type NumericField = {
  [K in keyof MunicipalRecord]: MunicipalRecord[K] extends number | null ? K : never;
}[keyof MunicipalRecord];

interface TableRow {
  field: NumericField;
  label: string;
  /** Metric whose formatter is used for the value. */
  format: MetricKey;
  /** Map metric(s) that highlight this row. */
  highlight: MetricKey[];
  /** A component of total winter spending, shown indented under it. */
  part?: boolean;
  /** Text shown for a reported zero, whose reason the data does not state. */
  zeroText?: string;
  /** Shown in an info popover: a Financial Information Return line, or a method note linking to its section. */
  info?: { schedule?: string; code?: string; text: string; href?: string };
  /**
   * The value is itself a share (0 to 1), so A vs B is the difference in percentage points, not a relative change:
   * 0.94% vs 0.85% reads "+0.09 pts", where a relative change would read a misleading "+10%".
   */
  points?: boolean;
}

/** A vs B: percentage-point gap for shares, measured on the values as displayed (2 decimals); relative change otherwise. */
function compare(a: number, b: number, points: boolean | undefined): string {
  if (points) {
    const gap = Math.round(a * 10000) / 100 - Math.round(b * 10000) / 100;
    if (Math.abs(gap) < 0.005) return "About equal";
    return `${Math.abs(gap).toFixed(2)} pts ${gap > 0 ? "higher" : "lower"}`;
  }
  const diff = (a - b) / b;
  const percent = d3.format(",.0%")(Math.abs(diff));
  return percent === "0%" ? "About equal" : `${percent} ${diff > 0 ? "higher" : "lower"}`;
}

/** Rows of the side-by-side table: size-adjusted measures first, then the totals that mostly reflect size. */
const TABLE_ROWS: TableRow[] = [
  {
    field: "spendPerCapita",
    label: METRIC_BY_KEY.spendPerCapita.label,
    format: "spendPerCapita",
    highlight: ["spendPerCapita", "changeSince2016"],
    info: {
      text: "Uses the 2016 census count for 2015 to 2020 and the 2021 count from 2021 onward, so growth between censuses is not captured.",
      href: "/project#population-and-snowfall",
    },
  },
  {
    field: "spendPerKm",
    label: METRIC_BY_KEY.spendPerKm.label,
    format: "spendPerKm",
    highlight: ["spendPerKm"],
    info: {
      text: "Road length comes from the 2019 Ontario Road Network and can include regional and provincial roads, so lower-tier figures may read low.",
      href: "/project#road-network",
    },
  },
  {
    field: "winterShareOfOperating",
    label: METRIC_BY_KEY.winterShareOfOperating.label,
    format: "winterShareOfOperating",
    highlight: ["winterShareOfOperating"],
    points: true,
  },
  {
    field: "avgSnowMm",
    label: METRIC_BY_KEY.avgSnowMm.label,
    format: "avgSnowMm",
    highlight: ["avgSnowMm"],
    info: {
      text: "Baseline total snowfall from climate projections (CanDCS-M6), averaged across four emissions scenarios.",
      href: "/project#population-and-snowfall",
    },
  },
  {
    field: "totalExpenses",
    label: "Total winter spending",
    format: "totalExpenses",
    highlight: ["totalExpenses"],
    info: {
      text: "Lower-tier figures exclude what their Region spends on regional roads, so compare them with Toronto and Hamilton with care.",
      href: "/project#limitations",
    },
  },
  {
    field: "roadsCost",
    label: "Roads only",
    format: "totalExpenses",
    highlight: ["totalExpenses"],
    part: true,
    info: { schedule: "40", code: "0621", text: "Winter Control - Except Sidewalks, Parking Lots" },
  },
  {
    field: "sidewalksCost",
    label: "Sidewalks and parking lots only",
    format: "totalExpenses",
    highlight: ["totalExpenses"],
    part: true,
    zeroText: "None reported separately",
    info: { schedule: "40", code: "0622", text: "Winter Control - Sidewalks, Parking Lots Only" },
  },
  {
    field: "operatingExpense",
    label: METRIC_BY_KEY.operatingExpense.label,
    format: "operatingExpense",
    highlight: ["operatingExpense"],
    info: { schedule: "40", code: "9910", text: "Total Expenses Before Adjustments" },
  },
];

interface ComparisonProps {
  records: MunicipalRecord[];
  years: number[];
  year: number;
  metric: MetricKey;
  selA: string | null;
  selB: string | null;
  onChangeA: (id: string) => void;
  onChangeB: (id: string) => void;
}

export default function Comparison({ records: baseRecords, years, year, metric, selA, selB: selBProp, onChangeA, onChangeB }: ComparisonProps) {
  const [vsAverage, setVsAverage] = useState(false);
  // Municipal records plus one synthetic "GTHA average" record per year.
  const records = useMemo(() => [...baseRecords, ...gthaAverageRecords(baseRecords)], [baseRecords]);
  const selB = vsAverage ? GTHA_AVG_ID : selBProp;

  const municipalities = useMemo(
    () =>
      [...new Map(baseRecords.map((r) => [r.munId, r.name])).entries()]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [baseRecords],
  );

  const recA = records.find((r) => r.munId === selA && r.year === year);
  const recB = records.find((r) => r.munId === selB && r.year === year);
  const nameA = recA?.name ?? "A";
  const nameB = recB?.name ?? "B";

  return (
    <section className="min-w-0 rounded-xl border border-line bg-panel p-3 sm:p-4" aria-labelledby="compare-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="compare-title" className="text-base font-semibold">
          {vsAverage ? "Compare to the GTHA average" : "Compare municipalities"} in {year}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Picker label="A" color={SERIES_A} value={selA} options={municipalities} onChange={onChangeA} />
          <span className="text-ink-3">vs</span>
          {vsAverage ? (
            <span className="flex items-center gap-1.5">
              <span
                className="grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white"
                style={{ background: SERIES_B }}
                aria-hidden
              >
                B
              </span>
              <span className="rounded-md border border-line bg-surface px-2 py-1">GTHA average</span>
            </span>
          ) : (
            <Picker label="B" color={SERIES_B} value={selB} options={municipalities} onChange={onChangeB} />
          )}
          <button
            type="button"
            onClick={() => setVsAverage((v) => !v)}
            aria-pressed={vsAverage}
            className={`rounded-md border px-2.5 py-1 font-medium ${
              vsAverage ? "border-ink bg-ink text-panel" : "border-line bg-panel text-ink hover:bg-surface"
            }`}
          >
            {vsAverage ? "Compare to a municipality" : "Compare to GTHA average"}
          </button>
        </div>
      </div>

      {vsAverage && (
        <div className="-mt-2 mb-4 text-xs italic text-ink-2">
          <p className="font-semibold">GTHA average:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>
              Spending per resident is GTHA-wide (total winter spending ÷ total population of municipalities reporting
              that year).
            </li>
            <li>The share of operating expenses is GTHA-wide (total winter spending ÷ total operating expenses).</li>
            <li>Dollar totals and snowfall are the average across reporting municipalities.</li>
          </ul>
        </div>
      )}

      <div className="grid gap-6">
        {/* Side-by-side table */}
        <div className="overflow-x-auto">
          {/* Explicit roles: the phone layout uses CSS grid, which removes native table semantics. */}
          <table role="table" className={`${TABLE} compare-table`}>
            <thead role="rowgroup">
              <tr role="row" className={TABLE_HEAD_ROW}>
                <th role="columnheader" scope="col" className={TABLE_TH}>Indicator</th>
                <th role="columnheader" scope="col" className={`${TABLE_TH} text-right`}>{nameA}</th>
                <th role="columnheader" scope="col" className={`${TABLE_TH} text-right`}>{nameB}</th>
                <th role="columnheader" scope="col" className={`${TABLE_TH} text-right`}>A vs B</th>
              </tr>
            </thead>
            <tbody role="rowgroup" className="tabular-nums">
              {TABLE_ROWS.map((row, i) => {
                // A component is only meaningful when that year's total was reported.
                const pick = (rec: MunicipalRecord | undefined) =>
                  rec && (!row.part || rec.totalExpenses != null) ? (rec[row.field] ?? null) : null;
                const a = pick(recA);
                const b = pick(recB);
                // Skip the comparison when a component is a reported zero: "−100%" would mislead.
                const diff =
                  a != null && b != null && (row.points || b !== 0) && !(row.zeroText && a === 0)
                    ? compare(a, b, row.points)
                    : null;
                const text = (v: number | null) => (v === 0 && row.zeroText ? row.zeroText : formatMetric(row.format, v));
                const value = (v: number | null) =>
                  `${TABLE_CELL} ${v === 0 && row.zeroText ? "" : "whitespace-nowrap"} text-right ${v == null ? TABLE_MISSING : row.part ? "text-ink-2" : "text-ink"}`;
                return (
                  <tr role="row" key={row.field} className={`${TABLE_ROW} ${row.highlight.includes(metric) ? "bg-surface" : ""}`}>
                    <th
                      role="rowheader"
                      scope="row"
                      className={`relative ${row.part ? "py-3 pr-4 pl-4 text-left font-normal text-ink-2" : TABLE_ROW_HEADER}`}
                    >
                      {row.label}
                      {/* The last rows open upward so the note is not cut off by the table's scroll area. */}
                      {row.info && <InfoTip {...row.info} label={row.label} above={i >= TABLE_ROWS.length - 2} />}
                    </th>
                    <td role="cell" className={value(a)}>{text(a)}</td>
                    <td role="cell" className={value(b)}>{text(b)}</td>
                    <td role="cell" className={`${TABLE_CELL} whitespace-nowrap text-right text-ink-2`}>
                      {diff ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Trend of the active map metric */}
        <TrendChart records={records} years={years} year={year} metric={metric} selA={selA} selB={selB} />
      </div>
    </section>
  );
}

function Picker({
  label,
  color,
  value,
  options,
  onChange,
}: {
  label: string;
  color: string;
  value: string | null;
  options: { id: string; name: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex items-center gap-1.5">
      <span
        className="grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white"
        style={{ background: color }}
        aria-hidden
      >
        {label}
      </span>
      <span className="sr-only">Municipality {label}</span>
      {/* Native arrow hidden and replaced with the dashboard chevron, so the box fits the name plus the arrow */}
      <span className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="max-w-[11rem] cursor-pointer appearance-none rounded-md border border-line bg-panel py-1 pl-2.5 pr-7 sm:max-w-none"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-2"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}

/** "i" button that shows a source line or method note on click; closes on outside click or Escape. */
function InfoTip({
  schedule,
  code,
  text,
  href,
  label,
  above,
}: {
  schedule?: string;
  code?: string;
  text: string;
  href?: string;
  label: string;
  above: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="ml-1.5 inline-block align-middle sm:relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={schedule ? `About ${label}: Schedule ${schedule}, Item ${code}` : `About ${label}`}
        className="relative grid h-4 w-4 cursor-pointer place-items-center rounded-full border border-ink-3 text-[10px] font-semibold leading-none text-ink-2 after:absolute after:-inset-3 hover:border-ink hover:text-ink"
      >
        i
      </button>
      {open && (
        <span
          role="note"
          className={`absolute left-0 right-0 z-20 block rounded-md border border-line bg-panel px-3 py-2 text-xs font-normal italic text-ink shadow-sm sm:right-auto sm:w-64 ${
            above ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {schedule && (
            <>
              <span className="font-semibold tabular-nums">
                Schedule {schedule}, Item {code},
              </span>{" "}
            </>
          )}
          {text}
          {href && (
            <>
              {" "}
              <Link href={href} className="font-medium not-italic underline underline-offset-2">
                Read the method
              </Link>
            </>
          )}
        </span>
      )}
    </span>
  );
}

// Same chart standard as the snowfall scatter: blue axes, 11px labels, axis titles, tooltip beside the point.
const H = 260;
const M = { top: 16, right: 20, bottom: 44, left: 72 };
const TIP_W = 200;

function TrendChart({
  records,
  years,
  year,
  metric,
  selA,
  selB,
}: {
  records: MunicipalRecord[];
  years: number[];
  year: number;
  metric: MetricKey;
  selA: string | null;
  selB: string | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const def = METRIC_BY_KEY[metric];

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e!.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const series = useMemo(
    () =>
      [
        { slot: "A", id: selA, color: SERIES_A },
        { slot: "B", id: selB, color: SERIES_B },
      ]
        .filter((s) => s.id)
        .map((s) => {
          const rows = records.filter((r) => r.munId === s.id).sort((a, b) => a.year - b.year);
          return { ...s, name: rows[0]?.name ?? "", points: rows.map((r) => ({ year: r.year, value: r[metric] })) };
        }),
    [records, selA, selB, metric],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !width) return;
    const root = d3.select(svg);
    const innerW = width - M.left - M.right;

    const x = d3.scaleLinear().domain(d3.extent(years) as [number, number]).range([M.left, M.left + innerW]);
    const allValues = series.flatMap((s) => s.points.map((p) => p.value)).filter((v): v is number => v != null);
    // Start at zero, but extend below it when a measure (change since 2016) has negative values.
    const y = d3
      .scaleLinear()
      .domain([Math.min(0, d3.min(allValues) ?? 0), Math.max(d3.max(allValues) ?? 1, 0)])
      .nice()
      .range([H - M.bottom, M.top]);

    // Axes (recessive)
    root
      .selectAll<SVGGElement, null>("g.x")
      .data([null])
      .join("g")
      .attr("class", "x")
      .attr("transform", `translate(0,${H - M.bottom})`)
      .call(d3.axisBottom(x).ticks(Math.min(years.length, Math.floor(innerW / 48))).tickFormat(d3.format("d")).tickSize(0).tickPadding(10))
      .call((g) => g.select(".domain").attr("stroke", "#c8e0f4"))
      .call((g) => g.selectAll("text").attr("fill", "#557388").attr("font-size", 11));

    root
      .selectAll<SVGGElement, null>("g.y")
      .data([null])
      .join("g")
      .attr("class", "y")
      .attr("transform", `translate(${M.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat((v) => def.formatShort(v as number)))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("line").attr("stroke", "#e3f2fc"))
      .call((g) => g.selectAll("text").attr("fill", "#557388").attr("font-size", 11).attr("dx", -4));

    // Axis titles
    root
      .selectAll<SVGTextElement, string>("text.x-title")
      .data(["Year"])
      .join("text")
      .attr("class", "x-title")
      .attr("x", M.left + innerW / 2)
      .attr("y", H - 6)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#4a6a88")
      .text((d) => d);
    root
      .selectAll<SVGTextElement, string>("text.y-title")
      .data([def.label])
      .join("text")
      .attr("class", "y-title")
      .attr("transform", `translate(14 ${M.top + (H - M.top - M.bottom) / 2}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .attr("font-size", 11)
      .attr("fill", "#4a6a88")
      .text((d) => d);

    // Active-year marker
    root
      .selectAll<SVGLineElement, number>("line.year")
      .data([year])
      .join("line")
      .attr("class", "year")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", M.top)
      .attr("y2", H - M.bottom)
      .attr("stroke", "#557388")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", "4 3");

    // Hover crosshair
    root
      .selectAll<SVGLineElement, number>("line.hover")
      .data(hoverYear != null ? [hoverYear] : [])
      .join("line")
      .attr("class", "hover")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", M.top)
      .attr("y2", H - M.bottom)
      .attr("stroke", "#c8e0f4")
      .attr("pointer-events", "none");

    const line = d3
      .line<{ year: number; value: number | null }>()
      .defined((p) => p.value != null)
      .x((p) => x(p.year))
      .y((p) => y(p.value!));

    root
      .selectAll<SVGPathElement, (typeof series)[number]>("path.series")
      .data(series, (s) => s.slot)
      .join("path")
      .attr("class", "series")
      .attr("fill", "none")
      .attr("stroke", (s) => s.color)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .transition()
      .duration(300)
      .attr("d", (s) => line(s.points));

    // Hover dots
    const dots = series.flatMap((s) =>
      s.points
        .filter((p) => p.year === hoverYear && p.value != null)
        .map((p) => ({ key: s.slot, color: s.color, cx: x(p.year), cy: y(p.value!) })),
    );
    root
      .selectAll<SVGCircleElement, (typeof dots)[number]>("circle.dot")
      .data(dots, (d) => d.key)
      .join("circle")
      .attr("class", "dot")
      .attr("r", 4.5)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("pointer-events", "none")
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy);

    // Invisible hit area for the crosshair tooltip
    root
      .selectAll<SVGRectElement, null>("rect.hit")
      .data([null])
      .join("rect")
      .attr("class", "hit")
      .attr("x", M.left)
      .attr("y", M.top)
      .attr("width", innerW)
      .attr("height", H - M.top - M.bottom)
      .attr("fill", "transparent")
      .on("pointermove", (event: PointerEvent) => {
        const [px] = d3.pointer(event);
        const yr = Math.round(x.invert(px));
        setHoverYear(Math.max(years[0]!, Math.min(years.at(-1)!, yr)));
      })
      .on("pointerleave", () => setHoverYear(null));
  }, [width, series, years, year, def, hoverYear]);

  // Tooltip beside the hovered year, flipped to the left near the right edge.
  let tip: { left: number; top: number } | null = null;
  if (hoverYear != null && width) {
    const x = d3.scaleLinear().domain(d3.extent(years) as [number, number]).range([M.left, width - M.right]);
    const cx = x(hoverYear);
    const left = cx + 12 + TIP_W > width ? cx - 12 - TIP_W : cx + 12;
    tip = { left: Math.max(0, left), top: M.top };
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold">
          {def.label}, {years[0]} to {years.at(-1)}
        </h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
          {series.map((s) => (
            <span key={s.slot} className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
      <div ref={wrapRef} className="relative">
        <svg ref={svgRef} width={width} height={H} role="img" aria-label={`${def.label} by year for the selected municipalities`} />
        {hoverYear != null && tip && (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-10 rounded-lg border border-line bg-panel p-3 text-sm shadow-lg"
            style={{ left: tip.left, top: tip.top, width: TIP_W }}
          >
            <p className="mb-1.5 font-semibold">{hoverYear}</p>
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-xs">
              {series.map((s) => (
                <Fragment key={s.slot}>
                  <dt className="flex items-center gap-1.5 text-ink-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </dt>
                  <dd className="text-right font-semibold tabular-nums text-ink">
                    {formatMetric(metric, s.points.find((p) => p.year === hoverYear)?.value)}
                  </dd>
                </Fragment>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
