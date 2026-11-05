"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { Feature, FeatureCollection, Geometry } from "geojson";

import type { MunicipalRecord } from "@/lib/types";
import {
  METRICS,
  METRIC_BY_KEY,
  NO_DATA_FILL,
  SERIES_A,
  SERIES_B,
  formatInt,
  formatMetric,
  type MetricKey,
} from "@/lib/metrics";

export interface MunFeatureProps {
  munId: string;
  name: string;
  region: string;
}
type MunFeature = Feature<Geometry, MunFeatureProps>;

interface MapProps {
  geo: FeatureCollection<Geometry, MunFeatureProps>;
  year: number;
  metric: MetricKey;
  /** munId → record for the active year */
  recordsById: Map<string, MunicipalRecord>;
  colorScale: d3.ScaleQuantile<string>;
  selectedA: string | null;
  selectedB: string | null;
  onSelect: (munId: string) => void;
}

interface Hover {
  munId: string;
  x: number;
  y: number;
}

const PAD = 16;
const TOOLTIP_W = 300;

export default function GthaMap({
  geo,
  year,
  metric,
  recordsById,
  colorScale,
  selectedA,
  selectedB,
  onSelect,
}: MapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<Hover | null>(null);

  // Keep the latest callbacks/data in refs so D3 event handlers never go stale.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // ---- responsive sizing ----
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- projection & path generator (recomputed on resize only) ----
  const path = useMemo(() => {
    if (!size.w || !size.h) return null;
    const projection = d3.geoMercator().fitExtent(
      [
        [PAD, PAD],
        [size.w - PAD, size.h - PAD - 64], // leave room for the legend
      ],
      geo,
    );
    return d3.geoPath(projection);
  }, [geo, size.w, size.h]);

  // ---- draw / update municipality shapes ----
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !path) return;
    const root = d3.select(svg);

    // Hatch pattern for "no data"
    let defs = root.select<SVGDefsElement>("defs");
    if (defs.empty()) {
      defs = root.append("defs");
      const p = defs
        .append("pattern")
        .attr("id", "nodata-hatch")
        .attr("width", 6)
        .attr("height", 6)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("patternTransform", "rotate(45)");
      p.append("rect").attr("width", 6).attr("height", 6).attr("fill", NO_DATA_FILL);
      p.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke", "#c9c8c2").attr("stroke-width", 1.5);
    }

    const shapes = root
      .selectAll<SVGGElement, null>("g.shapes")
      .data([null])
      .join("g")
      .attr("class", "shapes");

    const fillFor = (d: MunFeature) => {
      const v = recordsById.get(d.properties.munId)?.[metric];
      return v == null ? "url(#nodata-hatch)" : colorScale(v);
    };

    const showAt = (event: PointerEvent | FocusEvent, d: MunFeature) => {
      const wrap = wrapRef.current!.getBoundingClientRect();
      let x: number;
      let y: number;
      if ("clientX" in event) {
        x = event.clientX - wrap.left;
        y = event.clientY - wrap.top;
      } else {
        [x, y] = path.centroid(d);
      }
      setHover({ munId: d.properties.munId, x, y });
    };

    shapes
      .selectAll<SVGPathElement, MunFeature>("path")
      .data(geo.features as MunFeature[], (d) => d.properties.munId)
      .join((enter) =>
        enter
          .append("path")
          .attr("tabindex", 0)
          .attr("role", "button")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1)
          .attr("stroke-linejoin", "round")
          .style("cursor", "pointer")
          .style("outline", "none")
          .attr("fill", fillFor),
      )
      .attr("d", path)
      .attr("aria-label", (d) => {
        const v = recordsById.get(d.properties.munId)?.[metric];
        return `${d.properties.name}: ${METRIC_BY_KEY[metric].label} ${formatMetric(metric, v)}`;
      })
      .on("pointerenter pointermove", (event: PointerEvent, d) => showAt(event, d))
      .on("pointerleave", () => setHover(null))
      .on("focus", (event: FocusEvent, d) => showAt(event, d))
      .on("blur", () => setHover(null))
      .on("click", (_e, d) => onSelectRef.current(d.properties.munId))
      .on("keydown", (event: KeyboardEvent, d) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectRef.current(d.properties.munId);
        }
      })
      .transition()
      .duration(450)
      .attr("fill", fillFor);
  }, [geo, path, recordsById, metric, colorScale]);

  // ---- overlay: hover outline + A/B selection outlines and badges ----
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !path) return;
    const overlay = d3
      .select(svg)
      .selectAll<SVGGElement, null>("g.overlay")
      .data([null])
      .join("g")
      .attr("class", "overlay")
      .style("pointer-events", "none");

    const byId = new Map(geo.features.map((f) => [f.properties.munId, f as MunFeature]));
    const outlines = [
      hover && { id: hover.munId, color: "#0b0b0b", width: 2, label: "" },
      selectedA && { id: selectedA, color: SERIES_A, width: 3, label: "A" },
      selectedB && { id: selectedB, color: SERIES_B, width: 3, label: "B" },
    ].filter((o): o is { id: string; color: string; width: number; label: string } => !!o && byId.has(o.id));

    overlay
      .selectAll<SVGPathElement, (typeof outlines)[number]>("path")
      .data(outlines, (o) => `${o.label}-${o.id}`)
      .join("path")
      .attr("d", (o) => path(byId.get(o.id)!) ?? "")
      .attr("fill", "none")
      .attr("stroke", (o) => o.color)
      .attr("stroke-width", (o) => o.width)
      .attr("stroke-linejoin", "round");

    const badges = outlines.filter((o) => o.label);
    const g = overlay
      .selectAll<SVGGElement, (typeof badges)[number]>("g.badge")
      .data(badges, (o) => o.label)
      .join((enter) => {
        const b = enter.append("g").attr("class", "badge");
        b.append("circle").attr("r", 10).attr("stroke", "#ffffff").attr("stroke-width", 2);
        b.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "#ffffff")
          .attr("font-size", 11)
          .attr("font-weight", 700);
        return b;
      })
      .attr("transform", (o) => `translate(${path.centroid(byId.get(o.id)!)})`);
    g.select("circle").attr("fill", (o) => o.color);
    g.select("text").text((o) => o.label);
  }, [geo, path, hover, selectedA, selectedB]);

  // ---- tooltip ----
  const hovered = hover ? recordsById.get(hover.munId) : undefined;
  const hoveredName = hover ? geo.features.find((f) => f.properties.munId === hover.munId)?.properties.name : "";
  const tipLeft = hover ? (hover.x + 16 + TOOLTIP_W > size.w ? hover.x - 16 - TOOLTIP_W : hover.x + 16) : 0;
  const tipTop = hover ? Math.max(8, Math.min(hover.y - 20, size.h - 300)) : 0;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <svg ref={svgRef} width={size.w} height={size.h} role="img" aria-label={`Choropleth map of ${METRIC_BY_KEY[metric].label}, ${year}`} />

      <Legend colorScale={colorScale} metric={metric} />

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-line bg-panel p-3 text-sm shadow-lg"
          style={{ left: Math.max(8, tipLeft), top: tipTop, width: TOOLTIP_W }}
          role="tooltip"
        >
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="font-semibold">{hoveredName}</p>
            <p className="text-xs text-ink-2">{year}</p>
          </div>
          {hovered ? (
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
              {METRICS.map((m) => (
                <div key={m.key} className="contents">
                  <dt className={m.key === metric ? "font-medium text-ink" : "text-ink-2"}>{m.label}</dt>
                  <dd className={`text-right tabular-nums ${m.key === metric ? "font-semibold" : ""}`}>
                    {formatMetric(m.key, hovered[m.key])}
                  </dd>
                </div>
              ))}
              <dt className="text-ink-2">Population used</dt>
              <dd className="text-right tabular-nums">{formatInt(hovered.activePopulation)}</dd>
              <dt className="text-ink-2">Est. snow on roads</dt>
              <dd className="text-right tabular-nums">{formatInt(hovered.snowTons)} t</dd>
            </dl>
          ) : (
            <p className="text-ink-2">No data for this year.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Legend({ colorScale, metric }: { colorScale: d3.ScaleQuantile<string>; metric: MetricKey }) {
  const def = METRIC_BY_KEY[metric];
  const hasData = colorScale.domain().length > 0;
  const range = colorScale.range();
  const breaks = hasData ? [d3.min(colorScale.domain())!, ...colorScale.quantiles(), d3.max(colorScale.domain())!] : [];

  return (
    <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-md bg-panel/95 p-2 text-xs">
      <p className="mb-1 font-medium">{def.label}</p>
      {hasData ? (
        <div className="flex flex-wrap items-end gap-x-0.5 gap-y-2">
          {range.map((color, i) => (
            <div key={color} className="flex w-[72px] flex-col gap-1">
              <span className="h-3 rounded-sm" style={{ background: color }} />
              <span className="tabular-nums text-ink-2">
                {i === 0 ? "" : "≥ "}
                {def.format(breaks[i]!)}
              </span>
            </div>
          ))}
          <div className="ml-2 flex w-[56px] flex-col gap-1">
            <svg className="h-3 w-full rounded-sm" aria-hidden>
              <rect width="100%" height="100%" fill="url(#nodata-hatch)" />
            </svg>
            <span className="text-ink-2">No data</span>
          </div>
        </div>
      ) : (
        <p className="text-ink-2">No data for this metric in this year.</p>
      )}
    </div>
  );
}
