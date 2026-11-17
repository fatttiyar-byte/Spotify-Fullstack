import { useState } from "react";
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiHeart,
} from "react-icons/fi";

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)] bg-[var(--sidebar-bg)]/95 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">

        {/* Song information */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br from-[#85134F] to-[#201522]" />

          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-[var(--text-primary)]">
              No song selected
            </h4>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              Choose a song to start
            </p>
          </div>

          <button className="hidden text-[var(--text-secondary)] transition hover:text-[var(--accent-hover)] sm:block">
            <FiHeart size={18} />
          </button>
        </div>

        {/* Player controls */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <FiSkipBack size={19} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white transition hover:scale-105 hover:bg-[var(--accent-hover)]"
            >
              {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
            </button>

            <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <FiSkipForward size={19} />
            </button>
          </div>

          <div className="hidden w-full max-w-md items-center gap-3 sm:flex">
            <span className="text-[10px] text-[var(--text-secondary)]">
              0:00
            </span>

            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--surface-bg)]">
              <div className="h-full w-0 rounded-full bg-[var(--accent)]" />
            </div>

            <span className="text-[10px] text-[var(--text-secondary)]">
              0:00
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
          <FiVolume2 className="text-[var(--text-secondary)]" />

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 accent-[var(--accent)]"
          />
        </div>
      </div>
    </footer>
  );
}

export default MusicPlayer;