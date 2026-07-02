// Static site-wide constants. Session dates now live in the database
// (sessions table, managed from /admin) — see lib/sessions.ts.
//
// FALLBACK_SESSION keeps the site rendering if the database is unreachable
// or the sessions migration hasn't been run yet.

export const BESTDAY_URL = "https://getbestdayapp.app.link/5SerCVKw60b";

export const SITE_URL = "https://www.alphareset.co";

/** Time of the nightly group call, as written in copy. */
export const GROUP_CALL_TIME = "8pm BST";

export const FALLBACK_SESSION = {
  id: "fallback",
  title: "Alpha Reset — June 2026",
  starts_at: "2026-06-24T00:00:00Z",
  ends_at: "2026-06-26T18:00:00Z",
  kind: "virtual",
  location: null,
  capacity: null,
  notes: null,
  status: "open",
  created_at: "2026-01-01T00:00:00Z",
} as const;
