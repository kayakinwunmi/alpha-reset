"use client";

import { SignupForm } from "./components/SignupForm";
import { Countdown } from "./components/Countdown";
import { FAQ } from "./components/FAQ";
import { AudioPlayer } from "./components/AudioPlayer";
import Image from "next/image";

export default function Home() {
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
          <p className="text-xl md:text-2xl text-white/90 font-light italic">
            Live like the 1%.
          </p>
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
            <span className="font-semibold text-[var(--accent)]">23 March 2026</span>.
          </p>

          <div className="my-12">
            <Countdown targetDate="2026-03-23T00:00:00Z" />
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

          {/* Tips */}
          <div className="border-t border-[var(--rule)] mt-16 pt-12">
            <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-6">
              Tips for making the most of it
            </h3>
            <ul className="space-y-2 text-[var(--ink-light)] text-lg">
              <li>Schedule time for meditation, prayer, worship, and silence</li>
              <li>Read books or watch films that inspire you</li>
              <li>Review your life vision, mission, and core values</li>
              <li>Go for a walk in nature</li>
              <li>Drink plenty of water (or black coffee)</li>
              <li>Journal</li>
              <li>Remember — these 3 days are for <em>you</em></li>
            </ul>
          </div>

          {/* Breaking the fast */}
          <div className="border-t border-[var(--rule)] mt-12 pt-12">
            <h3 className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-[var(--accent)] mb-6">
              Breaking the fast safely
            </h3>
            <ul className="space-y-2 text-[var(--ink-light)] text-lg">
              <li>Start with easily digestible foods — clear broths, diluted fruit juices, or yogurt</li>
              <li>Avoid overeating immediately after your fast</li>
              <li>Continue drinking plenty of water and herbal teas</li>
              <li>Choose whole foods: fruits, vegetables, lean proteins, complex carbs</li>
            </ul>
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
      <FAQ />

      {/* Signup — the invitation */}
      <section id="signup" className="py-20 px-6 bg-[var(--paper-dark)]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-[var(--ink)] mb-4">
            Join Us
          </h2>
          <p className="text-lg text-[var(--ink-light)] mb-3">
            Next session: <span className="font-semibold text-[var(--accent)]">23–25 March 2026</span>
          </p>
          <p className="text-[var(--ink-faint)] mb-10 font-sans text-sm">
            Alpha Reset is free. You&apos;ll need a{" "}
            <a href="https://getbestdayapp.app.link/5SerCVKw60b" target="_blank" rel="noopener noreferrer" className="underline text-[var(--accent)]">
              Bestday Premium + AI
            </a>{" "}
            membership ($249/year) to join the group.
          </p>

          <SignupForm />
        </div>
      </section>

      {/* Close — like a letter signature */}
      <footer className="py-16 px-6 text-center">
        <p className="text-lg italic text-[var(--ink-light)] mb-6">
          Every quarter, become a completely different human being. By choice.
        </p>
        <p className="text-[var(--ink)]">— Kay</p>
        <div className="border-t border-[var(--rule)] mt-12 pt-6">
          <p className="text-sm text-[var(--ink-faint)] font-sans">
            Alpha Reset © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
