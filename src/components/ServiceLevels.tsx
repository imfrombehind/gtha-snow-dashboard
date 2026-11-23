import type { ReactNode } from "react";
import Link from "next/link";
import {
  BODY,
  LIST,
  SUBHEADING,
  TABLE,
  TABLE_CELL,
  TABLE_HEAD_ROW,
  TABLE_MISSING,
  TABLE_ROW,
  TABLE_ROW_HEADER,
  TABLE_TH,
} from "@/lib/typography";

export type CategoryKey = "expressway" | "arterial" | "collector" | "local" | "sidewalks" | "cycling" | "windrows" | "busStops";
type MissingReason = "not-published" | "not-verified" | "not-applicable" | "not-listed" | "conflict";
export type LevelField = "salting" | "plowing" | "completion" | "surface" | "mmsClass";

export interface Level {
  terminology: string | null;
  salting: string | null;
  plowing: string | null;
  completion: string | null;
  surface: string | null;
  mmsClass: string | null;
  notes: string | null;
  missing: Partial<Record<LevelField, MissingReason>>;
  secondaryFields: LevelField[];
  /** When the completion clock starts. Null when no completion time is shown. */
  clock: string | null;
  /** Lowest and highest plowing depth published, in cm. */
  depth: [number, number] | null;
}

export interface ServiceProfile {
  name: string;
  region: string;
  responsibility: string | null;
  sourceUrl: string | null;
  lastVerified: string | null;
  /** The official page could not be found or verified, so no category has data. */
  unverified: boolean;
  levels: Partial<Record<CategoryKey, Level | null>>;
}

export interface ServiceCategory {
  key: CategoryKey;
  label: string;
}

const MISSING_LABEL: Record<MissingReason, string> = {
  "not-published": "Not published",
  "not-verified": "Not verified",
  "not-applicable": "Not applicable",
  "not-listed": "Not listed",
  conflict: "Source conflict",
};
const COLUMNS: { field: LevelField; label: string }[] = [
  { field: "salting", label: "Salting trigger" },
  { field: "plowing", label: "Plowing trigger" },
  { field: "completion", label: "Completion time" },
  { field: "surface", label: "Target surface" },
  { field: "mmsClass", label: "Cites provincial standard" },
];
/** The service details counted in a page's coverage line. */
const COVERAGE_FIELDS: LevelField[] = ["salting", "plowing", "completion", "surface"];

// Abbreviations in the dataset, replaced wherever a value is shown.
const VALUE_TERMS: [RegExp, string][] = [
  [/\bSWE\b/g, "Significant Weather Event"],
  [/\bMUPs\b/g, "multi-use paths"],
  [/\bPXOs\b/g, "pedestrian crossovers"],
  [/\bDVP\b/g, "Don Valley Parkway"],
  [/\bMTO\b/g, "Ministry of Transportation"],
  [/\bEMS\b/g, "emergency services"],
  [/\bCl\.\s*/g, "Class "],
  [/\bLOS\b/g, "service levels"],
];
const plainValue = (text: string) => VALUE_TERMS.reduce((t, [pattern, word]) => t.replace(pattern, word), text);

/** Why a whole road type has no row for this profile. */
export function absentLabel(profile: ServiceProfile, key: CategoryKey) {
  if (key === "expressway") return "Not applicable (no municipal expressways)";
  if (profile.unverified) return MISSING_LABEL["not-verified"];
  // The dataset gives Regions rows only for the services they own or address.
  return profile.name.endsWith(" Region") ? "Not covered for this Region" : MISSING_LABEL["not-listed"];
}

/** One table value, its "Secondary source" mark, or the reason it is empty. */
export function FieldValue({ level, field, showClock }: { level: Level; field: LevelField; showClock?: boolean }): ReactNode {
  const value = level[field];
  if (!value) return <span className={TABLE_MISSING}>{MISSING_LABEL[level.missing[field] ?? "not-listed"]}</span>;
  const dispute = value.match(/^(.*?)(sources differ[^:]*:)(.*)$/i);
  return (
    <span>
      {dispute ? (
        <>
          {dispute[1]}
          <span className="font-semibold">{dispute[2]}</span>
          {plainValue(dispute[3]!)}
        </>
      ) : (
        plainValue(value)
      )}
      {showClock && level.clock && <span className="mt-0.5 block text-xs text-ink-3">Clock: {level.clock.toLowerCase()}</span>}
      {level.secondaryFields.includes(field) && (
        <span className="mt-0.5 block text-xs italic text-ink-3">Secondary source</span>
      )}
    </span>
  );
}

const REGION_NAMES = ["Peel", "Halton", "Durham", "York"];
const WHO: Record<string, { who: string; plural?: boolean }> = {
  City: { who: "The city" },
  Town: { who: "The town" },
  Township: { who: "The township" },
  Municipality: { who: "The municipality" },
  Residents: { who: "Residents", plural: true },
  Owners: { who: "Property owners", plural: true },
  MTO: { who: "The Ministry of Transportation (Ontario)" },
  Region: { who: "The regional government" },
  "lower tiers": { who: "Lower-tier municipalities", plural: true },
};
// Abbreviations and jargon, replaced with plain wording.
const TERMS: [RegExp, string][] = [
  [/windrows?/gi, "driveway windrows (snow the plow pushes onto the end of driveways)"],
  [/DVP\/Gardiner/g, "Don Valley Parkway and Gardiner Expressway"],
  [/Linc\/RHVP/g, "Lincoln Alexander Parkway and Red Hill Valley Parkway"],
  [/MUPs/g, "multi-use paths"],
  [/PXOs/g, "pedestrian crossovers"],
  [/400-series/g, "400-series highways"],
  [/\bLOS\b/g, "service levels"],
];

/** Plain wording for the text after "is responsible for": expands terms and lowercases mid-sentence place words. */
function plainTerms(text: string) {
  const expanded = TERMS.reduce((t, [pattern, replacement]) => t.replace(pattern, replacement), text);
  return expanded.replace(/\b(Town|City|Township|Municipality|Region|Regional)\b/g, (w) => w.toLowerCase());
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Turns "City: roads; residents: windrows" into plain bullet points. */
function responsibilityBullets(text: string) {
  return text
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^([A-Za-z][A-Za-z\s-]*?):\s*(.+)$/);
      if (!match) return { who: null, plural: false, body: capitalise(plainTerms(part)) };
      const label = match[1]!.trim();
      const body = plainTerms(match[2]!);
      const known = WHO[label] ?? WHO[capitalise(label)]; // The dataset writes both "Residents" and "residents".
      if (known) return { who: known.who, plural: !!known.plural, body };
      if (REGION_NAMES.includes(label)) return { who: `${label} Region`, plural: false, body };
      return { who: label, plural: false, body };
    });
}

/** How many service details have a value, leaving out those that do not apply. */
function coverage(profile: ServiceProfile, categories: ServiceCategory[]) {
  let shown = 0;
  let total = 0;
  for (const { key } of categories) {
    const level = profile.levels[key];
    if (!level) {
      if (profile.unverified && key !== "expressway") total += COVERAGE_FIELDS.length;
      continue;
    }
    for (const field of COVERAGE_FIELDS) {
      if (level.missing[field] === "not-applicable") continue;
      total += 1;
      if (level[field]) shown += 1;
    }
  }
  return { shown, total };
}

const VALUE_GUIDE: [string, string][] = [
  ["Service details", "The salting trigger, plowing trigger, completion time and target surface. Details that do not apply are not counted."],
  ["Clock", "When the completion time starts counting. Times on different clocks are not directly comparable."],
  ["Sources differ", "Published sources give different figures. Both are shown, and we do not choose between them."],
  ["Secondary source", "The figure comes from news or a directory, so check it against the municipality."],
  ["Cites provincial standard", "Whether the municipality refers to Ontario’s Minimum Maintenance Standards. “No” means no reference was found, not that the standard is unmet."],
];
const MISSING_GUIDE: [string, string][] = [
  ["Not published", "The municipality’s website does not state this value."],
  ["Not verified", "The official page could not be found or confirmed."],
  ["Source conflict", "A conflict is flagged, but what differs is not recorded, so the value is held back."],
  ["Not applicable", "The measure does not apply to this service."],
  ["Not listed", "Our dataset has no entry for this value."],
  ["Not covered for this Region", "Regions have entries only for the services they own or address."],
];

function ReadingGuide({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="font-serif text-base font-semibold text-ink">{title}</h4>
      <dl className="flex flex-col divide-y divide-line text-sm leading-relaxed">
        {items.map(([term, meaning]) => (
          <div key={term} className="grid gap-0.5 py-2 sm:grid-cols-[13rem_1fr] sm:gap-4">
            <dt className="font-medium text-ink">{term}</dt>
            <dd className="text-ink-2">{meaning}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const RULER_MAX_CM = 12;
const RULER_TICKS = [0, 2, 4, 6, 8, 10, 12];
const RULER_GRID = "grid grid-cols-[minmax(0,8rem)_1fr_4.5rem] gap-3 sm:grid-cols-[minmax(0,15rem)_1fr_4.5rem]";
const depthText = ([low, high]: [number, number]) => (low === high ? `${low} cm` : `${low}–${high} cm`);

/**
 * Trigger ruler on a shared 0 to 12 cm scale. Road types with the same depth share a row,
 * and a band marks a published range rather than picking one figure from it.
 */
function TriggerRuler({ rows, unverified }: { rows: { label: string; depth: [number, number] }[]; unverified: boolean }) {
  const groups = [...new Map(rows.map((r) => [depthText(r.depth), r.depth])).entries()].map(([text, depth]) => ({
    text,
    depth,
    labels: rows.filter((r) => depthText(r.depth) === text).map((r) => r.label),
  }));
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className={SUBHEADING}>Plowing trigger depth</h3>
        <p className={BODY}>
          The snow depth at which plowing starts. A band means more than one depth is published. Road types with no
          published depth are not shown.
        </p>
      </div>
      {groups.length === 0 ? (
        <p className={`${BODY} italic`}>{unverified ? "Not verified" : "No plowing depth is published."}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map(({ text, depth: [low, high], labels }) => (
            <div key={text} className={`${RULER_GRID} items-center text-sm`}>
              <span className="text-ink">{labels.join(", ")}</span>
              <span className="relative h-5">
                <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
                {RULER_TICKS.map((t) => (
                  <span key={t} className="absolute top-0 h-full w-px bg-line" style={{ left: `${(t / RULER_MAX_CM) * 100}%` }} />
                ))}
                <span
                  className="absolute top-0 h-full min-w-0.5 bg-ink"
                  style={{ left: `${(low / RULER_MAX_CM) * 100}%`, width: `${((high - low) / RULER_MAX_CM) * 100}%` }}
                />
              </span>
              <span className="text-right tabular-nums text-ink">{text}</span>
            </div>
          ))}
          <div className={`${RULER_GRID} text-xs text-ink-3`}>
            <span />
            <span className="relative h-4">
              {RULER_TICKS.map((t) => (
                <span key={t} className="absolute -translate-x-1/2" style={{ left: `${(t / RULER_MAX_CM) * 100}%` }}>
                  {t}
                </span>
              ))}
            </span>
            <span>cm</span>
          </div>
        </div>
      )}
    </div>
  );
}

/** Published levels of service for one municipality: coverage, responsibilities, triggers and table. */
export function ServiceLevels({
  profile,
  categories,
}: {
  profile: ServiceProfile;
  categories: ServiceCategory[];
}) {
  const { shown, total } = coverage(profile, categories);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="border border-line bg-panel px-4 py-3 text-base leading-relaxed text-ink-2">
          {profile.unverified ? (
            <>
              <span className="font-semibold text-ink">No service details are available.</span> The official page could not
              be verified.
            </>
          ) : (
            <>
              <span className="font-semibold text-ink">
                {shown} of {total} service details are available ({Math.round((shown / total) * 100)}%).
              </span>{" "}
              A gap means the detail is not available here. It does not mean the service is poor.
            </>
          )}
        </p>

        <details className="group">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-ink hover:underline hover:underline-offset-2 [&::-webkit-details-marker]:hidden">
            How to read these figures
            <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 text-ink-2 transition-transform group-open:rotate-180">
              <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className="mt-3 flex flex-col gap-5 border border-line bg-panel p-4 sm:p-5">
            <p className={BODY}>
              These are published service targets. They do not measure how well a municipality delivers the service.
            </p>
            <ReadingGuide title="Reading a value" items={VALUE_GUIDE} />
            <ReadingGuide title="When a value is missing" items={MISSING_GUIDE} />
            <p className="text-sm text-ink-2">
              <Link href="/project#levels-of-service" className="font-medium text-ink underline underline-offset-2">
                Read how we collected these figures
              </Link>
            </p>
          </div>
        </details>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className={SUBHEADING}>Who is responsible</h3>
        {profile.responsibility ? (
          <ul className={LIST}>
            {responsibilityBullets(profile.responsibility).map((item, i) => (
              <li key={i}>
                {item.who ? (
                  <>
                    <span className="font-medium text-ink">{item.who}</span> {item.plural ? "are" : "is"} responsible for{" "}
                    {item.body}.
                  </>
                ) : (
                  <>{item.body}.</>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className={`${BODY} italic`}>{profile.unverified ? "Not verified" : "Not published"}</p>
        )}
      </section>

      <TriggerRuler
        unverified={profile.unverified}
        rows={categories.flatMap(({ key, label }) => {
          const depth = profile.levels[key]?.depth;
          return depth ? [{ label, depth }] : [];
        })}
      />

      <div className="overflow-x-auto">
        <table className={`${TABLE} stack sm:min-w-[760px]`}>
          <thead>
            <tr className={TABLE_HEAD_ROW}>
              <th scope="col" className={`${TABLE_TH} sm:w-56`}>Road type</th>
              {COLUMNS.map(({ field, label }) => (
                <th key={field} scope="col" className={TABLE_TH}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(({ key, label }) => {
              const level = profile.levels[key] ?? null;
              return (
                <tr key={key} className={TABLE_ROW}>
                  <th scope="row" className={TABLE_ROW_HEADER}>
                    {label}
                    {level?.terminology && (
                      <span className="mt-0.5 block text-xs font-normal text-ink-3">{plainValue(level.terminology)}</span>
                    )}
                    {level?.notes && (
                      <span className="mt-1 block text-xs font-normal leading-snug text-ink-2">{plainValue(level.notes)}</span>
                    )}
                  </th>
                  {level ? (
                    COLUMNS.map(({ field, label: column }) => (
                      <td key={field} data-label={column} className={`${TABLE_CELL} text-ink`}>
                        <FieldValue level={level} field={field} showClock={field === "completion"} />
                      </td>
                    ))
                  ) : (
                    <td colSpan={COLUMNS.length} className={`${TABLE_CELL} ${TABLE_MISSING}`}>
                      {absentLabel(profile, key)}
                    </td>
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
