/** One municipality in one year, after merging and calculating indicators. */
export interface MunicipalRecord {
  munId: string;
  name: string;
  fullName: string;
  region: string;
  year: number;
  /** Average snowfall in mm */
  avgSnowMm: number | null;
  /** FIR winter maintenance expenses (service code 0621), $ */
  totalExpenses: number | null;
  /** 2016 census population for years ≤ 2016, otherwise 2021 census */
  activePopulation: number | null;
  /** Total road length (2019), km */
  roadKm: number | null;
  roadAreaM2: number | null;
  snowVolumeM3: number | null;
  snowTons: number | null;
  kmPer1000Residents: number | null;
  spendPerKm: number | null;
  spendPerCapita: number | null;
  tonsPerDollar: number | null;
}

export interface MetricsFile {
  generatedAt: string;
  years: number[];
  assumptions: { roadWidthM: number; snowDensityTPerM3: number };
  records: MunicipalRecord[];
}
