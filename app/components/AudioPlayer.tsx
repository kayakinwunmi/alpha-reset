"use client";

import { useState, useRef, useEffect } from "react";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [showVol, setShowVol] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Autoplay on first user interaction (browsers block autoplay without gesture)
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => {
          setPlaying(true);
          setHasInteracted(true);
        }).catch(() => {});
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("scroll", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [hasInteracted, volume]);

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

      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
        onMouseEnter={() => setShowVol(true)}
        onMouseLeave={() => setShowVol(false)}
      >
        {/* Volume slider — appears on hover */}
        <div
          className={`flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[var(--rule)] rounded-full px-3 py-2 transition-all duration-300 ${
            showVol ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          <button
            onClick={() => changeVolume(Math.max(0, volume - 0.1))}
            className="text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs font-sans"
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
            className="w-16 h-1 appearance-none bg-[var(--rule)] rounded-full cursor-pointer accent-[var(--accent)]"
          />
          <button
            onClick={() => changeVolume(Math.min(1, volume + 0.1))}
            className="text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors text-xs font-sans"
            aria-label="Volume up"
          >
            +
          </button>
        </div>

        {/* Play/Pause pill */}
        <button
          onClick={toggle}
          className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-[var(--rule)] rounded-full hover:bg-white transition-all shadow-sm"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" className="text-[var(--ink)]">
              <rect x="1" y="1" width="3" height="12" rx="0.5" fill="currentColor" />
              <rect x="8" y="1" width="3" height="12" rx="0.5" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none" className="text-[var(--ink)] ml-0.5">
              <path d="M1 1.5V12.5L11 7L1 1.5Z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
