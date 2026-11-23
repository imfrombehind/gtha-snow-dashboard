"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import { TABLE, TABLE_CELL, TABLE_HEAD_ROW, TABLE_MISSING, TABLE_ROW, TABLE_ROW_HEADER, TABLE_TH } from "@/lib/typography";
import { FieldValue, absentLabel, type CategoryKey, type LevelField, type ServiceCategory, type ServiceProfile } from "./ServiceLevels";

const ALL_CLOCKS = "all";
const FIELDS: { field: LevelField; label: string }[] = [
  { field: "plowing", label: "Plowing trigger" },
  { field: "completion", label: "Completion time" },
];

function Picker({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 sm:w-72">
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <span className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-md border border-line bg-panel py-1.5 pl-3 pr-8 text-sm font-medium text-ink"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-2">
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
}

/** Returns to the profile that opened this page. A direct visit, or an unknown ?from= value, goes to Toronto. */
export function BackToLevelOfService({ profiles }: { profiles: ServiceProfile[] }) {
  const [from, setFrom] = useState<ServiceProfile | null>(null);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("from");
    setFrom(profiles.find((p) => slugify(p.name) === slug) ?? null);
  }, [profiles]);

  return (
    <Link
      href={`/municipality/${from ? slugify(from.name) : "toronto"}`}
      className="inline-flex min-h-10 w-fit items-center gap-1.5 rounded-md border border-line bg-panel px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface"
    >
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-ink-2">
        <path d="M7.5 2.5 4 6l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {from ? `Back to ${from.name} level of service` : "Back to level of service"}
    </Link>
  );
}

/** One road type across every municipality, always alphabetical so it never reads as a ranking. */
export default function ServiceCompare({
  profiles,
  categories,
}: {
  profiles: ServiceProfile[];
  categories: ServiceCategory[];
}) {
  const [road, setRoad] = useState<CategoryKey>("arterial");
  const [clock, setClock] = useState(ALL_CLOCKS);

  const sorted = [...profiles].sort((a, b) => a.name.localeCompare(b.name));
  const clocks = [...new Set(sorted.flatMap((p) => p.levels[road]?.clock ?? []))].sort();
  const rows = clock === ALL_CLOCKS ? sorted : sorted.filter((p) => p.levels[road]?.clock === clock);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Picker
          id="compare-road"
          label="Road type"
          value={road}
          onChange={(value) => {
            setRoad(value as CategoryKey);
            setClock(ALL_CLOCKS); // Each road type has its own set of clocks.
          }}
          options={categories.map(({ key, label }) => ({ value: key, label }))}
        />
        <Picker
          id="compare-clock"
          label="Completion clock starts"
          value={clock}
          onChange={setClock}
          options={[{ value: ALL_CLOCKS, label: "All clocks" }, ...clocks.map((c) => ({ value: c, label: c }))]}
        />
      </div>

      <p aria-live="polite" className="text-sm text-ink-2">
        Showing {rows.length} of {sorted.length} jurisdictions, in alphabetical order.
        {clock === ALL_CLOCKS && " Filter by clock before comparing completion times."}
      </p>

      <div className="overflow-x-auto">
        <table className={`${TABLE} stack sm:min-w-[760px]`}>
          <thead>
            <tr className={TABLE_HEAD_ROW}>
              <th scope="col" className={`${TABLE_TH} sm:w-52`}>Municipality</th>
              {FIELDS.map(({ field, label }) => (
                <th key={field} scope="col" className={TABLE_TH}>{label}</th>
              ))}
              <th scope="col" className={`${TABLE_TH} sm:w-44`}>Clock starts</th>
              <th scope="col" className={`${TABLE_TH} sm:w-32`}>Target surface</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((profile) => {
              const level = profile.levels[road] ?? null;
              return (
                <tr key={profile.name} className={TABLE_ROW}>
                  <th scope="row" className={TABLE_ROW_HEADER}>
                    <Link href={`/municipality/${slugify(profile.name)}`} className="underline underline-offset-2">
                      {profile.name}
                    </Link>
                  </th>
                  {level ? (
                    <>
                      {FIELDS.map(({ field, label }) => (
                        <td key={field} data-label={label} className={`${TABLE_CELL} text-ink`}>
                          <FieldValue level={level} field={field} />
                        </td>
                      ))}
                      <td data-label="Clock starts" className={`${TABLE_CELL} ${level.clock ? "text-ink" : TABLE_MISSING}`}>
                        {level.clock ?? "—"}
                      </td>
                      <td data-label="Target surface" className={`${TABLE_CELL} text-ink`}>
                        <FieldValue level={level} field="surface" />
                      </td>
                    </>
                  ) : (
                    <td colSpan={4} className={`${TABLE_CELL} ${TABLE_MISSING}`}>{absentLabel(profile, road)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
