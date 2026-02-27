"use client";

import { useState } from "react";

export function Entrance() {
  const [entered, setEntered] = useState(false);

  const enter = () => {
    setEntered(true);
    window.dispatchEvent(new Event("alpha-enter"));
  };

  if (entered) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer"
      style={{ background: "var(--paper)" }}
      onClick={enter}
    >
      <p className="text-sm font-sans tracking-[0.3em] uppercase text-[var(--ink-faint)] mb-8">
        A Personal Invitation
      </p>
      <h1 className="text-5xl md:text-7xl font-light text-[var(--ink)] mb-12 tracking-tight">
        Alpha Reset
      </h1>
      <button
        onClick={enter}
        className="px-8 py-3 border border-[var(--rule)] text-[var(--ink-light)] font-sans text-sm tracking-[0.2em] uppercase hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
      >
        Enter
      </button>
      <p className="text-xs text-[var(--ink-faint)] font-sans mt-6">
        🔊 Best with sound
      </p>
    </div>
  );
}
