"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import metricsJson from "@/data/municipal-metrics.json";
import type { MetricsFile } from "@/lib/types";
import { slugify } from "@/lib/slug";

export type SiteSection = "dashboard" | "profile" | "project";

const data = metricsJson as MetricsFile;

/** Municipality names grouped by region, for the "Level of service" picker. */
const MUNICIPALITY_GROUPS = [...new Set(data.records.map((r) => r.region))].map((region) => ({
  region,
  names: [...new Set(data.records.filter((r) => r.region === region).map((r) => r.name))].sort(),
}));

const TAB_CLASS = "-mb-px min-w-0 uppercase sm:tracking-wide cursor-pointer whitespace-nowrap border-b-2 px-1 pb-3 pt-2 text-center font-medium sm:shrink-0 sm:px-3 sm:pt-0";
const tabColor = (active: boolean) =>
  active ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink";

/** Site title and navigation, shared by the dashboard, the municipality profile pages and the project description. */
export default function SiteHeader({ active, currentSlug }: { active: SiteSection; currentSlug?: string }) {
  const router = useRouter();

  const profileActive = active === "profile";
  const currentName = MUNICIPALITY_GROUPS.flatMap((g) => g.names).find((name) => slugify(name) === currentSlug);

  return (
    <header className="z-30 border-b border-line bg-panel md:sticky md:top-0">
      <div className="flex flex-col gap-y-1 px-4 pt-3 lg:px-6">
        <div className="min-w-0 pb-2 sm:pb-3">
          <Link href="/" className="text-[27px] font-semibold leading-tight text-ink sm:text-3xl">
            Winter Maintenance Across Greater Toronto and Hamilton Area (GTHA)
          </Link>
          <p className="mt-1 text-xs leading-snug text-ink-2 sm:text-sm">
            By{" "}
            <a href="https://www.thuantruong.com/" target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
              Thuan Truong
            </a>{" "}
            and{" "}
            <a href="https://www.thinhlang.com/" target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
              Thinh Lang
            </a>
            . <span className="italic">First published November 2026.</span>
          </p>
        </div>
        <nav aria-label="Sections" className="grid w-full grid-cols-[1fr_1fr_1.5fr] items-end text-xs sm:w-auto sm:grid-cols-3 sm:gap-1 sm:self-center sm:text-sm">
          <Link
            href="/project"
            aria-current={active === "project" ? "page" : undefined}
            className={`${TAB_CLASS} ${tabColor(active === "project")}`}
          >
            <span aria-hidden="true" className="sm:hidden">Overview</span>
            <span className="sr-only sm:not-sr-only">Project overview</span>
          </Link>
          <Link
            href="/"
            aria-current={active === "dashboard" ? "page" : undefined}
            className={`${TAB_CLASS} ${tabColor(active === "dashboard")}`}
          >
            Dashboard
          </Link>
          {/* The select is invisible and covers the tab, so it keeps its 16px size (no iOS zoom) while the tab matches the others. */}
          <span className={`${TAB_CLASS} ${tabColor(profileActive)} relative flex items-center justify-center gap-1 has-[:focus-visible]:outline-2`}>
            <span className="truncate">{currentName ?? "Level of service"}</span>
            <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
              <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <label htmlFor="open-municipality" className="sr-only">
              Level of service
            </label>
            <select
              id="open-municipality"
              value={currentSlug ?? ""}
              aria-current={profileActive ? "page" : undefined}
              onChange={(e) => {
                if (e.target.value) router.push(`/municipality/${e.target.value}`);
              }}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
            >
              <option value="">Level of service</option>
              {MUNICIPALITY_GROUPS.map(({ region, names }) => (
                <optgroup key={region} label={region}>
                  {names.map((name) => (
                    <option key={name} value={slugify(name)}>
                      {name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </span>
        </nav>
      </div>
    </header>
  );
}
