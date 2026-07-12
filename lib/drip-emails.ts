// Alpha Reset drip SCHEDULING.
//
// The subject + body of every drip email now lives in lib/email-templates.ts
// (editable from The Ledger, overridable in ar_email_templates). This file
// only says WHEN each one fires and which template slug it uses.
//
// STORY_DRIPS   — sent once per person, ever (tracked by signups.story_stage).
// SESSION_DRIPS — the countdown around each session a person is registered
//                 for (tracked by registrations.drip_stage), timed against
//                 that session's dates.

/** Token values for the session an email is being sent about. */
export interface SessionEmailCtx {
  rangeLabel: string;      // "24–26 June 2026"  → {{dates}}
  startOrdinal: string;    // "the 24th"          → {{start_date}}
  startWeekday: string;    // "Wednesday"         → {{start_day}}
  kickoffWeekday: string;  // "Tuesday"           → {{kickoff_day}}
  nextResetHint: string;   // "September"         → {{next_reset}}
}

export interface StoryDrip {
  stage: number;
  slug: string;
  afterSignupDays: number;
}

export interface SessionDrip {
  stage: number;
  slug: string;
  trigger:
    | { type: "before_event"; days: number }
    | { type: "event_day"; day: number } // day 1, 2, or 3
    | { type: "after_event"; days: number };
}

export const STORY_DRIPS: StoryDrip[] = [
  { stage: 1, slug: "story-1", afterSignupDays: 2 },
];

export const SESSION_DRIPS: SessionDrip[] = [
  { stage: 1, slug: "session-1", trigger: { type: "before_event", days: 7 } },
  { stage: 2, slug: "session-2", trigger: { type: "before_event", days: 2 } },
  { stage: 3, slug: "session-3", trigger: { type: "event_day", day: 1 } },
  { stage: 4, slug: "session-4", trigger: { type: "event_day", day: 2 } },
  { stage: 5, slug: "session-5", trigger: { type: "event_day", day: 3 } },
  { stage: 6, slug: "session-6", trigger: { type: "after_event", days: 1 } },
];

/** Token values for a session drip, from its context. */
export function sessionDripTokens(name: string, ctx: SessionEmailCtx): Record<string, string> {
  return {
    name,
    dates: ctx.rangeLabel,
    start_day: ctx.startWeekday,
    start_date: ctx.startOrdinal,
    kickoff_day: ctx.kickoffWeekday,
    next_reset: ctx.nextResetHint,
  };
}
