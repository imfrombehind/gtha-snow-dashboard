import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as d3 from "d3";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import metricsJson from "@/data/municipal-metrics.json";
import losJson from "@/data/level-of-service.json";
import type { MunicipalRecord, MetricsFile } from "@/lib/types";
import { METRIC_BY_KEY, formatMetric } from "@/lib/metrics";
import { slugify } from "@/lib/slug";
import { ServiceLevels, type ServiceCategory, type ServiceProfile } from "@/components/ServiceLevels";
import SiteHeader from "@/components/SiteHeader";
import {
  BODY,
  EYEBROW,
  HEADING,
  JUSTIFY,
  LEAD,
  PAGE_TITLE,
  TABLE,
  TABLE_CELL,
  TABLE_HEAD_ROW,
  TABLE_MISSING,
  TABLE_ROW,
  TABLE_ROW_HEADER,
  TABLE_TH,
} from "@/lib/typography";

const data = metricsJson as MetricsFile;
const los = losJson as unknown as { categories: ServiceCategory[]; municipalities: ServiceProfile[] };

interface BoundaryProps {
  munId: string;
  name: string;
  region: string;
}

const boundaries = JSON.parse(
  readFileSync(path.join(process.cwd(), "public", "data", "gtha-boundaries.geojson"), "utf8"),
) as FeatureCollection<Geometry, BoundaryProps>;

const MUNICIPALITIES = [...new Set(data.records.map((r) => r.name))].sort();
/** Years shown before the "Show earlier years" control. */
const RECENT_YEARS = 5;

/** Records for one municipality, sorted by year. */
function recordsFor(slug: string): MunicipalRecord[] {
  return data
    .records.filter((r) => slugify(r.name) === slug)
    .sort((a, b) => a.year - b.year);
}

export function generateStaticParams() {
  return MUNICIPALITIES.map((name) => ({ slug: slugify(name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const records = recordsFor(slug);
  const name = records[0]?.name ?? "Municipality";
  const title = `${name} winter maintenance spending | GTHA`;
  const description = `Winter spending per resident, total winter spending and level of service for ${name}, ${data.years[0]} to ${data.years.at(-1)}, from provincial financial reports.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "en_CA" },
    twitter: { card: "summary", title, description },
  };
}

/** Sidewalks and parking lots. A reported zero has no stated reason, so the label does not guess one. */
const sidewalks = (r: MunicipalRecord) =>
  r.totalExpenses == null || r.sidewalksCost == null
    ? "No data"
    : r.sidewalksCost === 0
      ? "None reported separately"
      : formatMetric("totalExpenses", r.sidewalksCost);

/** Hero backdrop: the GTHA boundaries with this municipality in the dashboard's dark ink. */
function HeroMap({ name }: { name: string }) {
  const width = 1000;
  const height = 500;
  // A Region has no boundary of its own, so it is drawn as the municipalities inside it.
  const isSelected = (f: Feature<Geometry, BoundaryProps>) => f.properties.name === name || f.properties.region === name;
  const members = boundaries.features.filter(isSelected);
  // Centre the view on this municipality, so its neighbours frame it.
  const focus: FeatureCollection<Geometry, BoundaryProps> = { type: "FeatureCollection", features: members };
  const fitted = d3.geoMercator().fitExtent(
    [
      [0, 0],
      [width, height],
    ],
    focus,
  );
  // Centre on the municipality and zoom out, so the surrounding municipalities stay visible.
  const projection = d3
    .geoMercator()
    .center(d3.geoCentroid(focus))
    .scale(fitted.scale() * (members.length > 1 ? 0.5 : 0.4))
    .translate([width / 2, height / 2]);
  const pathFor = d3.geoPath(projection);
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {boundaries.features.map((feature: Feature<Geometry, BoundaryProps>) => {
        const selected = isSelected(feature);
        return (
          <path
            key={feature.properties.munId}
            d={pathFor(feature) ?? ""}
            fill={selected ? "#2f4d6a" : "#c8e0f4"}
            stroke="#ffffff"
            strokeWidth={selected ? 1.5 : 0.8}
          />
        );
      })}
    </svg>
  );
}

export default async function MunicipalityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const records = recordsFor(slug);
  if (records.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-ink-2">No data for this municipality.</p>
      </main>
    );
  }

  const name = records[0]!.name;
  const region = records[0]!.region;
  const latest = [...records].reverse().find((r) => r.totalExpenses != null) ?? records.at(-1)!;
  const official = los.municipalities.find((m) => m.name === name);
  const serviceProfile = official ?? null;
  const isRegion = records[0]!.tier === "Upper-tier";
  const newestFirst = [...records].reverse();
  const recent = newestFirst.slice(0, RECENT_YEARS);
  const older = newestFirst.slice(RECENT_YEARS);

  return (
    <>
    <SiteHeader active="profile" currentSlug={slug} />
    <main className="flex flex-col">
      <section className="relative h-[300px] overflow-hidden border-b border-line bg-surface sm:h-[380px] md:h-[440px]">
        <HeroMap name={name} />
        <div className="absolute bottom-4 left-4 right-4 max-w-sm border border-line bg-panel/90 p-4 backdrop-blur-sm sm:bottom-5 sm:left-5 sm:right-5 sm:p-6">
          {!isRegion && <p className={EYEBROW}>{region}</p>}
          <h1 className={`${PAGE_TITLE} text-ink`}>{name}</h1>
          <p className={LEAD}>
            Winter road maintenance, {records[0]!.year} to {records.at(-1)!.year}
          </p>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:gap-12 sm:px-5 sm:py-12">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className={`${HEADING} text-ink`}>Level of Service</h2>
            {official?.sourceUrl ? (
              <p className={BODY}>
                <a
                  href={official.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-2"
                >
                  Official winter page
                </a>
                {official.lastVerified && <span> · Last verified {official.lastVerified}</span>}
              </p>
            ) : null}
            <p className={BODY}>
              <Link href={`/level-of-service?from=${slug}`} className="text-ink underline underline-offset-2">
                Compare all municipalities
              </Link>
            </p>
          </div>
          {serviceProfile ? (
            <ServiceLevels profile={serviceProfile} categories={los.categories} />
          ) : (
            <p className={BODY}>No service level data for this municipality.</p>
          )}
        </section>

        <section className="flex flex-col gap-6">
          <h2 className={`${HEADING} text-ink`}>Latest figures, {latest.year}</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <Stat label={METRIC_BY_KEY.spendPerCapita.label} value={formatMetric("spendPerCapita", latest.spendPerCapita)} />
            <Stat label={METRIC_BY_KEY.totalExpenses.label} value={formatMetric("totalExpenses", latest.totalExpenses)} />
            <Stat
              label="Share of operating expenses"
              value={formatMetric("winterShareOfOperating", latest.winterShareOfOperating)}
            />
            <Stat label="Tier" value={latest.tier?.replace("-", " ") ?? "No data"} />
            <Stat label={METRIC_BY_KEY.avgSnowMm.label} value={formatMetric("avgSnowMm", latest.avgSnowMm)} />
          </dl>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className={`${HEADING} text-ink`}>Spending by year</h2>
          <div className="overflow-x-auto">
            <YearTable rows={recent} />
          </div>
          {older.length > 0 && (
            <details className="group">
              <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-ink hover:underline hover:underline-offset-2 [&::-webkit-details-marker]:hidden">
                Show {older.at(-1)!.year} to {older[0]!.year}
                <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-ink-2 transition-transform group-open:rotate-180">
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="mt-3 overflow-x-auto">
                <YearTable rows={older} />
              </div>
            </details>
          )}
          <p className={`${BODY} ${JUSTIFY}`}>
            {isRegion
              ? "Regions have no per-resident or snowfall figures in this dataset, which is why those columns show No data. The figures are this Region’s own spending and are kept out of the dashboard’s comparisons."
              : `No data means ${name} did not report that year; it does not mean nothing was spent. The figures are this municipality’s own spending only; its Region, where there is one, has a separate winter maintenance mandate and budget.`}{" "}
            “None reported separately” means the sidewalks and parking lots item is zero. The costs may be included with
            roads, or the municipality may not pay for sidewalk clearing. Contractor and materials costs are not reported
            separately. Spending differences reflect service levels, road networks and contracts, not just snowfall, and
            snowfall figures are estimates. See the{" "}
            <Link href="/project" className="underline underline-offset-2">project overview</Link> for how each figure is
            calculated.
          </p>
        </section>

      </div>
    </main>
    </>
  );
}

/** Spending, per-resident, share and snowfall for a list of years. Fixed columns keep the two tables aligned. */
function YearTable({ rows }: { rows: MunicipalRecord[] }) {
  const columns = [
    "Roads",
    "Sidewalks and parking lots",
    "Total",
    "Per resident",
    "Operating expenses",
    "Share of operating",
    "Snowfall (estimated)",
  ];
  return (
    <table className={`${TABLE} stack table-fixed sm:min-w-[860px]`}>
      <thead>
        <tr className={TABLE_HEAD_ROW}>
          <th scope="col" className={`${TABLE_TH} w-16`}>Year</th>
          {columns.map((c) => (
            <th key={c} scope="col" className={`${TABLE_TH} text-right`}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {rows.map((r) => {
          const missing = r.totalExpenses == null;
          const cell = `${TABLE_CELL} text-right ${missing ? TABLE_MISSING : "text-ink"}`;
          return (
            <tr key={r.year} className={TABLE_ROW}>
              <th scope="row" className={TABLE_ROW_HEADER}>{r.year}</th>
              <td data-label="Roads" className={cell}>{missing ? "No data" : formatMetric("totalExpenses", r.roadsCost)}</td>
              <td data-label="Sidewalks and parking lots" className={cell}>{sidewalks(r)}</td>
              <td data-label="Total" className={`${cell} font-semibold`}>{formatMetric("totalExpenses", r.totalExpenses)}</td>
              <td data-label="Per resident" className={cell}>{formatMetric("spendPerCapita", r.spendPerCapita)}</td>
              <td data-label="Operating expenses" className={cell}>{formatMetric("operatingExpense", r.operatingExpense)}</td>
              <td data-label="Share of operating" className={cell}>{formatMetric("winterShareOfOperating", r.winterShareOfOperating)}</td>
              <td data-label="Snowfall (estimated)" className={`${TABLE_CELL} text-right ${r.avgSnowMm == null ? TABLE_MISSING : "text-ink"}`}>
                {formatMetric("avgSnowMm", r.avgSnowMm)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-line pt-3">
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="break-words text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</dd>
    </div>
  );
}
