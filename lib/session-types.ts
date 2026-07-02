// Session types and pure date-label helpers.
// Client-safe: no database or Node imports — the SignupForm and admin UI
// import from here, while server-only fetching lives in lib/sessions.ts.

export type SessionKind = "virtual" | "in_person";
export type SessionStatus = "draft" | "open" | "completed" | "cancelled";
export type RegistrationStatus = "confirmed" | "requested" | "declined";

export interface SessionRow {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  kind: SessionKind | string;
  location: string | null;
  capacity: number | null;
  notes: string | null;
  status: SessionStatus | string;
  created_at: string;
}

export interface RegistrationRow {
  id: string;
  person_id: string;
  session_id: string;
  status: RegistrationStatus | string;
  intention: string | null;
  drip_stage: number | null;
  last_drip_at: string | null;
  created_at: string;
}

/** Serializable session shape passed from server components to the client. */
export interface PublicSession {
  id: string;
  title: string;
  kind: SessionKind | string;
  location: string | null;
  capacity: number | null;
  notes: string | null;
  startsAt: string;
  endsAt: string;
  rangeLabel: string;
  startLabel: string;
  startOrdinal: string;
  startWeekday: string;
}

const DAY_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
const MONTH_FMT = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });
const YEAR_FMT = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "UTC" });
const WEEKDAY_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" });

function ordinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

/** "24–26 June 2026", "30 June – 2 July 2026", "30 Dec 2026 – 1 January 2027". */
export function sessionRangeLabel(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameYear = YEAR_FMT.format(start) === YEAR_FMT.format(end);
  const sameMonth = sameYear && MONTH_FMT.format(start) === MONTH_FMT.format(end);

  if (sameMonth) {
    return `${DAY_FMT.format(start)}–${DAY_FMT.format(end)} ${MONTH_FMT.format(start)} ${YEAR_FMT.format(start)}`;
  }
  if (sameYear) {
    return `${DAY_FMT.format(start)} ${MONTH_FMT.format(start)} – ${DAY_FMT.format(end)} ${MONTH_FMT.format(end)} ${YEAR_FMT.format(start)}`;
  }
  return `${DAY_FMT.format(start)} ${MONTH_FMT.format(start)} ${YEAR_FMT.format(start)} – ${DAY_FMT.format(end)} ${MONTH_FMT.format(end)} ${YEAR_FMT.format(end)}`;
}

/** "24 June 2026" */
export function sessionStartLabel(startsAt: string): string {
  const d = new Date(startsAt);
  return `${DAY_FMT.format(d)} ${MONTH_FMT.format(d)} ${YEAR_FMT.format(d)}`;
}

/** "the 24th" */
export function sessionStartOrdinal(startsAt: string): string {
  const day = Number(DAY_FMT.format(new Date(startsAt)));
  return `the ${day}${ordinalSuffix(day)}`;
}

/** "Wednesday" */
export function sessionStartWeekday(startsAt: string): string {
  return WEEKDAY_FMT.format(new Date(startsAt));
}

/** "June" — used for "the next reset is in June" copy. */
export function sessionMonth(startsAt: string): string {
  return MONTH_FMT.format(new Date(startsAt));
}

export function toPublicSession(row: SessionRow): PublicSession {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind,
    location: row.location,
    capacity: row.capacity,
    notes: row.notes,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    rangeLabel: sessionRangeLabel(row.starts_at, row.ends_at),
    startLabel: sessionStartLabel(row.starts_at),
    startOrdinal: sessionStartOrdinal(row.starts_at),
    startWeekday: sessionStartWeekday(row.starts_at),
  };
}
