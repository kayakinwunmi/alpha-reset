"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  targetDate: string;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const blocks = [
    { value: timeLeft.days, label: "days" },
    { value: timeLeft.hours, label: "hours" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "sec" },
  ];

  return (
    <div className="flex gap-6 md:gap-8 justify-center">
      {blocks.map((block) => (
        <div key={block.label} className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl font-light text-[var(--ink)] font-mono tabular-nums">
            {String(block.value).padStart(2, "0")}
          </span>
          <span className="text-xs font-sans text-[var(--ink-faint)] mt-1 uppercase tracking-wider">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
}
