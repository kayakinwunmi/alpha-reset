import { SignupForm } from "./components/SignupForm";
import { Countdown } from "./components/Countdown";
import { FAQ } from "./components/FAQ";
import { AudioPlayer } from "./components/AudioPlayer";
import { getOpenSessions } from "@/lib/sessions";
import { toPublicSession } from "@/lib/session-types";

import Image from "next/image";

// Session dates come from the database (managed in /admin); refresh the
// static page every 5 minutes so schedule changes appear without a redeploy.
export const revalidate = 300;

export default async function Home() {
  const sessions = (await getOpenSessions()).map(toPublicSession);
  const next = sessions[0];

  return (
    <main className="min-h-screen">
      <AudioPlayer />
      {/* Hero — like the top of a personal letter */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/hero.png"
          alt="Sunrise on a mountain"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#F5F0E8]" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto -mt-20">
          <p className="text-white/80 text-sm font-sans tracking-[0.3em] uppercase mb-6">
            A Personal Invitation
          </p>
          <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight">
            Alpha Reset
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light italic mb-3">
            Live like the 1%.
          </p>
          <p className="text-white/70 font-sans text-sm tracking-[0.2em] uppercase mb-10">
            72 hours · No food · No distractions · {next.rangeLabel}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#signup"
              className="px-8 py-3.5 bg-[var(--accent)] text-white font-sans text-sm tracking-[0.2em] uppercase hover:bg-[var(--accent-light)] transition-colors"
            >
              Save my place
            </a>
            <a
              href="/guide"
              className="px-8 py-3.5 border border-white/50 text-white font-sans text-sm tracking-[0.2em] uppercase hover:border-white hover:bg-white/10 transition-colors"
            >
              Read the Field Guide
            </a>
          </div>
        </div>
      </section>

      {/* The Letter */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="border-t border-[var(--rule)] pt-12 mb-12" />

          <p className="text-lg md:text-xl leading-relaxed text-[var(--ink)] mb-8">
            Every quarter, I take 3 days off. No food. No distractions. Just me, God, and the truth.
          </p>

          <p className="text-lg md:text-xl leading-relaxed text-[var(--ink-light)] mb-8">
            It&apos;s called the Alpha Reset — a 72-hour water fast combined with a deep life review.
            It&apos;s not comfortable. It&apos;s not supposed to be. But by the end of it, you come out
            clearer, stronger, and more focused than you&apos;ve been in months.
          </p>

          <p className="text-lg md:text-xl leading-relaxed text-[var(--ink-light)] mb-8">
            This isn&apos;t a programme you watch from the sidelines. You either do it or you don&apos;t.
            And if you do it — you&apos;ll understand why I keep coming back every quarter.
          </p>

          <p className="text-lg md:text-xl leading-relaxed text-[var(--ink)] mb-2">
            The next one starts{" "}
            <span className="font-semibold text-[var(--accent)]">{next.startLabel}</span>.
          </p>

          <div className="my-12">
            <Countdown targetDate={next.startsAt} />
          </div>

          <div className="border-t border-[var(--rule)] my-16" />

          {/* Quote */}
          <blockquote className="text-2xl md:text-3xl font-light italic text-[var(--ink)] leading-relaxed my-12 pl-6 border-l-2 border-[var(--accent)]">
            &ldquo;Discipline is doing what you hate like you love it.&rdquo;
            <cite className="block text-base not-italic text-[var(--ink-faint)] mt-4">— Mike Tyson</cite>
          </blockquote>

          <div className="border-t border-[var(--rule)] my-16" />
        </div>
      </section>

      {/* The 3 Days */}
      <section className="py-12 px-6 bg-[var(--paper-dark)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-[var(--ink)] mb-16 text-center">
            The Three Days
          </h2>

          {/* Day 1 */}
          <div className="mb-16">
            <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
              Day One
            </h3>
            <h4 className="text-2xl md:text-3xl font-light text-[var(--ink)] mb-6">Reset</h4>
            <p className="text-lg leading-relaxed text-[var(--ink-light)] mb-6">
              Clear the distractions. Shut down the phone, turn off the TV, and get away from the noise.
              This isn&apos;t about relaxation — it&apos;s about facing yourself. Confront the digital addiction.
              Look deep inside and figure out what&apos;s really important and what&apos;s just noise.
            </p>
            <div className="pl-6 border-l border-[var(--rule)]">
              <p className="text-sm font-sans uppercase tracking-wider text-[var(--ink-faint)] mb-3">Reflect on</p>
              <ul className="space-y-2 text-[var(--ink-light)]">
                <li>What digital distractions have I relied on?</li>
                <li>How do I feel without constant access to social media?</li>
                <li>What activities can replace digital consumption?</li>
                <li>How is my mental clarity improving without the noise?</li>
              </ul>
            </div>
          </div>

          {/* Day 2 */}
          <div className="mb-16">
            <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
              Day Two
            </h3>
            <h4 className="text-2xl md:text-3xl font-light text-[var(--ink)] mb-6">Reflect</h4>
            <p className="text-lg leading-relaxed text-[var(--ink-light)] mb-6">
              By day two, your body is screaming for food. You&apos;re an alpha — you can handle pain.
              Take a hard look at the past ninety days. No excuses. What did you accomplish? What got in your way?
              Find the lessons hidden in there. This isn&apos;t about dwelling on failures — it&apos;s about
              learning from them.
            </p>
            <div className="my-8 relative h-64 md:h-80 rounded-sm overflow-hidden">
              <Image
                src="/journal.png"
                alt="Journaling and reflection"
                fill
                className="object-cover"
              />
            </div>
            <div className="pl-6 border-l border-[var(--rule)]">
              <p className="text-sm font-sans uppercase tracking-wider text-[var(--ink-faint)] mb-3">Reflect on</p>
              <ul className="space-y-2 text-[var(--ink-light)]">
                <li>What were my primary goals in the past 90 days?</li>
                <li>Which goals did I achieve, and how?</li>
                <li>Which goals did I struggle with, and why?</li>
                <li>What lessons have I learned from both successes and failures?</li>
                <li>How have my values and priorities shifted?</li>
              </ul>
            </div>
          </div>

          {/* Day 3 */}
          <div className="mb-16">
            <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-3">
              Day Three
            </h3>
            <h4 className="text-2xl md:text-3xl font-light text-[var(--ink)] mb-6">Focus</h4>
            <p className="text-lg leading-relaxed text-[var(--ink-light)] mb-6">
              Congratulations — you made it to day 3 with no food. You&apos;re telling your body and mind:
              you&apos;re in control. Now it&apos;s time to look forward. What are your goals for the next 90 days?
              What&apos;s the mission? Stop dreaming and start planning. Make a real plan — not a wish list.
              Imagine you&apos;re going to war. Will you lead yourself to victory?
            </p>
            <div className="pl-6 border-l border-[var(--rule)]">
              <p className="text-sm font-sans uppercase tracking-wider text-[var(--ink-faint)] mb-3">Reflect on</p>
              <ul className="space-y-2 text-[var(--ink-light)]">
                <li>What are my top three priorities for the next 90 days?</li>
                <li>What specific actions will I take?</li>
                <li>What obstacles might I face, and how can I overcome them?</li>
                <li>What am I going to stop doing?</li>
                <li>Who will hold me accountable?</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-light italic text-[var(--ink)] leading-relaxed">
            &ldquo;Man shall not live by bread alone, but by every word that comes out of the mouth of God.&rdquo;
          </blockquote>
          <cite className="block text-base not-italic text-[var(--ink-faint)] mt-6">— Matthew 4:4</cite>
        </div>
      </section>

      {/* The Protocol */}
      <section className="py-16 px-6 bg-[var(--paper-dark)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-[var(--ink)] mb-12 text-center">
            The Protocol
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-6">
                What you do
              </h3>
              <ul className="space-y-3 text-lg text-[var(--ink-light)]">
                <li>Set an intention for the journey</li>
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
              <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--ink-light)] mb-6">
                What you avoid
              </h3>
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

          {/* Field Guide pointer */}
          <div className="border-t border-[var(--rule)] mt-16 pt-12 text-center">
            <p className="text-lg text-[var(--ink-light)] mb-6">
              How to prepare, what to stock, the day-by-day prompts, and how to break the fast
              safely — it&apos;s all written down.
            </p>
            <a
              href="/guide"
              className="inline-block px-8 py-3 border border-[var(--accent)] text-[var(--accent)] font-sans text-sm tracking-[0.2em] uppercase hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
              The Field Guide →
            </a>
          </div>
        </div>
      </section>

      {/* The Calendar — upcoming sessions */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-[var(--ink)] mb-4 text-center">
            The Calendar
          </h2>
          <p className="text-lg text-[var(--ink-light)] text-center mb-12">
            One reset every quarter — and once a year, we do it together in person.
            Register for the next one, or plan the whole year.
          </p>
          <div className="space-y-0">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-baseline justify-between gap-3 py-6 border-b border-[var(--rule)] first:border-t"
              >
                <div>
                  <p className="text-xl text-[var(--ink)]">
                    {s.rangeLabel}
                    {s.kind === "in_person" && (
                      <span className="ml-3 align-middle inline-block px-2 py-0.5 font-sans text-[10px] tracking-[0.15em] uppercase bg-[var(--accent)] text-white">
                        In person
                      </span>
                    )}
                  </p>
                  <p className="font-sans text-sm text-[var(--ink-faint)] mt-1">
                    {s.title}
                    {s.location ? ` · ${s.location}` : ""}
                    {s.notes ? ` — ${s.notes}` : ""}
                  </p>
                </div>
                <a href="#signup" className="font-sans text-sm text-[var(--accent)] underline shrink-0">
                  {s.kind === "in_person" ? "Request a place ↓" : "Sign up ↓"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Is this for you */}
      <section className="py-16 px-6 bg-[var(--paper-dark)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-[var(--ink)] mb-12 text-center">
            Is This For You?
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-6">
                This is for you if
              </h3>
              <ul className="space-y-3 text-lg text-[var(--ink-light)]">
                <li>You&apos;re busy but can&apos;t say what the last 90 days added up to</li>
                <li>You want clarity more than comfort</li>
                <li>You keep promises to everyone except yourself</li>
                <li>You&apos;d rather do something hard once a quarter than drift for a year</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--ink-light)] mb-6">
                It&apos;s not for you if
              </h3>
              <ul className="space-y-3 text-lg text-[var(--ink-faint)]">
                <li>You want a challenge to watch, not one to do</li>
                <li>You&apos;re looking for a weight-loss hack</li>
                <li>You expect it to be easy — it isn&apos;t, by design</li>
                <li>A fast isn&apos;t medically safe for you right now</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Brotherhood image */}
      <section className="relative h-64 md:h-96">
        <Image
          src="/brotherhood.png"
          alt="Brotherhood"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--paper-dark)] via-transparent to-[var(--paper)]" />
      </section>

      {/* What happens after */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-[var(--ink)] mb-12 text-center">
            After Three Days
          </h2>
          <div className="grid sm:grid-cols-2 gap-8 text-center">
            {[
              { text: "More connected to God" },
              { text: "Alive — cells renewed, mind sharp" },
              { text: "Confident with clear purpose" },
              { text: "Brave — you defeated your demon" },
              { text: "Stronger than before" },
              { text: "Better family relationships" },
            ].map((item, i) => (
              <p key={i} className="text-lg text-[var(--ink-light)] py-4 border-b border-[var(--rule)] last:border-0">
                {item.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ nextRangeLabel={next.rangeLabel} nextWeekday={next.startWeekday} />

      {/* Signup — the invitation */}
      <section id="signup" className="py-20 px-6 bg-[var(--paper-dark)]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-[var(--ink)] mb-4">
            Join Us
          </h2>
          <p className="text-lg text-[var(--ink-light)] mb-3">
            Next session: <span className="font-semibold text-[var(--accent)]">{next.rangeLabel}</span>
          </p>
          <p className="text-[var(--ink-faint)] mb-10 font-sans text-sm">
            Alpha Reset is free. You&apos;ll need a{" "}
            <a href="https://getbestdayapp.app.link/5SerCVKw60b" target="_blank" rel="noopener noreferrer" className="underline text-[var(--accent)]">
              Bestday Premium + AI
            </a>{" "}
            membership ($249/year) to join the group.
          </p>

          <SignupForm sessions={sessions} />
        </div>
      </section>

      {/* Close — like a letter signature */}
      <footer className="py-16 px-6 text-center">
        <p className="text-lg italic text-[var(--ink-light)] mb-6">
          Every quarter, become a completely different human being. By choice.
        </p>
        <p className="text-[var(--ink)]">— Kay</p>
        <div className="border-t border-[var(--rule)] mt-12 pt-6 max-w-2xl mx-auto">
          <p className="text-xs text-[var(--ink-faint)] font-sans leading-relaxed mb-4">
            Alpha Reset is a personal challenge, not medical advice. Extended fasting isn&apos;t
            suitable for everyone — if you&apos;re pregnant, under 18, diabetic, or have any medical
            condition, consult your doctor first.
          </p>
          <p className="text-sm text-[var(--ink-faint)] font-sans">
            <a href="/guide" className="underline hover:text-[var(--accent)] transition-colors">Field Guide</a>
            {" · "}Alpha Reset © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
