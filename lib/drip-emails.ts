// Alpha Reset email drip sequence
// Event date: 8 April 2026 00:00 UTC

export const EVENT_DATE = new Date("2026-04-08T00:00:00Z");

export interface DripEmail {
  stage: number;
  subject: string;
  body: (name: string) => string;
  // When to send: either days after signup, or days before/after event
  trigger:
    | { type: "after_signup"; days: number }
    | { type: "before_event"; days: number }
    | { type: "after_event"; days: number }
    | { type: "event_day"; day: number }; // day 1, 2, or 3
}

export const drips: DripEmail[] = [
  // Stage 1: "The Why" — 2 days after signup
  {
    stage: 1,
    subject: "Why I started Alpha Reset",
    trigger: { type: "after_signup", days: 2 },
    body: (name) => `Hey ${name},

I wanted to share why I do this.

A few years ago I realised I was drifting. Busy, but not moving. Making money, but not growing. I'd end a quarter and couldn't tell you what I'd actually accomplished.

So I started taking 3 days every quarter to stop. No food, no phone, no distractions. Just me, God, and the truth.

The first time was brutal. By day 2 my body was screaming. But something shifted. I came out the other side with more clarity than I'd had in months. I could see what mattered and what was just noise.

I've done it every quarter since. Each time I come back a different person. Not because of some magic formula — because 72 hours of stillness forces you to confront yourself.

That's what Alpha Reset is. It's not comfortable. It's not supposed to be.

But it works.

See you on the 8th.

Kay`,
  },

  // Stage 2: "Prep Guide" — 7 days before event (1 April)
  {
    stage: 2,
    subject: "How to prepare for Alpha Reset",
    trigger: { type: "before_event", days: 7 },
    body: (name) => `Hey ${name},

One week to go. Here's how to set yourself up:

1. Clear your calendar for 8-10 April. Tell people you're offline. No exceptions.

2. Stock up:
   - Water (lots of it)
   - Black coffee if you drink it
   - A good journal and pen
   - A book that challenges you

3. Set your intention. Why are you doing this? Write it down. Be specific. "I want clarity on my next career move" is better than "I want to grow."

4. Download Bestday and join the group: https://getbestdayapp.app.link/5SerCVKw60b — this is where we'll share updates, evening call links, and hold each other accountable.

5. Tell someone. Accountability changes everything. Tell a friend, a partner, someone who'll check on you.

6. Clean your space. Messy environment = messy mind. Start fresh.

One more thing — don't overthink it. You signed up for a reason. Trust that.

Kay`,
  },

  // Stage 3: "Final Reminder" — 2 days before event (6 April)
  {
    stage: 3,
    subject: "48 hours to go",
    trigger: { type: "before_event", days: 2 },
    body: (name) => `Hey ${name},

Alpha Reset starts in 48 hours. Midnight on Wednesday the 8th.

Eat well today and tomorrow. Hydrate. Get your affairs in order.

Wednesday night we have a kick-off call at 8pm BST on the Bestday group. Be there.

If you haven't joined the group yet: https://getbestdayapp.app.link/5SerCVKw60b

Remember why you signed up. Hold onto that.

See you Wednesday night.

Kay`,
  },

  // Stage 4: Day 1 — "Reset" (8 April)
  {
    stage: 4,
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

Group call tonight at 8pm BST on Bestday.

You've got this.

Kay`,
  },

  // Stage 5: Day 2 — "Reflect" (9 April)
  {
    stage: 5,
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

Group call tonight at 8pm BST.

Keep going.

Kay`,
  },

  // Stage 6: Day 3 — "Focus" (10 April)
  {
    stage: 6,
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

Final group call tonight at 8pm BST.

Almost there.

Kay`,
  },

  // Stage 7: Day after — "You Did It" (11 April)
  {
    stage: 7,
    subject: "You did it 🦾",
    trigger: { type: "after_event", days: 1 },
    body: (name) => `${name},

You did it. 72 hours. No food. Full life review. You're part of the 1% now.

How to break your fast safely:
- Start with clear broths, diluted fruit juice, or yogurt
- Don't overeat — your stomach has shrunk
- Keep drinking water
- Gradually reintroduce whole foods over the next day

More importantly — look at what you wrote down on Day 3. Those goals. That plan. That's your compass for the next 90 days. Don't let it collect dust.

The next Alpha Reset is in July. Between now and then, execute.

Stay connected on Bestday. The accountability doesn't stop when the fast ends.

Proud of you.

Kay`,
  },
];
