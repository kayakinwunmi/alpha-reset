// Client-safe email template definitions.
//
// Every automated email has a DEFAULT subject + body here. Admins can override
// any of them from The Ledger (stored in ar_email_templates, keyed by slug);
// the send paths resolve override-or-default and substitute {{tokens}} with
// per-send values. This module is import-safe on the client (only constants
// from lib/event.ts), so the editor can show defaults and reset to them.

import { GROUP_CALL_TIME, BESTDAY_URL, SITE_URL } from "./event";

export type EmailGroup = "drip" | "transactional";

export interface EmailToken {
  token: string; // e.g. "{{name}}"
  label: string; // what it becomes
  sample: string; // used in the editor preview
}

export interface EmailTemplateDef {
  slug: string;
  label: string;
  group: EmailGroup;
  /** When this email fires — shown in the list. */
  timing: string;
  tokens: EmailToken[];
  defaultSubject: string;
  defaultBody: string;
}

const TOK = {
  name: { token: "{{name}}", label: "First name", sample: "Tola" },
  dates: { token: "{{dates}}", label: "Session dates", sample: "24–26 June 2026" },
  startDay: { token: "{{start_day}}", label: "Start weekday", sample: "Wednesday" },
  startDate: { token: "{{start_date}}", label: "Start date (ordinal)", sample: "the 24th" },
  kickoffDay: { token: "{{kickoff_day}}", label: "Kick-off weekday (evening before)", sample: "Tuesday" },
  nextReset: { token: "{{next_reset}}", label: "Next reset hint", sample: "September" },
  sessions: {
    token: "{{sessions}}",
    label: "Bulleted list of the sessions they joined",
    sample: "- Q3 2026 Reset · 24–26 September 2026",
  },
  calendarLinks: {
    token: "{{calendar_links}}",
    label: "Calendar (.ics) link(s) for their sessions",
    sample: "https://www.alphareset.co/api/calendar?session=…",
  },
  inPersonNote: {
    token: "{{in_person_note}}",
    label: "In-person note — shows only when an in-person place was requested",
    sample: "\nAbout the in-person reset: places are limited…\n",
  },
  sessionTitle: { token: "{{session_title}}", label: "Session title", sample: "Forest Retreat 2026" },
  locationLine: {
    token: "{{location_line}}",
    label: "Location line — shows only when the session has a location",
    sample: "\nLocation: A house in the Highlands",
  },
} as const;

export const EMAIL_TEMPLATES: EmailTemplateDef[] = [
  // ---- Drip sequence -------------------------------------------------------
  {
    slug: "story-1",
    label: "Story: Why I started",
    group: "drip",
    timing: "2 days after a person's first-ever signup (once per person)",
    tokens: [TOK.name],
    defaultSubject: "Why I started Alpha Reset",
    defaultBody: `Hey {{name}},

I wanted to share why I do this.

A few years ago I realised I was drifting. Busy, but not moving. Making money, but not growing. I'd end a quarter and couldn't tell you what I'd actually accomplished.

So I started taking 3 days every quarter to stop. No food, no phone, no distractions. Just me, God, and the truth.

The first time was brutal. By day 2 my body was screaming. But something shifted. I came out the other side with more clarity than I'd had in months. I could see what mattered and what was just noise.

I've done it every quarter since. Each time I come back a different person. Not because of some magic formula — because 72 hours of stillness forces you to confront yourself.

That's what Alpha Reset is. It's not comfortable. It's not supposed to be.

But it works.

See you at the next reset.

Kay`,
  },
  {
    slug: "session-1",
    label: "Countdown: Prep guide",
    group: "drip",
    timing: "7 days before the session starts",
    tokens: [TOK.name, TOK.dates],
    defaultSubject: "How to prepare for Alpha Reset",
    defaultBody: `Hey {{name}},

One week to go. Here's how to set yourself up:

1. Clear your calendar for {{dates}}. Tell people you're offline. No exceptions.

2. Stock up:
   - Water (lots of it)
   - Black coffee if you drink it
   - A good journal and pen
   - A book that challenges you

3. Set your intention. Why are you doing this? Write it down. Be specific. "I want clarity on my next career move" is better than "I want to grow."

4. Download Bestday and join the group: ${BESTDAY_URL} — this is where we'll share updates, evening call links, and hold each other accountable.

5. Tell someone. Accountability changes everything. Tell a friend, a partner, someone who'll check on you.

6. Clean your space. Messy environment = messy mind. Start fresh.

The full Field Guide — prep, the day-by-day protocol, and how to break the fast — is here: ${SITE_URL}/guide

One more thing — don't overthink it. You signed up for a reason. Trust that.

Kay`,
  },
  {
    slug: "session-2",
    label: "Countdown: 48 hours to go",
    group: "drip",
    timing: "2 days before the session starts",
    tokens: [TOK.name, TOK.startDay, TOK.startDate, TOK.kickoffDay],
    defaultSubject: "48 hours to go",
    defaultBody: `Hey {{name}},

Alpha Reset starts in 48 hours — midnight on {{start_day}} {{start_date}}.

Eat well today. Hydrate. Get your affairs in order. Your last meal is {{kickoff_day}} evening, by 6pm — that's your 72 hours.

{{kickoff_day}} night, the evening before the fast begins, we have a kick-off call at ${GROUP_CALL_TIME} on the Bestday group. Be there.

If you haven't joined the group yet: ${BESTDAY_URL}

Remember why you signed up. Hold onto that.

See you {{kickoff_day}} night.

Kay`,
  },
  {
    slug: "session-3",
    label: "Countdown: Day 1 — Reset",
    group: "drip",
    timing: "Day 1 of the session",
    tokens: [TOK.name],
    defaultSubject: "Day 1: Reset",
    defaultBody: `{{name}},

It begins.

Today is about one thing: disconnecting from the noise.

Shut down the phone. Turn off the TV. Step away from social media. This isn't relaxation — it's confrontation. You're going to face yourself today.

Here's your focus:
- What digital distractions have I been relying on?
- How do I feel without them?
- What's actually important vs what's just noise?

Drink water. Go for a walk. Journal. Pray.

Group call tonight at ${GROUP_CALL_TIME} on Bestday.

You've got this.

Kay`,
  },
  {
    slug: "session-4",
    label: "Countdown: Day 2 — Reflect",
    group: "drip",
    timing: "Day 2 of the session",
    tokens: [TOK.name],
    defaultSubject: "Day 2: Reflect",
    defaultBody: `{{name}},

Your body is screaming for food right now. Good. That means it's working.

You're an alpha. You can handle pain.

Today, take a hard look at the past 90 days. No excuses:
- What did you accomplish?
- What got in your way?
- What goals did you hit, and which ones did you dodge?
- What did you learn — from the wins AND the failures?

Write it all down. Every bit of it. Be brutally honest.

This isn't about beating yourself up. It's about seeing clearly so you can move forward.

Group call tonight at ${GROUP_CALL_TIME}.

Keep going.

Kay`,
  },
  {
    slug: "session-5",
    label: "Countdown: Day 3 — Focus",
    group: "drip",
    timing: "Day 3 of the session",
    tokens: [TOK.name],
    defaultSubject: "Day 3: Focus",
    defaultBody: `{{name}},

Congratulations. You made it to day 3. No food for over 48 hours. You're telling your body and mind one thing: I'm in control.

Today is about the future. The next 90 days. Your mission.

Answer these honestly:
- What are my top 3 priorities for the next quarter?
- What specific actions will I take?
- What am I going to STOP doing?
- Who will hold me accountable?

Don't write a wish list. Write a battle plan. Imagine you're going to war. Will you lead yourself to victory?

Final group call tonight at ${GROUP_CALL_TIME}.

Almost there.

Kay`,
  },
  {
    slug: "session-6",
    label: "Countdown: You did it",
    group: "drip",
    timing: "The day after the session ends",
    tokens: [TOK.name, TOK.nextReset],
    defaultSubject: "You did it 🦾",
    defaultBody: `{{name}},

You did it. 72 hours. No food. Full life review. You're part of the 1% now.

How to break your fast safely:
- Start with clear broths, diluted fruit juice, or yogurt
- Don't overeat — your stomach has shrunk
- Keep drinking water
- Gradually reintroduce whole foods over the next day

More importantly — look at what you wrote down on Day 3. Those goals. That plan. That's your compass for the next 90 days. Don't let it collect dust.

The next Alpha Reset is in {{next_reset}}. Between now and then, execute.

Stay connected on Bestday. The accountability doesn't stop when the fast ends.

Proud of you.

Kay`,
  },

  // ---- Transactional -------------------------------------------------------
  {
    slug: "welcome",
    label: "Welcome (first-time signup)",
    group: "transactional",
    timing: "Immediately, when someone signs up for the first time",
    tokens: [TOK.name, TOK.sessions, TOK.calendarLinks, TOK.inPersonNote],
    defaultSubject: "Welcome to Alpha Reset 🦾",
    defaultBody: `Hey {{name}},

Welcome to Alpha Reset. You're in.

Here's what you signed up for:

{{sessions}}

Each reset is 72 hours. Here's what to expect:

- 72-hour water fast (water & coffee only)
- Daily walks or runs
- Deep prayer and meditation
- Written 90-day life review
- Set direction for the next quarter

Three things to do now:

1. Read the Field Guide — how to prepare, the day-by-day protocol, and how to break the fast: ${SITE_URL}/guide
2. Block the dates in your calendar: {{calendar_links}}
3. Join the group on Bestday to connect with other Alphas: ${BESTDAY_URL}
   (The reset itself is free — the group runs on Bestday Premium + AI, $249/year.)
{{in_person_note}}
See you at the reset.

Kay`,
  },
  {
    slug: "returning",
    label: "Returning member (registered again)",
    group: "transactional",
    timing: "Immediately, when an existing member registers for another session",
    tokens: [TOK.name, TOK.sessions, TOK.calendarLinks, TOK.inPersonNote],
    defaultSubject: "You're registered 🦾",
    defaultBody: `Hey {{name}},

Good to have you back. You're registered for:

{{sessions}}
{{in_person_note}}
Block the dates and I'll see you there: {{calendar_links}}

Kay`,
  },
  {
    slug: "approval",
    label: "In-person place approved",
    group: "transactional",
    timing: "When you approve an in-person request",
    tokens: [TOK.name, TOK.sessionTitle, TOK.dates, TOK.locationLine],
    defaultSubject: "Confirmed: {{session_title}} 🦾",
    defaultBody: `Hey {{name}},

Good news — your place is confirmed.

{{session_title}} · {{dates}}{{location_line}}

Details — travel, what to bring, and cost-sharing — are organised in the Bestday group, so make sure you're in: ${BESTDAY_URL}

This is the one people talk about all year. Come ready.

Kay`,
  },
  {
    slug: "decline",
    label: "In-person place declined",
    group: "transactional",
    timing: "When you decline an in-person request",
    tokens: [TOK.name, TOK.sessionTitle, TOK.dates],
    defaultSubject: "About your place at {{session_title}}",
    defaultBody: `Hey {{name}},

Thank you for requesting a place at {{session_title}} ({{dates}}).

Places are very limited and I couldn't fit everyone in this time — I'm sorry to say I can't confirm yours for this one.

The quarterly resets are open to everyone, and I'd love to see you at the next in-person session. Stay close on Bestday: ${BESTDAY_URL}

Kay`,
  },
];

export const EMAIL_TEMPLATES_BY_SLUG: Record<string, EmailTemplateDef> = Object.fromEntries(
  EMAIL_TEMPLATES.map((t) => [t.slug, t])
);

/** Replace every {{token}} in a string with its value (missing → left as-is). */
export function renderTemplate(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) =>
    key in values ? values[key] : match
  );
}
