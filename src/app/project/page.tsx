import type { Metadata } from "next";
import metricsJson from "@/data/municipal-metrics.json";
import type { MetricsFile } from "@/lib/types";
import { HEADLINE_YEAR } from "@/lib/insights";
import { BODY, EYEBROW, HEADING, JUSTIFY, LIST, LEAD, PAGE, PAGE_HEADER, PAGE_TITLE } from "@/lib/typography";
import SiteHeader from "@/components/SiteHeader";
import PageContents, { type ContentsGroup } from "@/components/PageContents";

const data = metricsJson as MetricsFile;
const EXAMPLE_ID = "21005"; // Mississauga
const example = data.records.find((r) => r.munId === EXAMPLE_ID && r.year === HEADLINE_YEAR) ?? null;
const FIRST_YEAR = data.years[0]!;
const LAST_YEAR = data.years.at(-1)!;

/** "Aurora (2015, 2025), Brock (2025), …": municipality-years with no report, grouped by municipality. */
const NOT_REPORTED = (() => {
  const byName = new Map<string, number[]>();
  for (const r of data.records.filter((r) => r.totalExpenses == null)) {
    byName.set(r.name, [...(byName.get(r.name) ?? []), r.year]);
  }
  return [...byName.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, years]) => `${name} (${years.sort().join(", ")})`)
    .join(", ");
})();
const NOT_REPORTED_COUNT = data.records.filter((r) => r.totalExpenses == null).length;

/** Section wrapper; the scroll margin keeps headings clear of the sticky site header when jumped to. */
const SECTION = "flex scroll-mt-40 flex-col gap-4";

/** Left-hand contents list. Ids match the sections below. */
const CONTENTS: ContentsGroup[] = [
  {
    items: [
      { id: "why-it-matters", label: "Why winter maintenance matters" },
    ],
  },
  {
    title: "How we built the dashboard",
    items: [
      { id: "study-area", label: "1. Study area" },
      { id: "spending", label: "2. Winter maintenance spending" },
      { id: "population-and-snowfall", label: "3. Population and snowfall" },
      { id: "levels-of-service", label: "4. Levels of service" },
      { id: "road-network", label: "5. Estimating road network length" },
      { id: "calculating-the-measures", label: "6. Calculating the measures" },
    ],
  },
  {
    items: [
      { id: "limitations", label: "Limitations" },
      { id: "data-sources", label: "Data sources" },
    ],
  },
];

const TITLE = "Project Description | GTHA Winter Maintenance Dashboard";
const DESCRIPTION = `Why GTHA winter maintenance spending matters, what the numbers show, and how the figures are built: key findings, study area, data sources, formulas, a worked example for ${example?.name ?? "one municipality"} in ${HEADLINE_YEAR}, and known limitations.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", locale: "en_CA" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

const number = (value: number | null | undefined) =>
  value == null ? "No data" : new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 }).format(value);

const dollars = (value: number | null | undefined, digits = 0) =>
  value == null
    ? "No data"
    : new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      }).format(value);


function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-fit text-sm text-ink underline underline-offset-2"
    >
      {children}
    </a>
  );
}

/** "i" link to a source document, styled like the info buttons in the comparison table. */
function InfoLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Read more: ${label} (opens in a new tab)`}
      title={`Read more: ${label}`}
      className="relative -top-px ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-ink-3 align-middle text-[10px] font-semibold leading-none text-ink-2 no-underline hover:border-ink hover:text-ink"
    >
      i
    </a>
  );
}

function Formula({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[13rem_1fr] sm:gap-6">
      <dt className="font-medium text-ink">{name}</dt>
      <dd className="text-ink-2">{children}</dd>
    </div>
  );
}

function Step({ label, basis, value, strong }: { label: React.ReactNode; basis: string; value: string; strong?: boolean }) {
  return (
    <tr className={`border-b border-line ${strong ? "bg-surface" : ""}`}>
      <th scope="row" className={`py-3 pr-4 text-left ${strong ? "font-semibold text-ink" : "font-normal text-ink-2"}`}>
        {label}
      </th>
      <td className="py-3 pr-4 text-left text-ink-3">{basis}</td>
      <td className={`whitespace-nowrap py-3 text-right text-ink ${strong ? "font-semibold" : ""}`}>{value}</td>
    </tr>
  );
}

export default function ProjectPage() {
  return (
    <>
    <SiteHeader active="project" />
    <div className="lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 lg:px-6">
    <PageContents groups={CONTENTS} />
    <main className={`${PAGE} lg:mx-0`}>
      <header className={PAGE_HEADER}>
        <p className={EYEBROW}>GTHA Winter Maintenance</p>
        <h1 className={PAGE_TITLE}>Project overview</h1>
        <p className={`${LEAD} ${JUSTIFY}`}>
          This interactive dashboard compares winter road maintenance spending across all 26 municipalities, using publicly
          available financial, geographic and demographic data, so we can see where the money goes and what might explain
          the gaps. This page explains why that spending matters, where each figure comes from and how it is calculated.
        </p>
      </header>

      <section id="why-it-matters" className={SECTION}>
        <h2 className={HEADING}>Why winter maintenance matters</h2>
        <p className={`${BODY} ${JUSTIFY}`}>
          Winter maintenance is one of the most visible things a municipality does. When a storm hits, residents ask one
          question: can I get where I need to go safely?
        </p>
        <p className={`${BODY} ${JUSTIFY}`}>
          The GTHA is home to millions of people, and a single storm can close schools, delay emergency responders and hold
          up the trucks that move goods.
        </p>
        <aside className="flex flex-col gap-3 bg-ink p-5 text-justify hyphens-auto text-lg font-semibold leading-snug text-white">
          <p>
            <em>"We need to do more, we need to do better," said Toronto Mayor Olivia Chow in February 2025 after a snowstorm
            left the city's response under scrutiny. "All Torontonians deserve to move around the city safely."</em>
          </p>
          <a
            href="https://globalnews.ca/news/11034127/toronto-snowstorm-response-mayor-frustrated/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-normal text-white underline underline-offset-2"
          >
            Source: Global News, February 25, 2025
          </a>
        </aside>
        <p className={`${BODY} ${JUSTIFY}`}>
          Winter services are paid for from municipal budgets. After that storm, Chow called for a full review of the city's
          winter maintenance contracts.
        </p>
        <p className={`${BODY} ${JUSTIFY}`}>
          We built this dashboard to compare spending, population and snowfall across all 26 municipalities. It is a
          starting point for questions, and we do not rank municipalities by performance.
        </p>
      </section>

      <p className="-mb-6 text-xs font-medium uppercase tracking-wide text-ink-3">How we built the dashboard</p>

      <section id="study-area" className={SECTION}>
        <h2 className={HEADING}>1. Study area</h2>
        <p className={BODY}>
          The study area is the Greater Toronto and Hamilton Area (GTHA), the region of southern Ontario around Toronto
          and Hamilton. The unit of analysis is the municipality: an incorporated local government with its own council,
          budget and road network. The dashboard covers 26 municipalities: 2 single-tier municipalities and 24 lower-tier
          municipalities.
        </p>
        <p className={BODY}>Ontario divides some of the region into tiers of government:</p>
        <ul className={LIST}>
          <li>
            <span className="font-medium text-ink">Single-tier:</span> one municipal government provides all local
            services, including roads. Toronto and Hamilton are single-tier.
          </li>
          <li>
            <span className="font-medium text-ink">Upper-tier:</span> a regional municipality that provides services
            across several lower-tier municipalities. The Regions of Durham, Halton, Peel and York are upper-tier.
          </li>
          <li>
            <span className="font-medium text-ink">Lower-tier:</span> a city, town or township within a region, such as
            Mississauga within Peel. The study includes 8 in Durham, 4 in Halton, 3 in Peel and 9 in York.
          </li>
        </ul>
        <p className={BODY}>
          Each tier has its own winter maintenance responsibilities and budget. The dashboard uses single-tier and
          lower-tier spending only. The four Regions pay for winter maintenance on regional roads from their own budgets,
          and that spending is not included, so figures for Durham, Halton, Peel and York cover local roads only.
          Municipal boundary data define the study area and draw the map.
        </p>
      </section>

      <section id="spending" className={SECTION}>
        <h2 className={HEADING}>2. Winter maintenance spending</h2>
        <p className={BODY}>
          Spending comes from Ontario’s provincial Financial Information Return (FIR), the standard annual report every
          municipality files. The dashboard covers {FIRST_YEAR} to {LAST_YEAR}.
        </p>
        <p className={BODY}>
          All figures come from the FIR sheet <span className="font-medium text-ink">CONSOLIDATED STATEMENT OF OPERATIONS: EXPENSES</span>,
          using totals before adjustments:
        </p>
        <ul className={LIST}>
          <li>
            <span className="font-medium text-ink">Item 0621, roads:</span> winter control for roads, such as plowing and
            salting.
          </li>
          <li>
            <span className="font-medium text-ink">Item 0622, sidewalks and parking lots:</span> winter control for
            sidewalks and parking lots.
          </li>
          <li>
            <span className="font-medium text-ink">Item 9910, total expenses:</span> all expenses after total. Used only
            for winter cost as a share of total expenses.
          </li>
        </ul>
        <p className={BODY}>
          Total winter cost is item 0621 plus item 0622. When item 0622 is zero, we read it as sidewalk and parking lot
          costs reported together with roads and show “Included in roads”. A zero can also mean the municipality does not
          pay for sidewalk clearing, so treat the roads and sidewalks split in those years with care.
        </p>
        <p className={BODY}>
          The reports have gaps. {NOT_REPORTED_COUNT} municipality-years were not reported: {NOT_REPORTED}. These show as
          “No data” and are left out of the calculations. {HEADLINE_YEAR} is the latest year with data for 25 of the 26 municipalities, so the map
          opens on {HEADLINE_YEAR}. The reports also do not split spending into labour, equipment, materials or
          contractors, so they cannot explain what drives a municipality’s total.
        </p>
      </section>

      <section id="population-and-snowfall" className={SECTION}>
        <h2 className={HEADING}>3. Population and snowfall</h2>
        <ul className={LIST}>
          <li>
            <span className="font-medium text-ink">Population:</span> Statistics Canada Census counts for 2016 and 2021.
            We use the 2016 count for 2015 and 2016, the 2021 count for 2021 onward, and a straight line between the two
            for 2017 to 2020. Only the two census years are actual counts, so per-resident figures for every other year are
            estimates.
          </li>
          <li>
            <span className="font-medium text-ink">Snowfall:</span> the annual average median snowfall in millimetres for
            each municipality, from 2015 to 2025. It shows how winter weather relates to reported spending. The
            year-to-year pattern is almost identical in every municipality, so treat these figures as estimates.
          </li>
        </ul>
      </section>

      <section id="levels-of-service" className={SECTION}>
        <h2 className={HEADING}>4. Levels of service</h2>
        <p className={BODY}>
          Ontario sets the minimum requirements for road maintenance in the Minimum Maintenance Standards for Municipal
          Highways (MMS)<InfoLink
            href="https://www.ontario.ca/laws/regulation/020239"
            label="Minimum Maintenance Standards for Municipal Highways"
          />. Each municipality then sets its own standards,
          which can go beyond the minimum, so spending depends on the service each one chooses to provide. We reviewed the
          official websites of all 26 municipalities for winter maintenance policies, service standards and descriptions
          of operations. We looked at:
        </p>
        <ul className={LIST}>
          <li>Road classes and maintenance priorities</li>
          <li>Plowing, salting and clearing practices</li>
          <li>Response times and service targets</li>
          <li>Sidewalk clearing and other winter responsibilities</li>
        </ul>
        <p className={BODY}>
          Publication varies widely. Some municipalities post detailed policies, while others give only a general
          description. We use this information for qualitative comparison only. It does not rank service levels or
          measure performance.
        </p>
      </section>

      <section id="road-network" className={SECTION}>
        <h2 className={HEADING}>5. Estimating road network length</h2>
        <p className={BODY}>
          Comparing spending across municipalities of different sizes means knowing how many kilometres of road each one
          has. We first tried using road data published by the municipalities themselves, but we couldn’t find consistent,
          comparable figures for all 26.
        </p>
        <p className={BODY}>
          Instead, we used the 2019 version of the Ontario Road Network (ORN), a province-wide dataset from the Government
          of Ontario. One common source gave us comparable estimates across the study area.
        </p>
        <p className={BODY}>
          This comes with two caveats. Roads inside a municipal boundary aren’t necessarily roads that municipality
          maintains. Depending on how the data are filtered, the totals can include regional or provincial roads. The 2019
          data also miss any changes since then. Keep both in mind when reading spending per kilometre.
        </p>
      </section>

      <section id="calculating-the-measures" className={SECTION}>
        <h2 className={HEADING}>6. Calculating the measures</h2>
        <p className={BODY}>
          We list every number on the dashboard below. We calculate each one for a single municipality and year, and we
          combine those results for areas. Missing values show as "No data" and are left out of every calculation.        </p>
        <h3 className="text-base font-semibold text-ink">Municipality indicators</h3>
        <dl className="flex flex-col divide-y divide-line text-base">
          <Formula name="Total winter spending">
            Item 0621 (roads) plus item 0622 (sidewalks and parking lots), both before adjustments. Shown in dollars.
          </Formula>
          <Formula name="Winter spending per resident">
            Total winter spending ÷ population for that year. Population is the 2016 Census count up to 2016, the 2021
            Census count from 2021, and interpolated in between (see section 3).
          </Formula>
          <Formula name="Winter spending per km of road">
            Total winter spending ÷ road length in km (Ontario Road Network, see section 5). Shown in dollars per km.
          </Formula>
          <Formula name="Change in spending per resident since 2016">
            (Spending per resident in the year ÷ spending per resident in 2016) − 1, as a percentage. The 2016 base uses
            the 2016 Census count, so the change accounts for population growth as well as spending.
          </Formula>
          <Formula name="Total operating expenses">
            Item 9910, all expenses after total, before adjustments. Reported as it appears in the return.
          </Formula>
          <Formula name="Winter spending as a share of operating expenses">
            Total winter spending ÷ total operating expenses (item 9910), as a percentage.
          </Formula>
          <Formula name="Average snowfall (estimated)">
            Annual average median snowfall in millimetres, 2015 to 2025. Reported as it appears in the snowfall data.
          </Formula>
        </dl>
        <h3 className="text-base font-semibold text-ink">Area and GTHA indicators</h3>
        <dl className="flex flex-col divide-y divide-line text-base">
          <Formula name="Area spending per resident">
            Total winter spending of the reporting municipalities ÷ their combined population that year. Area figures are
            pooled, so larger municipalities carry more weight. This applies to Toronto, Hamilton and each Region, such as
            York Region. Regional (upper-tier) spending is not included.
          </Formula>
          <Formula name="GTHA average, spending per resident">
            The same pooled calculation, across every reporting GTHA municipality.
          </Formula>
          <Formula name="GTHA average, spending per km and share of operating expenses">
            Pooled ratios over the municipalities that report both values: total winter spending ÷ total road km, and total
            winter spending ÷ total operating expenses.
          </Formula>
          <Formula name="GTHA average, dollar totals and snowfall">
            The mean of the municipalities that report each value that year. It averages municipalities, with no pooling.
          </Formula>
          <Formula name="Snow and spending chart">
            One point per municipality: its average snowfall and its average winter spending per resident, across the years
            it reported.
          </Formula>
        </dl>

        <p className={BODY}>
          The worked example below is optional. Open it to follow one municipality's calculation step by step.
        </p>
        <details className="group border-t border-line pt-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span>Worked example: {example?.name ?? "Mississauga"}, {HEADLINE_YEAR}</span>
            <span aria-hidden="true" className="text-sm font-normal text-ink-3 group-open:hidden">Show</span>
            <span aria-hidden="true" className="hidden text-sm font-normal text-ink-3 group-open:inline">Hide</span>
          </summary>
          <div className="mt-4 flex flex-col gap-4">
        <p className={BODY}>
          We took every value below from the dataset behind the dashboard, so anyone can check the arithmetic against the
          map.
        </p>
        {example ? (
          <table className="w-full border-collapse text-left text-sm sm:text-base">
            <thead>
              <tr className="border-b-2 border-ink text-xs font-semibold uppercase tracking-wide text-ink-3">
                <th scope="col" className="py-2 pr-4 font-semibold">Step</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Basis</th>
                <th scope="col" className="py-2 text-right font-semibold">Value</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <Step label="Roads" basis="FIR item 0621" value={dollars(example.roadsCost)} />
              <Step label="Sidewalks and parking lots" basis="FIR item 0622" value={dollars(example.sidewalksCost)} />
              <Step label="Total winter spending" basis="Sum of the two items above" value={dollars(example.totalExpenses)} strong />
              <Step label="Population" basis="2021 Census" value={number(example.population)} />
              <Step
                label="Winter spending per resident"
                basis="Total winter spending ÷ population"
                value={dollars(example.spendPerCapita, 2)}
                strong
              />
            </tbody>
          </table>
        ) : (
          <p className={BODY}>The {HEADLINE_YEAR} record for this example is not available in the dataset.</p>
        )}
          </div>
        </details>
      </section>

      <section id="limitations" className={SECTION}>
        <h2 className={HEADING}>Limitations</h2>
        <p className={BODY}>
          We built this dashboard as an exploratory and benchmarking resource, not a definitive ranking of municipal
          efficiency or performance. While provincial financial reports provide a consistent reporting framework, there
          are important limitations in the supporting datasets.
        </p>
        <ol className="flex flex-col gap-6 text-base leading-relaxed text-ink-2">
          <li className="flex flex-col gap-2">
            <span className="font-medium text-ink">1. Population data come from two census years only.</span>
            <span>
              Only 2016 and 2021 are actual census counts. The years in between are interpolated, and the years after 2021
              use the 2021 count, so they do not capture growth since then.
            </span>
          </li>
          <li className="flex flex-col gap-2">
            <span className="font-medium text-ink">2. Financial data are not complete for every year.</span>
            <span>
              Some municipalities did not report for certain years, including the most recent ones. As a result, the
              number of municipalities represented varies by year, and {LAST_YEAR} has the fewest.
            </span>
          </li>
          <li className="flex flex-col gap-2">
            <span className="font-medium text-ink">3. Regional spending is not included.</span>
            <span>
              Toronto and Hamilton pay for winter maintenance on all their roads. In Durham, Halton, Peel and York, the
              Regions pay for regional roads from separate budgets that are not in this dataset. Figures for lower-tier
              municipalities cover only part of the winter maintenance in their area, so compare them with Toronto and
              Hamilton with care.
            </span>
            <span>
              Road length has the opposite issue: it can include regional and provincial roads (see section 5), while
              spending covers local roads only. Spending per km for lower-tier municipalities may therefore read low.
            </span>
          </li>
          <li className="flex flex-col gap-2">
            <span className="font-medium text-ink">4. Municipalities do not all deliver winter maintenance in the same way.</span>
            <span>
              Winter maintenance may be divided between regional and local governments. Some municipalities primarily use
              in-house crews, while others rely more heavily on contractors.
            </span>
            <span>
              Differences in service levels, road characteristics, operating models and financial reporting can all
              influence reported expenditures.
            </span>
          </li>
          <li className="flex flex-col gap-2">
            <span className="font-medium text-ink">5. Figures are in nominal dollars.</span>
            <span>
              Spending is not adjusted for inflation. Part of any change since 2016 reflects rising prices for labour, fuel,
              salt and contracts, not only changes in service.
            </span>
          </li>
          <li className="flex flex-col gap-2">
            <span className="font-medium text-ink">6. Some years are unusual.</span>
            <span>
              Toronto’s 2019 figure includes a one-time transfer, and 2022 was a high-cost year. Toronto’s low 2020 figure
              reflects accounting adjustments, not a cheap winter.
            </span>
          </li>
          <li className="flex flex-col gap-2">
            <span className="font-medium text-ink">7. Snowfall figures are estimates.</span>
            <span>
              Snowfall moves almost identically across municipalities from year to year, so it likely comes from a model.
              It is useful for broad comparisons, not for explaining one municipality’s spending in one year.
            </span>
          </li>
        </ol>
        <p className={BODY}>
          For these reasons, a municipality with higher spending per resident is not necessarily less efficient, just as
          lower spending does not necessarily indicate better performance. Spending differences reflect service levels,
          road networks and contracts, not just snowfall. We built the dashboard to identify patterns, raise questions
          and support further investigation, rather than draw conclusions from any single measure.
        </p>
      </section>

      <section id="data-sources" className={SECTION}>
        <h2 className={HEADING}>Data sources</h2>
        <ol className="flex list-decimal flex-col gap-3 pl-5 text-base text-ink marker:text-ink-3">
          <li>
            <a
              href="https://efis.fma.csc.gov.on.ca/fir/index.php/en/reports-and-dashboards/fir-by-year-and-municipality/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Ontario Ministry of Municipal Affairs and Housing: Financial Information Return
            </a>
          </li>
          <li>
            <a
              href="https://www12.statcan.gc.ca/census-recensement/2016/dp-pd/prof/index.cfm?Lang=E"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Statistics Canada: 2016 Census of Population
            </a>
          </li>
          <li>
            <a
              href="https://open.canada.ca/data/en/dataset/750e6035-adf8-4426-966f-4c25b12a999e"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Statistics Canada: 2021 Census of Population
            </a>
          </li>
          <li className="font-medium">Municipal government websites</li>
          <li>
            <a
              href="https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/index2021-eng.cfm?year=21"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              GTHA municipal boundary GIS data
            </a>
          </li>
          <li className="font-medium">Historical snowfall data</li>
          <li>
            <a
              href="https://geohub.lio.gov.on.ca/datasets/mnrf::ontario-road-network-orn-road-net-element/about"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Ontario Road Network (ORN) Road Net Element, September 27, 2019
            </a>
          </li>
          <li>
            <a
              href="https://carto.com/basemaps/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2"
            >
              CARTO basemaps
            </a>
          </li>
        </ol>
      </section>
    </main>
    </div>
    </>
  );
}
