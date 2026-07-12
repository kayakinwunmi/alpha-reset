// Alpha Reset email sequences.
//
// STORY_DRIPS   — sent once per person, ever (tracked by signups.story_stage).
// SESSION_DRIPS — the countdown around each session a person is registered
//                 for (tracked by registrations.drip_stage), timed against
//                 that session's dates.

import { GROUP_CALL_TIME, BESTDAY_URL, SITE_URL } from "./event";

/** Labels for the session an email is being sent about. */
export interface SessionEmailCtx {
  rangeLabel: string;      // "24–26 June 2026"
  startOrdinal: string;    // "the 24th"
  startWeekday: string;    // "Wednesday"
  kickoffWeekday: string;  // "Tuesday" — the evening before the fast begins
  nextResetHint: string;   // "September" or "next quarter"
}

export interface StoryDrip {
  stage: number;
  subject: string;
  afterSignupDays: number;
  body: (name: string) => string;
}

export interface SessionDrip {
  stage: number;
  subject: string;
  trigger:
    | { type: "before_event"; days: number }
    | { type: "event_day"; day: number } // day 1, 2, or 3
    | { type: "after_event"; days: number };
  body: (name: string, ctx: SessionEmailCtx) => string;
}

export const STORY_DRIPS: StoryDrip[] = [
  {
    stage: 1,
    subject: "Why I started Alpha Reset",
    afterSignupDays: 2,
    body: (name) => `Hey ${name},

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
];

export const SESSION_DRIPS: SessionDrip[] = [
  // Stage 1: "Prep Guide" — 7 days before the session
  {
    stage: 1,
    subject: "How to prepare for Alpha Reset",
    trigger: { type: "before_event", days: 7 },
    body: (name, ctx) => `Hey ${name},

One week to go. Here's how to set yourself up:

1. Clear your calendar for ${ctx.rangeLabel}. Tell people you're offline. No exceptions.

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

  // Stage 2: "Final Reminder" — 2 days before
  {
    stage: 2,
    subject: "48 hours to go",
    trigger: { type: "before_event", days: 2 },
    body: (name, ctx) => `Hey ${name},

Alpha Reset starts in 48 hours — midnight on ${ctx.startWeekday} ${ctx.startOrdinal}.

Eat well today. Hydrate. Get your affairs in order. Your last meal is ${ctx.kickoffWeekday} evening, by 6pm — that's your 72 hours.

${ctx.kickoffWeekday} night, the evening before the fast begins, we have a kick-off call at ${GROUP_CALL_TIME} on the Bestday group. Be there.

If you haven't joined the group yet: ${BESTDAY_URL}

Remember why you signed up. Hold onto that.

See you ${ctx.kickoffWeekday} night.

Kay`,
  },

  // Stage 3: Day 1 — "Reset"
  {
    stage: 3,
    subject: "Day 1: Reset",
    trigger: { type: "event_day", day: 1 },
    body: (name) => `${name},

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

  // Stage 4: Day 2 — "Reflect"
  {
    stage: 4,
    subject: "Day 2: Reflect",
    trigger: { type: "event_day", day: 2 },
    body: (name) => `${name},

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

  // Stage 5: Day 3 — "Focus"
  {
    stage: 5,
    subject: "Day 3: Focus",
    trigger: { type: "event_day", day: 3 },
    body: (name) => `${name},

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

  // Stage 6: Day after — "You Did It"
  {
    stage: 6,
    subject: "You did it 🦾",
    trigger: { type: "after_event", days: 1 },
    body: (name, ctx) => `${name},

You did it. 72 hours. No food. Full life review. You're part of the 1% now.

How to break your fast safely:
- Start with clear broths, diluted fruit juice, or yogurt
- Don't overeat — your stomach has shrunk
- Keep drinking water
- Gradually reintroduce whole foods over the next day

More importantly — look at what you wrote down on Day 3. Those goals. That plan. That's your compass for the next 90 days. Don't let it collect dust.

The next Alpha Reset is in ${ctx.nextResetHint}. Between now and then, execute.

Stay connected on Bestday. The accountability doesn't stop when the fast ends.

Proud of you.

Kay`,
  },
];
