import type { MunicipalRecord } from "@/lib/types";
import { areaLabel, areaSummaries } from "@/lib/insights";

/** Spending per resident for the six areas in one year. */
export default function AreaComparison({ records, year }: { records: MunicipalRecord[]; year: number }) {
  const yearRecords = records.filter((r) => r.year === year);
  // Alphabetical, so the list stays put between years and does not read as a ranking.
  const areas = areaSummaries(yearRecords).sort((a, b) => areaLabel(a.area).localeCompare(areaLabel(b.area)));
  const max = Math.max(...areas.map((a) => a.perResident ?? 0), 1);

  return (
    <section aria-labelledby="area-title" className="flex flex-col gap-3 min-w-0 rounded-xl border border-line bg-panel p-3 sm:p-4">
      <div>
        <h2 id="area-title" className="text-base font-semibold">
          Spending per resident by area in {year}
        </h2>
      </div>
      <ul className="flex flex-col gap-2">
        {areas.map((a) => (
          <li key={a.area} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-2 text-sm sm:grid-cols-[7.5rem_1fr_3.5rem] sm:gap-3">
            <span className="text-ink">{areaLabel(a.area)}</span>
            {a.perResident != null ? (
              <>
                <span className="h-4">
                  <span className="block h-full bg-ink" style={{ width: `${(a.perResident / max) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums text-ink">${Math.round(a.perResident)}</span>
              </>
            ) : (
              <span className="col-span-2 text-xs italic text-ink-3">No data for {year}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
