
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiMusic,
  FiTrash2,
  FiRefreshCw,
  FiLock,
  FiDisc,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import toast from "react-hot-toast";

import SongCard, { type Song } from "../components/music/SongCard";
import { useMusicPlayer } from "../context/MusicPlayerContext";

import {
  getPlaylist,
  removeSongFromPlaylist,
} from "../services/profileService";

import { musicApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";

type PlaylistItem =
  | string
  | number
  | Song
  | {
      id?: string | number;
      _id?: string | number;
      songId?: string | number;
    };

const getSongId = (song: PlaylistItem): string => {
  if (typeof song === "string" || typeof song === "number") {
    return String(song);
  }

  const id =
    ("id" in song ? song.id : undefined) ??
    ("_id" in song ? song._id : undefined) ??
    ("songId" in song ? song.songId : undefined);

  return String(id ?? "");
};

const extractSongs = (data: any): Song[] => {
  const result = Array.isArray(data)
    ? data
    : data?.songs ?? data?.data?.songs ?? data?.data ?? [];

  return Array.isArray(result) ? result : [];
};

const extractPlaylist = (data: any): PlaylistItem[] => {
  const result = Array.isArray(data)
    ? data
    : data?.playlist ??
      data?.data?.playlist ??
      data?.data ??
      [];

  return Array.isArray(result) ? result : [];
};

export default function Playlists() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    currentSong,
    isPlaying,
    playSong,
    playlistVersion,
  } = useMusicPlayer();

  const [playlistIds, setPlaylistIds] = useState<string[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const surface = isDark
    ? "border-white/[0.08] bg-[#111d30]"
    : "border-slate-200 bg-white";

  const primaryText = isDark
    ? "text-white"
    : "text-slate-900";

  const mutedText = isDark
    ? "text-slate-400"
    : "text-slate-500";

  // دریافت پلی‌لیست و اطلاعات آهنگ‌ها
  const fetchPlaylist = useCallback(async () => {
    if (!isAuthenticated) {
      setPlaylistIds([]);
      setPlaylistSongs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const playlistResponse = await getPlaylist();
      const playlistData = extractPlaylist(playlistResponse);

      const ids = playlistData
        .map(getSongId)
        .filter(Boolean);

      setPlaylistIds(ids);

      // آهنگ‌هایی که اطلاعات کامل آن‌ها از API برگشته
      const embeddedSongs = playlistData.filter(
        (item): item is Song =>
          typeof item === "object" &&
          item !== null &&
          "title" in item
      );

      try {
        const songsResponse = await musicApi.get("/song/all");
        const allSongs = extractSongs(songsResponse.data);

        const matchedSongs = allSongs.filter((song) =>
          ids.includes(getSongId(song))
        );

        setPlaylistSongs(
          matchedSongs.length > 0
            ? matchedSongs
            : embeddedSongs
        );
      } catch {
        setPlaylistSongs(embeddedSongs);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "دریافت پلی‌لیست با مشکل مواجه شد."
        );
      } else {
        setError("خطایی رخ داده است. دوباره تلاش کنید.");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist, playlistVersion]);

  // حذف آهنگ
  const handleRemoveSong = async (id: string) => {
    try {
      setRemovingId(id);
      setError("");
      setMessage("");

      const response = await removeSongFromPlaylist(id);

      await fetchPlaylist();

      const successMessage =
        response?.message || "آهنگ از پلی‌لیست حذف شد.";

      setMessage(successMessage);
      toast.success(successMessage);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "حذف آهنگ انجام نشد."
        : "خطایی رخ داده است. دوباره تلاش کنید.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setRemovingId(null);
    }
  };

  // پخش آهنگ
  const handlePlay = (song: Song) => {
    const id = getSongId(song);
    const currentId = currentSong
      ? getSongId(currentSong)
      : "";

    if (currentId === id && isPlaying) {
      return;
    }

    playSong(song, playlistSongs);
  };

  const playingId = useMemo(
    () => (currentSong ? getSongId(currentSong) : ""),
    [currentSong]
  );

  // عدم ورود کاربر
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10">
          <FiLock size={34} />
        </div>

        <h2 className={`mt-6 text-xl font-extrabold ${primaryText}`}>
          پلی‌لیست شما منتظر شماست
        </h2>

        <p className={`mt-3 max-w-sm text-sm leading-7 ${mutedText}`}>
          برای مشاهده و مدیریت آهنگ‌های ذخیره‌شده، ابتدا وارد حساب کاربری خود شوید.
        </p>

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-blue-700 to-cyan-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5"
        >
          ورود به حساب
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
            <FiDisc size={16} />
            <span>مجموعه شخصی موسیقی</span>
          </div>

          <h2 className={`mt-3 text-2xl font-black sm:text-3xl ${primaryText}`}>
            پلی‌لیست من
          </h2>

          <p className={`mt-2 text-sm ${mutedText}`}>
            آهنگ‌هایی که ذخیره کرده‌ای، اینجا قرار می‌گیرند.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPlaylist}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition hover:border-blue-500 hover:text-blue-500 disabled:opacity-50 ${
            isDark
              ? "border-white/10 bg-white/[0.04] text-slate-300"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          <FiRefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          بروزرسانی
        </button>
      </section>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={`flex items-center gap-4 rounded-2xl border p-4 ${surface}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <FiMusic size={23} />
          </div>

          <div>
            <p className={`text-xs ${mutedText}`}>
              تعداد آهنگ‌های ذخیره‌شده
            </p>
            <p className={`mt-1 text-2xl font-black ${primaryText}`}>
              {playlistIds.length}
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-4 rounded-2xl border p-4 ${surface}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
            <FiDisc size={23} />
          </div>

          <div>
            <p className={`text-xs ${mutedText}`}>
              وضعیت مجموعه
            </p>
            <p className={`mt-1 text-sm font-bold ${primaryText}`}>
              {playlistIds.length > 0
                ? "در حال تکمیل"
                : "آماده افزودن آهنگ"}
            </p>
          </div>
        </div>
      </div>

      {/* Success */}
      {message && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500"
        >
          <FiCheckCircle size={19} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500"
        >
          <FiAlertCircle size={19} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Playlist songs */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className={`text-lg font-extrabold ${primaryText}`}>
              آهنگ‌های من
            </h3>
            <p className={`mt-1 text-xs ${mutedText}`}>
              فهرست آهنگ‌های ذخیره‌شده
            </p>
          </div>

          <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-500">
            {playlistIds.length} آهنگ
          </span>
        </div>

        {loading ? (
          <div className={`flex min-h-[220px] flex-col items-center justify-center rounded-2xl border ${surface}`}>
            <FiRefreshCw className="animate-spin text-blue-500" size={30} />
            <p className={`mt-4 text-sm ${mutedText}`}>
              در حال دریافت پلی‌لیست...
            </p>
          </div>
        ) : playlistIds.length === 0 ? (
          <div className={`flex min-h-[260px] flex-col items-center justify-center rounded-2xl border px-5 py-12 text-center ${surface}`}>
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500">
              <FiMusic size={36} />
            </div>

            <h3 className={`mt-5 text-lg font-extrabold ${primaryText}`}>
              پلی‌لیست هنوز خالی است
            </h3>

            <p className={`mt-2 max-w-sm text-sm leading-7 ${mutedText}`}>
              هنوز آهنگی ذخیره نکرده‌ای. یک آهنگ پخش کن و با دکمه + در نوار پخش پایین صفحه آن را به پلی‌لیست اضافه کن.
            </p>
          </div>
        ) : playlistSongs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {playlistSongs.map((song) => {
              const id = getSongId(song);

              return (
                <div
                  key={id}
                  className="relative min-w-0"
                >
                  <SongCard
                    song={song}
                    isPlaying={playingId === id && isPlaying}
                    onPlay={handlePlay}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveSong(id)}
                    disabled={removingId === id}
                    title="حذف از پلی‌لیست"
                    aria-label={`حذف آهنگ ${song.title}`}
                    className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-slate-950/80 text-red-400 backdrop-blur transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                  >
                    {removingId === id ? (
                      <FiRefreshCw className="animate-spin" size={16} />
                    ) : (
                      <FiTrash2 size={16} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`rounded-2xl border p-5 ${surface}`}>
            <p className={`text-sm ${mutedText}`}>
              شناسه آهنگ‌ها دریافت شد، اما اطلاعات آن‌ها از سرویس موسیقی پیدا نشد.
            </p>

            <div className="mt-4 space-y-2">
              {playlistIds.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 p-3"
                >
                  <span className={primaryText}>
                    آهنگ شماره {id}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveSong(id)}
                    disabled={removingId === id}
                    className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {removingId === id ? (
                      <FiRefreshCw className="animate-spin" size={17} />
                    ) : (
                      <FiTrash2 size={17} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
