import type { Metadata } from "next";
import Link from "next/link";
import { GROUP_CALL_TIME, BESTDAY_URL } from "@/lib/event";
import { getNextSession } from "@/lib/sessions";
import { toPublicSession } from "@/lib/session-types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Field Guide — Alpha Reset",
  description:
    "Everything you need for the 72 hours: how to prepare, the day-by-day protocol, the reflection prompts, and how to break the fast safely.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-6">
      {children}
    </h2>
  );
}

const days = [
  {
    label: "Day One",
    name: "Reset",
    summary:
      "Disconnect from the noise. Shut down the phone, turn off the TV, step away from social media. This isn't relaxation — it's confrontation. Drink water, walk, journal, pray.",
    prompts: [
      "What digital distractions have I relied on?",
      "How do I feel without constant access to them?",
      "What's actually important — and what's just noise?",
      "What activities can replace digital consumption?",
    ],
  },
  {
    label: "Day Two",
    name: "Reflect",
    summary:
      "Your body will be screaming for food. Good — that means it's working. Take a hard, honest look at the past 90 days. No excuses. This isn't about beating yourself up; it's about seeing clearly.",
    prompts: [
      "What were my primary goals in the past 90 days?",
      "Which did I achieve, and how?",
      "Which did I struggle with — or dodge — and why?",
      "What did I learn from the wins AND the failures?",
      "How have my values and priorities shifted?",
    ],
  },
  {
    label: "Day Three",
    name: "Focus",
    summary:
      "Over 48 hours without food. You've proven who's in control. Now look forward: the next 90 days. Don't write a wish list — write a battle plan.",
    prompts: [
      "What are my top three priorities for the next quarter?",
      "What specific actions will I take, and when?",
      "What obstacles will I face, and how will I handle them?",
      "What am I going to STOP doing?",
      "Who will hold me accountable?",
    ],
  },
];

export default async function GuidePage() {
  const next = toPublicSession(await getNextSession());

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="pt-20 pb-12 px-6 text-center">
        <p className="text-sm font-sans tracking-[0.3em] uppercase text-[var(--ink-faint)] mb-6">
          Alpha Reset
        </p>
        <h1 className="text-5xl md:text-7xl font-light text-[var(--ink)] mb-6 tracking-tight">
          The Field Guide
        </h1>
        <p className="text-lg text-[var(--ink-light)] italic mb-8">
          Everything you need for the 72 hours. Read it before you begin.
        </p>
        <p className="text-[var(--ink)]">
          Next reset:{" "}
          <span className="font-semibold text-[var(--accent)]">{next.rangeLabel}</span>
          {" · "}
          <a href="/api/calendar" className="font-sans text-sm underline text-[var(--accent)]">
            Add to calendar
          </a>
        </p>
      </header>

      {/* Before you begin — safety */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto border border-[var(--rule)] bg-[var(--paper-dark)] p-8">
          <SectionLabel>Before you begin</SectionLabel>
          <p className="text-lg leading-relaxed text-[var(--ink-light)]">
            A 72-hour water fast is demanding by design, but it must be safe. If you&apos;re
            pregnant or breastfeeding, under 18, have diabetes, a heart condition, low blood
            pressure, a history of eating disorders, or take regular medication —{" "}
            <strong className="text-[var(--ink)]">talk to your doctor before joining</strong>.
            During the fast, hunger is expected; feeling genuinely unwell is not. Dizziness that
            doesn&apos;t pass, chest pain, confusion, fainting — stop and eat. There will be
            another reset next quarter. Discipline is the goal, not harm.
          </p>
        </div>
      </section>

      {/* The week before */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel>The week before</SectionLabel>
          <ol className="space-y-6">
            {[
              {
                title: "Clear your calendar",
                body: `Block ${next.rangeLabel}. Tell people you're offline. No exceptions, no "quick calls".`,
              },
              {
                title: "Set your intention",
                body: "Why are you doing this? Write it down. Be specific — “clarity on my next career move” beats “I want to grow”.",
              },
              {
                title: "Join the group",
                body: "Download Bestday and join the Alpha Reset group. That's where updates, evening call links, and accountability live.",
              },
              {
                title: "Tell someone",
                body: "A friend, a partner, someone who'll check on you. Accountability changes everything.",
              },
              {
                title: "Clean your space",
                body: "Messy environment, messy mind. Start the three days fresh.",
              },
              {
                title: "Eat and sleep well",
                body: "In the final 48 hours: proper meals, plenty of water, early nights. You want to arrive strong.",
              },
            ].map((step, i) => (
              <li key={i} className="flex gap-5 border-b border-[var(--rule)] pb-6">
                <span className="font-sans text-sm text-[var(--ink-faint)] pt-1">{i + 1}</span>
                <div>
                  <p className="text-xl text-[var(--ink)] mb-1">{step.title}</p>
                  <p className="text-lg leading-relaxed text-[var(--ink-light)]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What to stock */}
      <section className="py-12 px-6 bg-[var(--paper-dark)]">
        <div className="max-w-2xl mx-auto">
          <SectionLabel>What to stock</SectionLabel>
          <ul className="space-y-3 text-lg text-[var(--ink-light)]">
            <li>Water — more than you think you need</li>
            <li>Black coffee, if you drink it (no milk, no sugar)</li>
            <li>Herbal teas</li>
            <li>A good journal and a pen you like</li>
            <li>A book that challenges you</li>
            <li>For breaking the fast: clear broth, fruit for diluted juice, plain yogurt</li>
          </ul>
        </div>
      </section>

      {/* The rules */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel>The rules</SectionLabel>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="font-sans text-xs uppercase tracking-wider text-[var(--ink-faint)] mb-4">
                What you do
              </p>
              <ul className="space-y-3 text-lg text-[var(--ink-light)]">
                <li>Walk or run every day</li>
                <li>Water &amp; coffee only</li>
                <li>Read, listen to podcasts, audiobooks</li>
                <li>Pray. Pray. Pray.</li>
                <li>Sleep early, wake early</li>
                <li>Quiet time &amp; meditation</li>
                <li>Review last 90 days (written)</li>
                <li>Set direction for next 90 days</li>
              </ul>
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-wider text-[var(--ink-faint)] mb-4">
                What you avoid
              </p>
              <ul className="space-y-3 text-lg text-[var(--ink-faint)]">
                <li>Social media binges</li>
                <li>Porn, smoking, sex</li>
                <li>Video games, junk Netflix</li>
                <li>Negative thinking, junk reading</li>
                <li>Waking late, being idle</li>
                <li>Messy environment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Day by day */}
      <section className="py-12 px-6 bg-[var(--paper-dark)]">
        <div className="max-w-2xl mx-auto">
          <SectionLabel>The three days</SectionLabel>
          <p className="text-lg text-[var(--ink-light)] mb-12">
            Eat your last meal by 6pm on {next.kickoffWeekday} evening — that&apos;s your 72
            hours. The fast begins at midnight on {next.startWeekday} and ends at 6pm on{" "}
            {next.endWeekday}. There&apos;s a group call every evening at {GROUP_CALL_TIME} on
            Bestday — kick-off is {next.kickoffWeekday} night, the evening before the fast
            begins.
          </p>

          {days.map((day) => (
            <div key={day.name} className="mb-14 last:mb-0">
              <p className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-2">
                {day.label}
              </p>
              <h3 className="text-2xl md:text-3xl font-light text-[var(--ink)] mb-4">{day.name}</h3>
              <p className="text-lg leading-relaxed text-[var(--ink-light)] mb-6">{day.summary}</p>
              <div className="pl-6 border-l border-[var(--rule)]">
                <p className="text-sm font-sans uppercase tracking-wider text-[var(--ink-faint)] mb-3">
                  Journal prompts
                </p>
                <ul className="space-y-2 text-[var(--ink-light)]">
                  {day.prompts.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Breaking the fast */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel>Breaking the fast</SectionLabel>
          <p className="text-lg leading-relaxed text-[var(--ink-light)] mb-6">
            How you end the fast matters as much as how you run it. Your digestive system has been
            asleep for three days — wake it gently.
          </p>
          <ul className="space-y-3 text-lg text-[var(--ink-light)]">
            <li>Start with easily digestible foods — clear broths, diluted fruit juice, or yogurt</li>
            <li>Don&apos;t overeat immediately — your stomach has shrunk</li>
            <li>Keep drinking plenty of water and herbal teas</li>
            <li>Over the next day, reintroduce whole foods: fruits, vegetables, lean proteins, complex carbs</li>
          </ul>
        </div>
      </section>

      {/* After */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <SectionLabel>After the three days</SectionLabel>
          <p className="text-lg leading-relaxed text-[var(--ink-light)]">
            The fast ends. The work doesn&apos;t. What you wrote on Day 3 is your compass for the
            next 90 days — put it somewhere you&apos;ll see it every week. Stay in the Bestday
            group; the accountability doesn&apos;t stop when the fast ends. And in a quarter,
            we go again.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[var(--paper-dark)] text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-2xl font-light text-[var(--ink)] mb-8">
            Ready? The next reset is {next.rangeLabel}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#signup"
              className="px-8 py-3.5 bg-[var(--accent)] text-white font-sans text-sm tracking-[0.2em] uppercase hover:bg-[var(--accent-light)] transition-colors"
            >
              Save my place
            </Link>
            <a
              href={BESTDAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-[var(--accent)] text-[var(--accent)] font-sans text-sm tracking-[0.2em] uppercase hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
              Join on Bestday
            </a>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 text-center">
        <p className="text-sm text-[var(--ink-faint)] font-sans">
          <Link href="/" className="underline hover:text-[var(--accent)] transition-colors">
            ← Back to Alpha Reset
          </Link>
        </p>
      </footer>
    </main>
  );
}
