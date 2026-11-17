
import { useEffect, useState } from "react";

import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
  FiRepeat,
  FiShuffle,
  FiPlus,
  FiX,
} from "react-icons/fi";

import { useMusicPlayer } from "../context/MusicPlayerContext";
import { useTheme } from "../context/ThemeContext";

const formatTime = (time: number) => {
  if (!Number.isFinite(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export default function GlobalMusicPlayer() {
  const { theme } = useTheme();

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    nextSong,
    previousSong,
    seek,
   setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    addCurrentSongToPlaylist,
  } = useMusicPlayer();

  const [isVisible, setIsVisible] = useState(true);

  const isDark = theme === "dark";

  // با انتخاب آهنگ جدید، پلیر دوباره نمایش داده شود
  useEffect(() => {
    if (currentSong) {
      setIsVisible(true);
    }
  }, [currentSong]);

  if (!currentSong || !isVisible) return null;

  const cover =
    currentSong.thumbnail ||
    currentSong.cover ||
    currentSong.image ||
    "";

  const handleClose = () => {
    if (isPlaying) {
      togglePlay();
    }

    setIsVisible(false);
  };

  const handleVolumeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVolume(Number(event.target.value));
  };

  const handleSeek = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    seek(Number(event.target.value));
  };

  return (
    <div
      dir="rtl"
      className={`fixed bottom-0 left-0 right-0 z-[100] border-t backdrop-blur-2xl ${
        isDark
          ? "border-white/10 bg-[#080d18]/95 text-white"
          : "border-slate-200 bg-white/95 text-slate-900"
      }`}
    >
      <div className="relative mx-auto grid max-w-[1500px] grid-cols-3 items-center gap-5 px-5 py-3 max-md:flex max-md:flex-col max-md:gap-3">

        {/* بستن پلیر */}

        <button
          type="button"
          onClick={handleClose}
          title="بستن پلیر"
          aria-label="بستن پلیر و توقف پخش"
          className={`absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg transition ${
            isDark
              ? "text-slate-400 hover:bg-red-500/15 hover:text-red-400"
              : "text-slate-500 hover:bg-red-500/10 hover:text-red-500"
          }`}
        >
          <FiX size={19} />
        </button>

        {/* اطلاعات آهنگ */}

        <div className="flex w-full min-w-0 items-center gap-3 pl-8">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-blue-500/10">
            {cover ? (
              <img
                src={cover}
                alt={currentSong.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl text-blue-500">
                ♪
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">
              {currentSong.title}
            </p>

            <p className="truncate text-xs opacity-55">
              {currentSong.artist ||
                currentSong.album_title ||
                "TopMusic"}
            </p>
          </div>

          <button
            type="button"
            onClick={addCurrentSongToPlaylist}
            title="افزودن به پلی‌لیست"
            aria-label="افزودن آهنگ به پلی‌لیست"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500 transition hover:scale-105 hover:border-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <FiPlus size={21} />
          </button>
        </div>

        {/* کنترل پخش */}

        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={toggleShuffle}
              title="پخش تصادفی"
              aria-label="پخش تصادفی"
              className={`transition ${
                isShuffle
                  ? "text-blue-500"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <FiShuffle size={17} />
            </button>

            <button
              type="button"
              onClick={previousSong}
              title="آهنگ قبلی"
              aria-label="آهنگ قبلی"
              className="opacity-65 transition hover:text-blue-500 hover:opacity-100"
            >
              <FiSkipBack size={20} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "توقف پخش" : "شروع پخش"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition hover:scale-105 hover:bg-blue-500"
            >
              {isPlaying ? (
                <FiPause size={19} />
              ) : (
                <FiPlay size={19} />
              )}
            </button>

            <button
              type="button"
              onClick={nextSong}
              title="آهنگ بعدی"
              aria-label="آهنگ بعدی"
              className="opacity-65 transition hover:text-blue-500 hover:opacity-100"
            >
              <FiSkipForward size={20} />
            </button>

            <button
              type="button"
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
              aria-label="تکرار آهنگ"
              className={`relative transition ${
                repeatMode !== "off"
                  ? "text-blue-500"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <FiRepeat size={17} />

              {repeatMode === "one" && (
                <span className="absolute -right-1 -top-1 text-[9px] font-bold">
                  1
                </span>
              )}
            </button>
          </div>

          {/* نوار پیشرفت */}

          <div className="flex w-full items-center gap-3">
            <span className="min-w-[32px] text-[10px] opacity-55">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={handleSeek}
              disabled={!duration}
              aria-label="موقعیت پخش آهنگ"
              className="h-1 min-w-0 flex-1 cursor-pointer accent-blue-500 disabled:cursor-not-allowed"
            />

            <span className="min-w-[32px] text-left text-[10px] opacity-55">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* کنترل صدا */}

        <div className="flex w-full items-center justify-center gap-3 md:justify-end">
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted || volume === 0 ? "وصل کردن صدا" : "قطع صدا"}
            aria-label={isMuted || volume === 0 ? "وصل کردن صدا" : "قطع صدا"}
            className={`transition ${
              isMuted || volume === 0
                ? "text-blue-500"
                : "opacity-65 hover:text-blue-500 hover:opacity-100"
            }`}
          >
            {isMuted || volume === 0 ? (
              <FiVolumeX size={20} />
            ) : (
              <FiVolume2 size={20} />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="تنظیم میزان صدا"
            className="h-1 w-28 cursor-pointer accent-blue-500"
          />

          <span className="w-8 text-left text-[10px] opacity-55">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
