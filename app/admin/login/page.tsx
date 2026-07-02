"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-sm font-sans tracking-[0.3em] uppercase text-[var(--ink-faint)] mb-3 text-center">
          Alpha Reset
        </p>
        <h1 className="text-4xl font-light text-[var(--ink)] mb-10 text-center">The Ledger</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-sans text-[var(--ink-faint)] mb-1.5 uppercase tracking-wider"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/60 border border-[var(--rule)] text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none transition-colors font-sans text-sm"
            />
          </div>

          {status === "error" && <p className="text-red-700 text-sm font-sans">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3.5 bg-[var(--accent)] text-white font-sans text-sm tracking-wider uppercase hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
