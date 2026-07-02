// Shared styling tokens and helpers for the admin dashboard components.

export const card = "bg-white/60 border border-[var(--rule)] p-5";

export const btn =
  "font-sans text-xs tracking-wider uppercase px-4 py-2.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export const btnPrimary = `${btn} bg-[var(--accent)] text-white hover:bg-[var(--accent-light)]`;

export const btnGhost = `${btn} border border-[var(--rule)] text-[var(--ink-light)] hover:border-[var(--accent)] hover:text-[var(--accent)]`;

export const inputClass =
  "w-full px-3 py-2.5 bg-white/60 border border-[var(--rule)] text-[var(--ink)] placeholder-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none font-sans text-sm";

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
