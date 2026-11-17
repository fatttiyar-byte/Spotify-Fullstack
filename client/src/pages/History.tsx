
import { useEffect, useState } from "react";
import { FiClock, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

import SongCard from "../components/music/SongCard";

import {
  useMusicPlayer,
  type Song as PlayerSong,
} from "../context/MusicPlayerContext";

import { useTheme } from "../context/ThemeContext";

import {
  clearHistory,
  getHistory,
  addToHistory,
} from "../utils/musicStorage";

export default function History() {
  const [songs, setSongs] = useState<PlayerSong[]>([]);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    playSong,
    currentSong,
    isPlaying,
  } = useMusicPlayer();

  useEffect(() => {
    setSongs(getHistory());
  }, []);

  const getSongId = (
    song: PlayerSong | null | undefined
  ): string => {
    return String(song?.id ?? song?._id ?? "");
  };

  const playFromHistory = (song: PlayerSong) => {
    const updatedHistory = addToHistory(song);

    setSongs(updatedHistory);

    playSong(song, updatedHistory);
  };

  const handleClear = () => {
    clearHistory();
    setSongs([]);
    toast.success("تاریخچه پخش پاک شد.");
  };

  const currentSongId = getSongId(currentSong);

  return (
    <main
      dir="rtl"
      className={`min-h-[60vh] px-4 py-8 transition-colors duration-300 sm:px-6 lg:px-8 ${
        isDark
          ? "bg-[#080E1D] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.2em] text-blue-500">
              RECENTLY PLAYED
            </p>

            <h1 className="flex items-center gap-3 text-2xl font-black sm:text-3xl">
              <FiClock className="text-blue-500" />
              تاریخچه پخش
            </h1>

            <p className={`mt-2 text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              آهنگ‌هایی که اخیراً گوش دادی.
            </p>
          </div>

          {songs.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-red-500 transition duration-200 ${
                isDark
                  ? "border-red-400/20 hover:bg-red-500/10"
                  : "border-red-200 bg-white hover:bg-red-50"
              }`}
            >
              <FiTrash2 size={16} />
              پاک کردن تاریخچه
            </button>
          )}
        </header>

        {/* Songs */}
        {songs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {songs.map((song, index) => {
              const songId = getSongId(song) || String(index);

              const isCurrentSong =
                currentSongId !== "" &&
                currentSongId === getSongId(song);

              return (
                <SongCard
                  key={songId}
                  song={song}
                  isPlaying={isCurrentSong && isPlaying}
                  onPlay={() => playFromHistory(song)}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-12 text-center transition-colors duration-300 ${
            isDark
              ? "border-white/10 bg-white/[0.02]"
              : "border-slate-300 bg-white shadow-sm"
          }`}>
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500">
              <FiClock size={34} />
            </div>

            <h3 className={`mt-5 text-lg font-extrabold ${
              isDark ? "text-white" : "text-slate-800"
            }`}>
              تاریخچه‌ای وجود نداره
            </h3>

            <p className={`mt-2 text-sm leading-7 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              با پخش آهنگ، تاریخچه‌ات اینجا نمایش داده می‌شه.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
