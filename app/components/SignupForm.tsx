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

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="p-8 border border-[#D4AF37]/30 bg-[#0A0A0A] rounded-sm gold-glow text-center">
        <span className="text-4xl mb-4 block">🦾</span>
        <h3 className="text-2xl font-bold text-white mb-2">You&apos;re in.</h3>
        <p className="text-gray-400 mb-6">
          Welcome to Alpha Reset. Check your email for details.
        </p>
        <a
          href="https://getbestdayapp.app.link/5SerCVKw60b"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-sm hover:bg-[#F0D060] transition-all"
        >
          Join on Bestday →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left max-w-md mx-auto">
      <div>
        <label htmlFor="firstName" className="block text-sm text-gray-500 mb-1 uppercase tracking-wider">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          required
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-800 rounded-sm text-white placeholder-gray-700 focus:border-[#D4AF37] focus:outline-none transition-colors"
          placeholder="Your first name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-gray-500 mb-1 uppercase tracking-wider">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-800 rounded-sm text-white placeholder-gray-700 focus:border-[#D4AF37] focus:outline-none transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm text-gray-500 mb-1 uppercase tracking-wider">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-3 bg-[#0A0A0A] border border-gray-800 rounded-sm text-white placeholder-gray-700 focus:border-[#D4AF37] focus:outline-none transition-colors"
          placeholder="+44 7000 000000"
        />
      </div>

      {status === "error" && (
        <p className="text-red-500 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-[#D4AF37] text-black font-bold text-lg rounded-sm hover:bg-[#F0D060] transition-all disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
      >
        {status === "loading" ? "JOINING..." : "I'M IN 🦾"}
      </button>

      <p className="text-gray-700 text-xs text-center mt-2">
        No spam. Just the reset details.
      </p>
    </form>
  );
}
