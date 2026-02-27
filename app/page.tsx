"use client";

import { useState, useEffect } from "react";
import { SignupForm } from "./components/SignupForm";
import { Countdown } from "./components/Countdown";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="hero-bg min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-medium">
            Quarterly Challenge
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            <span className="gold-gradient">ALPHA</span>{" "}
            <span className="text-white">RESET</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
            Live like the 1%.
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            72 hours. Water only. A complete life review.
            <br />
            Every quarter, become a completely different human being. By choice.
          </p>

          <Countdown targetDate="2026-03-23T00:00:00Z" />

          <a
            href="#signup"
            className="inline-block mt-10 px-10 py-4 bg-[#D4AF37] text-black font-bold text-lg rounded-sm hover:bg-[#F0D060] transition-all duration-300 tracking-wide"
          >
            I&apos;M IN
          </a>
        </div>

        <div className="absolute bottom-10 animate-bounce">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center">
            It&apos;s that time of the quarter to <span className="gold-gradient">abstain</span>.
          </h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-6 leading-relaxed">
            This 3-day journey is an opportunity for personal growth and transformation.
            By committing to the challenge, you&apos;re taking a step towards becoming a more
            disciplined, confident, and powerful individual.
          </p>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto leading-relaxed">
            You&apos;re becoming the top 1%.
          </p>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 px-6 border-y border-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-4xl font-light italic text-gray-200 mb-6 leading-relaxed">
            &ldquo;Discipline is doing what you hate like you love it.&rdquo;
          </blockquote>
          <cite className="text-[#D4AF37] text-lg not-italic">— Mike Tyson</cite>
        </div>
      </section>

      {/* What is an Alpha */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-center">
            Who is an <span className="gold-gradient">Alpha</span>?
          </h2>
          <p className="text-gray-500 text-center mb-16 text-lg">
            This journey is about starving the body to feed your spirit and soul.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "⚔️", text: "Disciplined, confident, powerful" },
              { icon: "🎯", text: "Don't leave things to chance" },
              { icon: "🛡️", text: "Protect and provide for people around them" },
              { icon: "🔥", text: "Embrace pain and discomfort" },
              { icon: "📐", text: "Set impossibly high standards" },
              { icon: "🚀", text: "Never coast through life aimlessly" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 bg-[#0A0A0A] border border-gray-900 rounded-sm hover:border-[#D4AF37]/30 transition-colors"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-gray-300 text-lg">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-3xl font-light italic text-gray-300 mb-6 leading-relaxed">
            &ldquo;Man shall not live by bread alone, but by every word that comes out of the mouth of God.&rdquo;
          </blockquote>
          <cite className="text-[#D4AF37] not-italic">— Matthew 4:4</cite>
        </div>
      </section>

      {/* What You Do / Avoid */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            The <span className="gold-gradient">Protocol</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Do */}
            <div>
              <h3 className="text-xl font-bold text-[#D4AF37] mb-6 uppercase tracking-wider">
                What You Do
              </h3>
              <ul className="space-y-4">
                {[
                  "Set an intention for the journey",
                  "Walk or run every day",
                  "Water & coffee only",
                  "Read books, podcasts, audiobooks",
                  "Pray. Pray. Pray.",
                  "Sleep early, wake early",
                  "Quiet time & meditation",
                  "Review last 90 days (written)",
                  "Set direction for next 90 days",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1 text-lg">✓</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avoid */}
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-6 uppercase tracking-wider">
                What You Avoid
              </h3>
              <ul className="space-y-4">
                {[
                  "Social media binges",
                  "Porn, smoking, sex",
                  "Video games, junk Netflix",
                  "Reading junk, negative thinking",
                  "Waking late, being idle",
                  "Messy environment",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 text-lg">✕</span>
                    <span className="text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-24 px-6 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            After <span className="gold-gradient">3 Days</span>
          </h2>
          <p className="text-gray-500 mb-16 text-lg">You will feel the difference.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🙏", title: "Connected to God", desc: "Deeper spiritual clarity" },
              { icon: "⚡", title: "Alive", desc: "Cells renewed, mind sharp" },
              { icon: "🎯", title: "Clear Purpose", desc: "Confident direction for the next 90 days" },
              { icon: "🦁", title: "Brave", desc: "You defeated your demon" },
              { icon: "💪", title: "Stronger", desc: "Mental and physical fortitude" },
              { icon: "❤️", title: "Better Relationships", desc: "Deeper family connections" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-[#0F0F0F] border border-gray-900 rounded-sm text-center hover:border-[#D4AF37]/30 transition-colors"
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Signup */}
      <section id="signup" className="py-24 px-6 bg-[#050505] border-t border-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to <span className="gold-gradient">Reset</span>?
          </h2>
          <p className="text-gray-400 mb-4 text-lg">
            Next session: <span className="text-[#D4AF37] font-semibold">23–25 March 2026</span>
          </p>
          <p className="text-gray-500 mb-12">
            G-check yourself every 90 days. Join the challenge.
          </p>

          <SignupForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-900 text-center">
        <p className="text-gray-600 text-sm">
          Alpha Reset © {new Date().getFullYear()}. Every quarter, become a completely different human being.
        </p>
      </footer>
    </main>
  );
}
