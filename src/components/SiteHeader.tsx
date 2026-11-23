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

const TAB_CLASS = "-mb-px uppercase tracking-wide cursor-pointer whitespace-nowrap border-b-2 px-2 pb-3 pt-2 text-center font-medium sm:shrink-0 sm:px-3 sm:pt-0";
const tabColor = (active: boolean) =>
  active ? "border-ink text-ink" : "border-transparent text-ink-2 hover:text-ink";

/** Site title and navigation, shared by the dashboard, the municipality profile pages and the project description. */
export default function SiteHeader({ active, currentSlug }: { active: SiteSection; currentSlug?: string }) {
  const router = useRouter();

  const profileActive = active === "profile";

  return (
    <header className="z-30 border-b border-line bg-panel md:sticky md:top-0">
      <div className="flex flex-col gap-y-1 px-4 pt-3 lg:px-6">
        <div className="min-w-0 pb-2 sm:pb-3">
          <Link href="/" className="text-lg font-semibold leading-tight text-ink sm:text-xl">
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
        <nav aria-label="Sections" className="grid w-full grid-cols-[auto_minmax(0,1fr)] text-sm sm:w-auto sm:grid-cols-3 sm:items-end sm:gap-1 sm:self-center">
          <Link
            href="/project"
            aria-current={active === "project" ? "page" : undefined}
            className={`${TAB_CLASS} ${tabColor(active === "project")} col-span-2 sm:col-span-1`}
          >
            Project overview
          </Link>
          <Link
            href="/"
            aria-current={active === "dashboard" ? "page" : undefined}
            className={`${TAB_CLASS} ${tabColor(active === "dashboard")}`}
          >
            Dashboard
          </Link>
          <span className="group relative flex w-full items-end">
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
              className={`${TAB_CLASS} ${tabColor(profileActive)} w-full cursor-pointer appearance-none bg-transparent px-7 [text-align-last:center] focus-visible:outline-2 max-sm:pl-2 max-sm:pr-6 max-sm:tracking-normal`}
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
            <svg
              aria-hidden="true"
              viewBox="0 0 12 12"
              className={`pointer-events-none absolute right-2 bottom-[18px] h-3 w-3 group-hover:text-ink ${
                profileActive ? "text-ink" : "text-ink-2"
              }`}
            >
              <path
                d="M2.5 4.5 6 8l3.5-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </nav>
      </div>
    </header>
  );
}
