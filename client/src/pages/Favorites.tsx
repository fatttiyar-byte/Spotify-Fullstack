
import { useEffect, useState } from "react";
import {
  FiHeart,
  FiTrash2,
  FiMusic,
} from "react-icons/fi";
import toast from "react-hot-toast";

import SongCard, {
  type Song,
} from "../components/music/SongCard";

import { useMusicPlayer } from "../context/MusicPlayerContext";
import { useTheme } from "../context/ThemeContext";

import {
  getFavorites,
  toggleFavorite,
} from "../utils/musicStorage";

const getSongId = (song: Song | null | undefined) => {
  if (!song) return "";
  return String(song.id ?? song._id ?? "");
};

export default function Favorites() {
  const [songs, setSongs] = useState<Song[]>([]);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
  } = useMusicPlayer();

  useEffect(() => {
    setSongs(getFavorites());
  }, []);

  const removeFavorite = (song: Song) => {
    const updatedFavorites = toggleFavorite(song);
    setSongs(updatedFavorites);
    toast.success("از علاقه‌مندی‌ها حذف شد.");
  };

  const handlePlay = (song: Song) => {
    const selectedId = getSongId(song);
    const currentId = getSongId(currentSong);

    if (selectedId && selectedId === currentId) {
      if (!isPlaying) togglePlay();
      return;
    }

    playSong(song, songs);
  };

  const playingId = getSongId(currentSong);

  return (
    <div
      dir="rtl"
      className={`min-h-[60vh] space-y-7 transition-colors duration-300 ${
        isDark ? "text-white" : "text-slate-900"
      }`}
    >
      {/* Header */}
      <header>
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-blue-500">
          YOUR COLLECTION
        </p>

        <h1 className="flex items-center gap-3 text-2xl font-black sm:text-3xl">
          <FiHeart className="text-blue-500" />
          علاقه‌مندی‌ها
        </h1>

        <p className={`mt-3 text-sm ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          آهنگ‌هایی که برای خودت ذخیره کرده‌ای.
        </p>
      </header>

      {/* Collection Info */}
      <div className={`flex items-center justify-between rounded-2xl border p-4 transition-colors duration-300 ${
        isDark
          ? "border-white/[0.08] bg-[#111d30]"
          : "border-slate-200 bg-white shadow-sm"
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <FiMusic size={22} />
          </div>

          <div>
            <p className={`text-sm font-bold ${
              isDark ? "text-white" : "text-slate-800"
            }`}>
              مجموعه علاقه‌مندی‌های من
            </p>

            <p className={`mt-1 text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              آهنگ‌های ذخیره‌شده
            </p>
          </div>
        </div>

        <span className="rounded-full bg-blue-500/10 px-3 py-2 text-sm font-bold text-blue-500">
          {songs.length} آهنگ
        </span>
      </div>

      {/* Favorite Songs */}
      {songs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {songs.map((song, index) => {
            const id = getSongId(song) || String(index);

            return (
              <div key={id} className="relative min-w-0">
                <SongCard
                  song={song}
                  isPlaying={playingId === id && isPlaying}
                  isFavorite
                  onPlay={handlePlay}
                  onToggleFavorite={removeFavorite}
                />

                <button
                  type="button"
                  onClick={() => removeFavorite(song)}
                  title="حذف از علاقه‌مندی‌ها"
                  aria-label={`حذف ${song.title} از علاقه‌مندی‌ها`}
                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold text-red-500 transition duration-200 ${
                    isDark
                      ? "border-red-400/10 hover:bg-red-500/10"
                      : "border-red-200 bg-white hover:bg-red-50"
                  }`}
                >
                  <FiTrash2 size={15} />
                  حذف از علاقه‌مندی‌ها
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-12 text-center transition-colors duration-300 ${
          isDark
            ? "border-white/10 bg-white/[0.02]"
            : "border-slate-300 bg-white shadow-sm"
        }`}>
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500">
            <FiHeart size={34} />
          </div>

          <h3 className={`mt-5 text-lg font-extrabold ${
            isDark ? "text-white" : "text-slate-800"
          }`}>
            هنوز آهنگی ذخیره نکرده‌ای
          </h3>

          <p className={`mt-2 max-w-sm text-sm leading-7 ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}>
            از صفحه کاوش موسیقی، آهنگ‌های موردعلاقه‌ات را به این بخش اضافه کن.
          </p>
        </div>
      )}
    </div>
  );
}
