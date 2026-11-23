/**
 * Which level of government the record belongs to. Each tier has its own winter maintenance mandate.
 * Single tier: Toronto and Hamilton, which handle all winter maintenance themselves. Lower tier: cities and towns within a Region. Upper tier: regional governments.
 */
export type Tier = "Single-tier" | "Lower-tier" | "Upper-tier";

/** One municipality in one year, after merging and calculating measures. */
export interface MunicipalRecord {
  munId: string;
  name: string;
  fullName: string;
  /** Region name from the municipal directory, e.g. "Durham Region" or "City of Toronto". */
  region: string;
  /** Short area name used for area comparisons: Toronto, Hamilton, Halton, Peel, York or Durham. */
  area: string;
  /** Tier from the cost data; null only for the synthetic GTHA average. */
  tier: Tier | null;
  year: number;
  /** Average snowfall in mm (estimated). */
  avgSnowMm: number | null;
  /**
   * Total winter cost, $: the municipality's own winter control for roads, sidewalks and parking lots.
   * Null = not reported that year.
   */
  totalExpenses: number | null;
  /** Own winter control for roads, $. Null = not reported that year. */
  roadsCost: number | null;
  /**
   * Own winter control for sidewalks and parking lots, $. A zero has no stated reason: the costs may be
   * included with roads, or the municipality may not pay for sidewalk clearing.
   */
  sidewalksCost: number | null;
  /** Population for this year: 2016 Census for 2015 to 2020, 2021 Census from 2021 onward. */
  population: number | null;
  /** Total winter cost per resident, $ (the headline measure). */
  spendPerCapita: number | null;
  /** Total road length, km. */
  roadKm: number | null;
  /** Total winter cost per km of road, $. */
  spendPerKm: number | null;
  /** Change in spending per resident since 2016, as a fraction (0.25 = +25%). Null for 2016 and earlier. */
  changeSince2016: number | null;
  /** The municipality's total operating expenses across all services, $. Null = not reported that year. */
  operatingExpense: number | null;
  /** totalExpenses ÷ operatingExpense, 0 to 1: the share of the operating budget spent on winter control. */
  winterShareOfOperating: number | null;
}

export interface MetricsFile {
  generatedAt: string;
  years: number[];
  records: MunicipalRecord[];
}
