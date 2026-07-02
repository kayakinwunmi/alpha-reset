"use client";

import { useState } from "react";
import { EVENT_START_ORDINAL, BESTDAY_URL } from "@/lib/event";

const inputClass =
  "w-full px-4 py-3 bg-white/60 border border-[var(--rule)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none transition-colors font-sans text-sm";

const labelClass =
  "block text-xs font-sans text-[var(--ink-faint)] mb-1.5 uppercase tracking-wider";

export function SignupForm() {
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phone: "",
    intention: "",
    company: "",
  });
  const [loadedAt] = useState(Date.now());
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _t: Date.now() - loadedAt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="py-8 text-center">
        <p className="text-2xl font-light text-[var(--ink)] mb-3">You&apos;re in.</p>
        <p className="text-[var(--ink-light)] mb-10">
          Check your email. See you on {EVENT_START_ORDINAL}.
        </p>

        <div className="max-w-sm mx-auto text-left space-y-4 mb-10">
          {[
            {
              n: "1",
              label: "Block the dates",
              action: (
                <a href="/api/calendar" className="underline text-[var(--accent)]">
                  Add to your calendar
                </a>
              ),
            },
            {
              n: "2",
              label: "Know the protocol",
              action: (
                <a href="/guide" className="underline text-[var(--accent)]">
                  Read the Field Guide
                </a>
              ),
            },
            {
              n: "3",
              label: "Meet the others",
              action: (
                <a
                  href={BESTDAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[var(--accent)]"
                >
                  Join the group on Bestday
                </a>
              ),
            },
          ].map((step) => (
            <div key={step.n} className="flex items-baseline gap-4 border-b border-[var(--rule)] pb-4">
              <span className="font-sans text-xs text-[var(--ink-faint)]">{step.n}</span>
              <div>
                <p className="text-[var(--ink)] leading-snug">{step.label}</p>
                <p className="font-sans text-sm mt-0.5">{step.action}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href={BESTDAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-[var(--accent)] text-white font-sans text-sm tracking-wider uppercase hover:bg-[var(--accent-light)] transition-colors"
        >
          Join on Bestday →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left max-w-sm mx-auto">
      <div>
        <label htmlFor="firstName" className={labelClass}>
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          required
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className={inputClass}
          placeholder="Your first name"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputClass}
          placeholder="+44 7000 000000"
        />
      </div>

      <div>
        <label htmlFor="intention" className={labelClass}>
          What do you want from these 72 hours? <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="intention"
          rows={3}
          maxLength={1000}
          value={form.intention}
          onChange={(e) => setForm({ ...form, intention: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="Be specific. “Clarity on my next career move” beats “I want to grow.”"
        />
      </div>

      {/* Honeypot - hidden from humans */}
      <div className="absolute opacity-0 pointer-events-none" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
      </div>

      {status === "error" && (
        <p className="text-red-700 text-sm font-sans">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3.5 bg-[var(--accent)] text-white font-sans text-sm tracking-wider uppercase hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Joining..." : "I'm in"}
      </button>

      <p className="text-[var(--ink-faint)] text-xs text-center font-sans">
        No spam. Just the reset details.
      </p>
    </form>
  );
}
