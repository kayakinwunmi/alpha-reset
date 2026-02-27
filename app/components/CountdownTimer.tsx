"use client";

import { useCallback, useSyncExternalStore } from "react";

const TARGET_DATE = new Date("2026-03-23T00:00:00").getTime();

function getSecondsLeft(): number {
  return Math.max(0, Math.floor((TARGET_DATE - Date.now()) / 1000));
}

function useCountdown() {
  const subscribe = useCallback((cb: () => void) => {
    const id = setInterval(cb, 1000);
    return () => clearInterval(id);
  }, []);

  const seconds = useSyncExternalStore(subscribe, getSecondsLeft, getSecondsLeft);

  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    total: seconds,
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm sm:h-24 sm:w-24">
        <span className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-xs font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const time = useCountdown();

  if (time.total === 0) {
    return (
      <p className="text-2xl font-bold text-gold sm:text-3xl">
        THE RESET HAS BEGUN.
      </p>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4">
      <Digit value={time.days} label="Days" />
      <Digit value={time.hours} label="Hours" />
      <Digit value={time.minutes} label="Minutes" />
      <Digit value={time.seconds} label="Seconds" />
    </div>
  );
}
