"use client";

import { useState } from "react";

export function SignupForm() {
  const [form, setForm] = useState({ firstName: "", email: "", phone: "" });
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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="py-8 text-center">
        <p className="text-2xl font-light text-[var(--ink)] mb-4">You&apos;re in.</p>
        <p className="text-[var(--ink-light)] mb-8">
          Check your email. See you on the 23rd.
        </p>
        <a
          href="https://getbestdayapp.app.link/5SerCVKw60b"
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
        <label htmlFor="firstName" className="block text-xs font-sans text-[var(--ink-faint)] mb-1.5 uppercase tracking-wider">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          required
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="w-full px-4 py-3 bg-white/60 border border-[var(--rule)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none transition-colors font-sans text-sm"
          placeholder="Your first name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-sans text-[var(--ink-faint)] mb-1.5 uppercase tracking-wider">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 bg-white/60 border border-[var(--rule)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none transition-colors font-sans text-sm"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-xs font-sans text-[var(--ink-faint)] mb-1.5 uppercase tracking-wider">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-3 bg-white/60 border border-[var(--rule)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none transition-colors font-sans text-sm"
          placeholder="+44 7000 000000"
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
