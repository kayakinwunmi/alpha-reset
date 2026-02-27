"use client";

import { useState, useRef, useEffect } from "react";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showVol, setShowVol] = useState(false);

  // Auto-play after 3 seconds on first user interaction
  useEffect(() => {
    let timer: NodeJS.Timeout;

    const tryPlay = () => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    };

    // Try after 3s (works if browser allows autoplay)
    timer = setTimeout(tryPlay, 3000);

    // Also listen for first interaction as fallback
    const handleInteraction = () => {
      if (!playing && audioRef.current && audioRef.current.paused) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("scroll", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <>
      <audio ref={audioRef} src="/ambient.mp3" loop preload="auto" />

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center">
        <div
          className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-[var(--rule)] rounded-full px-4 py-2.5 shadow-sm hover:shadow-md transition-all"
          onMouseEnter={() => setShowVol(true)}
          onMouseLeave={() => setShowVol(false)}
        >
          {/* Play/Pause */}
          <button
            onClick={toggle}
            className="flex items-center justify-center w-6 h-6"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="text-[var(--ink)]">
                <rect x="0" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
                <rect x="7" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
              </svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="text-[var(--ink)] ml-0.5">
                <path d="M0 0.5V11.5L10 6L0 0.5Z" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Sound wave bars */}
          <div className="flex items-end gap-[3px] h-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-[2.5px] rounded-full bg-[var(--accent)] origin-bottom"
                style={{
                  height: playing ? undefined : "4px",
                  animation: playing
                    ? `wave 1.2s ease-in-out ${i * 0.15}s infinite`
                    : "none",
                }}
              />
            ))}
          </div>

          {/* Volume controls - show on hover */}
          <div
            className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${
              showVol ? "w-24 opacity-100 ml-1" : "w-0 opacity-0"
            }`}
          >
            <button
              onClick={() => changeVolume(Math.max(0, volume - 0.1))}
              className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-xs font-sans flex-shrink-0"
              aria-label="Volume down"
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
              className="w-14 h-1 appearance-none bg-[var(--rule)] rounded-full cursor-pointer accent-[var(--accent)]"
            />
            <button
              onClick={() => changeVolume(Math.min(1, volume + 0.1))}
              className="text-[var(--ink-faint)] hover:text-[var(--ink)] text-xs font-sans flex-shrink-0"
              aria-label="Volume up"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </>
  );
}
