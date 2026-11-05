"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { MunicipalRecord } from "@/lib/types";
import { METRICS, METRIC_BY_KEY, SERIES_A, SERIES_B, formatMetric, type MetricKey } from "@/lib/metrics";

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

export default function Comparison({ records, years, year, metric, selA, selB, onChangeA, onChangeB }: ComparisonProps) {
  const municipalities = useMemo(
    () =>
      [...new Map(records.map((r) => [r.munId, r.name])).entries()]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [records],
  );

  const recA = records.find((r) => r.munId === selA && r.year === year);
  const recB = records.find((r) => r.munId === selB && r.year === year);

  return (
    <section className="rounded-xl border border-line bg-panel p-4" aria-labelledby="compare-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="compare-title" className="text-base font-semibold">
          Compare municipalities · {year}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Picker label="A" color={SERIES_A} value={selA} options={municipalities} onChange={onChangeA} />
          <span className="text-ink-3">vs</span>
          <Picker label="B" color={SERIES_B} value={selB} options={municipalities} onChange={onChangeB} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Side-by-side table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-2">
                <th className="py-2 pr-3 font-medium">Indicator</th>
                <th className="py-2 pr-3 text-right font-medium">{recA?.name ?? "A"}</th>
                <th className="py-2 pr-3 text-right font-medium">{recB?.name ?? "B"}</th>
                <th className="py-2 text-right font-medium">A vs B</th>
              </tr>
            </thead>
            <tbody>
              {METRICS.map((m) => {
                const a = recA?.[m.key] ?? null;
                const b = recB?.[m.key] ?? null;
                const diff = a != null && b != null && b !== 0 ? (a - b) / b : null;
                return (
                  <tr key={m.key} className={`border-b border-line last:border-0 ${m.key === metric ? "bg-surface" : ""}`}>
                    <td className="py-2 pr-3 text-ink-2">{m.label}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatMetric(m.key, a)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatMetric(m.key, b)}</td>
                    <td className="py-2 text-right text-ink-2 tabular-nums">
                      {diff == null ? "—" : `${diff > 0 ? "+" : ""}${d3.format(".0%")(diff)}`}
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
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-line bg-panel px-2 py-1"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}

const H = 220;
const M = { top: 16, right: 16, bottom: 28, left: 64 };

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
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(allValues) ?? 1])
      .nice()
      .range([H - M.bottom, M.top]);

    // Axes (recessive)
    root
      .selectAll<SVGGElement, null>("g.x")
      .data([null])
      .join("g")
      .attr("class", "x")
      .attr("transform", `translate(0,${H - M.bottom})`)
      .call(d3.axisBottom(x).ticks(Math.min(years.length, Math.floor(innerW / 48))).tickFormat(d3.format("d")).tickSizeOuter(0))
      .call((g) => g.selectAll("path,line").attr("stroke", "#d6d5d0"))
      .call((g) => g.selectAll("text").attr("fill", "#52514e"));

    root
      .selectAll<SVGGElement, null>("g.y")
      .data([null])
      .join("g")
      .attr("class", "y")
      .attr("transform", `translate(${M.left},0)`)
      .call(d3.axisLeft(y).ticks(4).tickSize(-innerW).tickFormat((v) => def.format(v as number)))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("line").attr("stroke", "#ecebe7"))
      .call((g) => g.selectAll("text").attr("fill", "#52514e"));

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
      .attr("stroke", "#8a8983")
      .attr("stroke-dasharray", "3 3");

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
        setHoverYear(Math.round(x.invert(px)));
      })
      .on("pointerleave", () => setHoverYear(null));
  }, [width, series, years, year, def, hoverYear]);

  const tipX = hoverYear != null && width ? hoverYear : null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
        <span className="font-medium text-ink">{def.label} over time</span>
        {series.map((s) => (
          <span key={s.slot} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
      <div ref={wrapRef} className="relative">
        <svg ref={svgRef} width={width} height={H} role="img" aria-label={`${def.label} by year for the selected municipalities`} />
        {tipX != null && (
          <div className="pointer-events-none absolute top-0 right-0 rounded-md border border-line bg-panel px-2.5 py-1.5 text-xs shadow-sm">
            <p className="mb-0.5 font-semibold">{tipX}</p>
            {series.map((s) => (
              <p key={s.slot} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="tabular-nums">{formatMetric(metric, s.points.find((p) => p.year === tipX)?.value)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
