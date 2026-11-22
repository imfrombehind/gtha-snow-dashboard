import type { MunicipalRecord } from "./types";

/**
 * Headline year: the latest year with nearly every municipality reporting (25 of 26; Hamilton did not report).
 * 2025 has only 23 of 26, so it is shown on the map but not used for headline comparisons.
 */
export const HEADLINE_YEAR = 2024;
export const BASE_YEAR = 2016;

const reported = (r: MunicipalRecord) => r.totalExpenses != null && r.population != null;

/** Display name for an area: Toronto and Hamilton are single cities, the others are Regions. */
export function areaLabel(area: string): string {
  return area === "Toronto" || area === "Hamilton" ? area : `${area} Region`;
}

/** Spending per resident across a set of records, weighted by population (total spend ÷ total residents). */
export function pooledPerResident(records: MunicipalRecord[]): number | null {
  const rs = records.filter(reported);
  const people = rs.reduce((s, r) => s + r.population!, 0);
  return people === 0 ? null : rs.reduce((s, r) => s + r.totalExpenses!, 0) / people;
}

const mean = (values: number[]) => (values.length ? values.reduce((s, v) => s + v, 0) / values.length : null);

export interface YearSummary {
  year: number;
  perResident: number | null;
  avgSnowMm: number | null;
  reportedCount: number;
  totalCount: number;
}

export function yearSummaries(records: MunicipalRecord[]): YearSummary[] {
  const years = [...new Set(records.map((r) => r.year))].sort((a, b) => a - b);
  return years.map((year) => {
    const rs = records.filter((r) => r.year === year);
    return {
      year,
      perResident: pooledPerResident(rs),
      avgSnowMm: mean(rs.map((r) => r.avgSnowMm).filter((v): v is number => v != null)),
      reportedCount: rs.filter(reported).length,
      totalCount: rs.length,
    };
  });
}

export interface AreaSummary {
  area: string;
  perResident: number | null;
  reportedCount: number;
  totalCount: number;
}

/** Population-weighted spending per resident for each area, for the given records (one year or all years). */
export function areaSummaries(records: MunicipalRecord[]): AreaSummary[] {
  const areas = [...new Set(records.map((r) => r.area))];
  return areas
    .map((area) => {
      const rs = records.filter((r) => r.area === area);
      return {
        area,
        perResident: pooledPerResident(rs),
        reportedCount: new Set(rs.filter(reported).map((r) => r.munId)).size,
        totalCount: new Set(rs.map((r) => r.munId)).size,
      };
    })
    .sort((a, b) => (b.perResident ?? -1) - (a.perResident ?? -1));
}

export interface ScatterPoint {
  munId: string;
  name: string;
  avgSnowMm: number;
  perResident: number;
  population: number;
}

/** One point per municipality: average snowfall and average spending per resident over the years it reported. */
export function snowVsSpending(records: MunicipalRecord[]): ScatterPoint[] {
  const ids = [...new Set(records.map((r) => r.munId))];
  return ids.flatMap((munId) => {
    const rs = records.filter((r) => r.munId === munId);
    const snow = mean(rs.map((r) => r.avgSnowMm).filter((v): v is number => v != null));
    const per = mean(rs.map((r) => r.spendPerCapita).filter((v): v is number => v != null));
    // Dot size uses the latest population (the 2021 Census count).
    const population = rs.at(-1)?.population ?? null;
    if (snow == null || per == null || population == null) return [];
    return [{ munId, name: rs[0]!.name, avgSnowMm: snow, perResident: per, population }];
  });
}

export interface ChangeEntry {
  name: string;
  from: number;
  to: number;
  change: number;
}

/** Change in spending per resident between two years, largest rise first. */
export function changes(records: MunicipalRecord[], fromYear: number, toYear: number): ChangeEntry[] {
  const ids = [...new Set(records.map((r) => r.munId))];
  return ids
    .flatMap((id) => {
      const a = records.find((r) => r.munId === id && r.year === fromYear)?.spendPerCapita;
      const bRec = records.find((r) => r.munId === id && r.year === toYear);
      const b = bRec?.spendPerCapita;
      return a != null && b != null ? [{ name: bRec!.name, from: a, to: b, change: b / a - 1 }] : [];
    })
    .sort((x, y) => y.change - x.change);
}
