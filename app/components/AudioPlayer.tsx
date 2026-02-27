"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showVol, setShowVol] = useState(false);

  const startPlayback = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [volume]);

  // Listen for the entrance click to start audio
  useEffect(() => {
    const handler = () => startPlayback();
    window.addEventListener("alpha-enter", handler, { once: true });
    return () => window.removeEventListener("alpha-enter", handler);
  }, [startPlayback]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const changeVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(v * 20) / 20));
    setVolume(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  };

  return (
    <>
      <audio ref={audioRef} src="/ambient.mp3" loop preload="auto" />

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center">
        <div
          className="flex items-center gap-3 backdrop-blur-md border border-[var(--rule)]/40 rounded-full px-4 py-2.5 transition-all"
          style={{ background: "rgba(245, 240, 232, 0.35)" }}
          onMouseEnter={() => setShowVol(true)}
          onMouseLeave={() => setShowVol(false)}
        >
          {/* Play/Pause */}
          <button
            onClick={toggle}
            className="flex items-center justify-center w-5 h-5"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                <rect x="0" y="0" width="2.5" height="12" rx="0.5" fill="var(--ink-light)" />
                <rect x="5.5" y="0" width="2.5" height="12" rx="0.5" fill="var(--ink-light)" />
              </svg>
            ) : (
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="ml-0.5">
                <path d="M0 0.5V11.5L8 6L0 0.5Z" fill="var(--ink-light)" />
              </svg>
            )}
          </button>

          {/* Sound wave bars */}
          <div className="flex items-end gap-[2.5px] h-3.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[2px] rounded-full origin-bottom"
                style={{
                  background: "var(--accent)",
                  height: playing ? undefined : "3px",
                  animation: playing
                    ? `wave 1.2s ease-in-out ${i * 0.15}s infinite`
                    : "none",
                }}
              />
            ))}
          </div>

          {/* Volume — expand on hover */}
          <div
            className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${
              showVol ? "w-24 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <button
              onClick={() => changeVolume(volume - 0.1)}
              className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-xs font-sans flex-shrink-0"
            >
              −
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="w-14 h-0.5 appearance-none bg-[var(--rule)] rounded-full cursor-pointer accent-[var(--accent)]"
            />
            <button
              onClick={() => changeVolume(volume + 0.1)}
              className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-xs font-sans flex-shrink-0"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% { height: 3px; }
          50% { height: 14px; }
        }
      `}</style>
    </>
  );
}
