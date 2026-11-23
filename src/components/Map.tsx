"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Map as MapLibreMap, type MapMouseEvent, setWorkerUrl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { MunicipalRecord } from "@/lib/types";
import { METRIC_BY_KEY, NO_DATA_FILL, SERIES_A, SERIES_B, formatMetric, ordinal, type MetricKey } from "@/lib/metrics";

/** Secondary rows in the hover card; the row matching the map's measure is shown as the headline instead. */
const TOOLTIP_DETAILS: { key: MetricKey; label: string }[] = [
  { key: "spendPerCapita", label: "Spending per resident" },
  { key: "totalExpenses", label: "Total winter spending" },
  { key: "winterShareOfOperating", label: "Share of operating expenses" },
  { key: "avgSnowMm", label: "Average snowfall (estimated)" },
];

export interface MunFeatureProps {
  munId: string;
  name: string;
  region: string;
}
type MunFeature = Feature<Geometry, MunFeatureProps>;

export interface LegendItem {
  color: string;
  label: string;
}

interface MapProps {
  geo: FeatureCollection<Geometry, MunFeatureProps>;
  year: number;
  metric: MetricKey;
  /** munId → record for the active year */
  recordsById: Map<string, MunicipalRecord>;
  /** munId → every year's record, for the hover trend line */
  seriesById: Map<string, MunicipalRecord[]>;
  colorScale: (value: number) => string;
  legend: LegendItem[];
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
const TOOLTIP_H = 330;
const LEGEND_H = 104; // Legend, its scale note, and the map credit strip below it.

// Carto Positron (no labels) vector style. Key comes from NEXT_PUBLIC_CARTO_API_KEY in .env.local.
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;
const STYLE_URL = `https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json${
  CARTO_KEY ? `?key=${encodeURIComponent(CARTO_KEY)}` : ""
}`;
/** Map padding that keeps the boundaries clear of the legend; the legend wraps taller on narrow maps. */
const fitPadding = (w: number) => ({ top: PAD, right: PAD, left: PAD, bottom: PAD + (w < 480 ? LEGEND_H + 16 : LEGEND_H) });

export default function GthaMap({
  geo,
  year,
  metric,
  recordsById,
  seriesById,
  colorScale,
  legend,
  selectedA,
  selectedB,
  onSelect,
}: MapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<Hover | null>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null);
  // Bumped on every map move so the SVG overlay is re-projected.
  const [view, setView] = useState(0);

  // Keep the latest callbacks in refs so map event handlers never go stale.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const bounds = useMemo(() => d3.geoBounds(geo) as [[number, number], [number, number]], [geo]);
  const ready = size.w > 0 && size.h > 0;

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

  // ---- MapLibre basemap (pan / zoom / wheel / pinch handled here) ----
  useEffect(() => {
    const el = containerRef.current;
    if (!ready || !el) return;
    // MapLibre cannot find its worker file under Next's bundler, so serve it from /public.
    setWorkerUrl("/maplibre-gl-worker.mjs");
    const map = new MapLibreMap({
      container: el,
      style: STYLE_URL,
      bounds,
      fitBoundsOptions: { padding: fitPadding(el.clientWidth) },
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: { compact: true },
    });
    const bump = () => setView((v) => v + 1);
    map.on("load", bump);
    map.on("move", bump);
    map.on("resize", bump);
    map.on("dragstart", () => setHover(null));
    setMapInstance(map);
    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [ready, bounds]);

  // ---- projection: MapLibre's view drives the SVG overlay ----
  const path = useMemo(() => {
    if (!mapInstance) return null;
    return d3.geoPath(
      d3.geoTransform({
        point(x, y) {
          const p = mapInstance.project([x, y]);
          this.stream.point(p.x, p.y);
        },
      }),
    );
  }, [mapInstance, view]);

  // ---- hover & click on the map, using point-in-polygon against each municipality ----
  useEffect(() => {
    if (!mapInstance) return;
    const featureAt = (p: { lng: number; lat: number }) =>
      geo.features.find((f) => d3.geoContains(f, [p.lng, p.lat])) as MunFeature | undefined;

    const onMove = (e: MapMouseEvent) => {
      if (mapInstance.isMoving()) return setHover(null);
      const f = featureAt(e.lngLat);
      mapInstance.getCanvas().style.cursor = f ? "pointer" : "";
      setHover(f ? { munId: f.properties.munId, x: e.point.x, y: e.point.y } : null);
    };
    const onClick = (e: MapMouseEvent) => {
      const f = featureAt(e.lngLat);
      if (f) onSelectRef.current(f.properties.munId);
    };
    const onOut = () => {
      mapInstance.getCanvas().style.cursor = "";
      setHover(null);
    };

    mapInstance.on("mousemove", onMove);
    mapInstance.on("click", onClick);
    mapInstance.on("mouseout", onOut);
    return () => {
      mapInstance.off("mousemove", onMove);
      mapInstance.off("click", onClick);
      mapInstance.off("mouseout", onOut);
    };
  }, [mapInstance, geo]);

  // ---- zoom buttons ----
  const zoomIn = () => mapInstance?.zoomIn({ duration: 300 });
  const zoomOut = () => mapInstance?.zoomOut({ duration: 300 });
  const resetZoom = () => mapInstance?.fitBounds(bounds, { padding: fitPadding(size.w), duration: 300 });

  // ---- draw / update municipality shapes ----
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !path) return;
    const root = d3.select(svg);

    // Hatch pattern for "not reported"
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
      p.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("stroke", "#88aecf").attr("stroke-width", 1.5);
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

    // Pointer input is handled by the map (see above). These paths stay focusable for keyboard users.
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
          .style("outline", "none")
          .attr("fill", fillFor),
      )
      .attr("d", path)
      .attr("aria-label", (d) => {
        const v = recordsById.get(d.properties.munId)?.[metric];
        return `${d.properties.name}: ${METRIC_BY_KEY[metric].label} ${formatMetric(metric, v)}`;
      })
      .on("focus", (_e: FocusEvent, d) => {
        const [x, y] = path.centroid(d);
        setHover({ munId: d.properties.munId, x, y });
      })
      .on("blur", () => setHover(null))
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

  // ---- municipality name labels (above shapes, below hover/selection overlay) ----
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !path) return;
    const labels = d3
      .select(svg)
      .selectAll<SVGGElement, null>("g.labels")
      .data([null])
      .join("g")
      .attr("class", "labels text-ink")
      .attr("aria-hidden", "true")
      .attr("pointer-events", "none");

    labels
      .selectAll<SVGTextElement, MunFeature>("text")
      .data(geo.features as MunFeature[], (d) => d.properties.munId)
      .join("text")
      .attr("x", (d) => path.centroid(d)[0])
      .attr("y", (d) => path.centroid(d)[1])
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", 10)
      .attr("font-weight", 600)
      .attr("fill", "currentColor")
      // White halo keeps the names readable over both colours and hatching.
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("paint-order", "stroke")
      .text((d) => d.properties.name);
  }, [geo, path]);

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
      hover && { id: hover.munId, color: "#2f4d6a", width: 2, label: "" },
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
      // Sits above the centre so it does not cover the municipality's name.
      .attr("transform", (o) => {
        const [x, y] = path.centroid(byId.get(o.id)!);
        return `translate(${x},${y - 18})`;
      });
    g.select("circle").attr("fill", (o) => o.color);
    g.select("text").text((o) => o.label);
  }, [geo, path, hover, selectedA, selectedB]);

  // ---- rank of each municipality by spending per resident in the active year ----
  const ranking = useMemo(() => {
    const ordered = [...recordsById.values()]
      .filter((r) => r[metric] != null)
      .sort((a, b) => b[metric]! - a[metric]!);
    return { rankById: new Map(ordered.map((r, i) => [r.munId, i + 1])), count: ordered.length };
  }, [recordsById, metric]);

  // ---- tooltip ----
  const hovered = hover ? recordsById.get(hover.munId) : undefined;
  const hoveredName = hover ? geo.features.find((f) => f.properties.munId === hover.munId)?.properties.name : "";
  // Narrow maps (phones): shrink the tooltip to fit and pin it to the top edge, clear of the finger.
  const tipW = Math.min(TOOLTIP_W, Math.max(0, size.w - 16));
  const compact = size.w < 480;
  const tipLeft = hover
    ? compact
      ? (size.w - tipW) / 2
      : hover.x + 16 + tipW > size.w
        ? hover.x - 16 - tipW
        : hover.x + 16
    : 0;
  const tipTop = hover ? (compact ? 8 : Math.max(8, Math.min(hover.y - 20, size.h - TOOLTIP_H))) : 0;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {/* MapLibre renders the basemap here; the SVG overlay sits on top and ignores the pointer. */}
      {/* Inline style: MapLibre's CSS sets position:relative on this element, which would collapse it to zero height. */}
      <div ref={containerRef} className="absolute inset-0" style={{ position: "absolute", inset: 0 }} />

      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0"
        width={size.w}
        height={size.h}
        role="img"
        aria-label={`Map of ${METRIC_BY_KEY[metric].label}, ${year}`}
      />

      <Legend
        title={METRIC_BY_KEY[metric].label}
        items={legend}
        note={
          METRIC_BY_KEY[metric].diverging
            ? undefined
            : `Shades apply to ${year} only. Compare within a year.`
        }
      />

      <div className="absolute right-3 top-3 z-20 flex flex-col overflow-hidden rounded-md border border-line bg-panel shadow">
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom in"
          className="h-10 w-10 sm:h-8 sm:w-8 text-lg leading-none hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom out"
          className="h-10 w-10 sm:h-8 sm:w-8 border-t border-line text-lg leading-none hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        >
          −
        </button>
        <button
          type="button"
          onClick={resetZoom}
          aria-label="Reset zoom"
          className="h-10 w-10 sm:h-8 sm:w-8 border-t border-line text-xs hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        >
          ⟲
        </button>
      </div>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 max-h-[calc(100%-1rem)] overflow-hidden rounded-lg border border-line bg-panel p-3 text-sm shadow-lg"
          style={{ left: Math.max(8, tipLeft), top: tipTop, width: tipW }}
          role="tooltip"
        >
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="font-semibold">{hoveredName}</p>
            <p className="text-xs text-ink-2">{year}</p>
          </div>
          {hovered && hovered.totalExpenses != null ? (
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-2xl font-semibold tabular-nums leading-tight text-ink">
                  {formatMetric(metric, hovered[metric])}
                  {metric === "spendPerCapita" && (
                    <span className="ml-1 text-sm font-normal text-ink-2">per resident</span>
                  )}
                </p>
                {metric !== "spendPerCapita" && <p className="text-xs text-ink-2">{METRIC_BY_KEY[metric].label}</p>}
                {ranking.rankById.has(hovered.munId) && (
                  <p className="text-xs text-ink-2">
                    {ordinal(ranking.rankById.get(hovered.munId)!)} highest of the {ranking.count} municipalities
                    reporting in {year}
                  </p>
                )}
              </div>
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-xs">
                {TOOLTIP_DETAILS.filter((d) => d.key !== metric).map((d) => (
                  <Fragment key={d.key}>
                    <dt className="text-ink-2">{d.label}</dt>
                    <dd className="text-right tabular-nums text-ink">{formatMetric(d.key, hovered[d.key])}</dd>
                  </Fragment>
                ))}
              </dl>
              <TierNote record={hovered} />
            </div>
          ) : (
            <p className="text-ink-2">
              No report for {year}.
            </p>
          )}
          <Sparkline series={seriesById.get(hover.munId) ?? []} year={year} />
        </div>
      )}
    </div>
  );
}

/** Which tier of government the municipality is; each tier has its own winter maintenance mandate. */
function TierNote({ record }: { record: MunicipalRecord }) {
  if (record.tier == null) return null;
  return <p className="text-xs italic text-ink-2">{record.tier === "Single-tier" ? "Single-tier" : "Lower-tier"} municipality</p>;
}

/** Spending per resident across all years, with the active year marked. Gaps are years not reported. */
function Sparkline({ series, year }: { series: MunicipalRecord[]; year: number }) {
  const values = series.map((r) => r.spendPerCapita).filter((v): v is number => v != null);
  if (values.length < 2) return null;
  const W = 276;
  const H = 44;
  const P = 4;
  const years = series.map((r) => r.year);
  const x = d3.scaleLinear().domain(d3.extent(years) as [number, number]).range([P, W - P]);
  const y = d3.scaleLinear().domain([0, d3.max(values)!]).range([H - P, P]);
  const line = d3
    .line<MunicipalRecord>()
    .defined((r) => r.spendPerCapita != null)
    .x((r) => x(r.year))
    .y((r) => y(r.spendPerCapita!));
  const current = series.find((r) => r.year === year)?.spendPerCapita;
  return (
    <figure className="mt-1 border-t border-line pt-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-11 w-full" aria-hidden="true">
        <path d={line(series) ?? ""} fill="none" stroke="#2f4d6a" strokeWidth={1.5} strokeLinejoin="round" />
        {current != null && (
          <circle cx={x(year)} cy={y(current)} r={3.5} fill="#b5461a" stroke="#ffffff" strokeWidth={1.5} />
        )}
      </svg>
      <figcaption className="flex justify-between text-[11px] text-ink-3">
        <span>{years[0]}</span>
        <span>Spending per resident</span>
        <span>{years.at(-1)}</span>
      </figcaption>
    </figure>
  );
}

function Legend({ title, items, note }: { title: string; items: LegendItem[]; note?: string }) {
  return (
    // Raised above the bottom strip so the map credit never covers it.
    <div className="absolute bottom-8 left-2 max-w-[calc(100%-1rem)] rounded-md bg-panel/95 p-2 text-[11px] max-sm:right-2 sm:left-3 sm:max-w-[calc(100%-1.5rem)] sm:text-xs">
      <p className="mb-1 font-medium">{title}</p>
      {items.length > 0 ? (
        <div className="grid grid-cols-6 items-start gap-x-0.5 gap-y-1 leading-tight sm:flex sm:flex-wrap sm:items-end sm:gap-y-2 sm:leading-normal">
          {items.map(({ color, label }) => (
            <div key={`${color}-${label}`} className="flex min-w-0 flex-col gap-1 sm:w-[72px]">
              <span className="h-3 rounded-sm" style={{ background: color }} />
              <span className="tabular-nums text-ink-2">{label}</span>
            </div>
          ))}
          <div className="flex min-w-0 flex-col gap-1 sm:ml-2 sm:w-[72px]">
            <svg className="h-3 w-full rounded-sm" aria-hidden>
              <rect width="100%" height="100%" fill="url(#nodata-hatch)" />
            </svg>
            <span className="text-ink-2">Not reported</span>
          </div>
        </div>
      ) : (
        <p className="text-ink-2">No data for this measure in this year.</p>
      )}
      {note && items.length > 0 && <p className="mt-1 italic text-ink-2">{note}</p>}
    </div>
  );
}
