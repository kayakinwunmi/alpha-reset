// Single source of truth for the next Alpha Reset.
// When the next reset is announced, update this file and nothing else —
// the site, emails, drip triggers, and calendar file all read from here.

/** Fast begins — midnight UTC on the first day. */
export const EVENT_START_ISO = "2026-06-24T00:00:00Z";

/** Fast ends — 6pm on day three. */
export const EVENT_END_ISO = "2026-06-26T18:00:00Z";

export const EVENT_START = new Date(EVENT_START_ISO);
export const EVENT_END = new Date(EVENT_END_ISO);

/** e.g. "24–26 June 2026" — used in headings, meta tags, FAQ. */
export const EVENT_RANGE_LABEL = "24–26 June 2026";

/** e.g. "24 June 2026" — used in sentences about the start. */
export const EVENT_START_LABEL = "24 June 2026";

/** e.g. "the 24th" — used in sign-offs ("See you on the 24th"). */
export const EVENT_START_ORDINAL = "the 24th";

/** e.g. "Wednesday" — the day the fast begins. */
export const EVENT_START_WEEKDAY = "Wednesday";

/** Month of the reset after this one — used in the post-event email. */
export const NEXT_RESET_HINT = "September 2026";

/** Time of the nightly group call, as written in copy. */
export const GROUP_CALL_TIME = "8pm BST";

export const BESTDAY_URL = "https://getbestdayapp.app.link/5SerCVKw60b";

export const SITE_URL = "https://www.alphareset.co";
