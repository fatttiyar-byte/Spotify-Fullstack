
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  FiDisc,
  FiRefreshCw,
  FiAlertCircle,
  FiMusic,
} from "react-icons/fi";

import AlbumCard, { type Album } from "../components/music/AlbumCard";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/authStore";

const API_URL = "http://localhost:5000/api/v1";

type AlbumWithDate = Album & {
  created_at?: string;
  createdAt?: string;
  release_date?: string;
  releaseDate?: string;
};

const extractAlbums = (response: any): AlbumWithDate[] => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.albums)) return data.albums;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.albums)) return data.data.albums;

  return [];
};

export default function NewAlbums() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const token = useAuthStore((state) => state.token);

  const [albums, setAlbums] = useState<AlbumWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/album/all`, {
        headers: token ? { token } : {},
      });

      const result = extractAlbums(response);

      const sortedAlbums = [...result].sort((a, b) => {
        const dateA = new Date(
          a.created_at ||
          a.createdAt ||
          a.release_date ||
          a.releaseDate ||
          0
        ).getTime();

        const dateB = new Date(
          b.created_at ||
          b.createdAt ||
          b.release_date ||
          b.releaseDate ||
          0
        ).getTime();

        return dateB - dateA;
      });

      setAlbums(sortedAlbums);
    } catch (err: any) {
      console.error("Fetch albums error:", err);

      setError(
        err.response?.data?.message ||
        "دریافت آلبوم‌ها با مشکل مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const surface = isDark
    ? "border-white/[0.08] bg-[#111d30] text-white"
    : "border-slate-200 bg-white text-slate-800 shadow-sm";

  const muted = isDark
    ? "text-slate-400"
    : "text-slate-500";

  return (
    <main
      dir="rtl"
      className={`min-h-[60vh] p-4 transition-colors duration-300 sm:p-6 lg:p-8 ${
        isDark
          ? "bg-[#080E1D] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20">
              <FiDisc size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                آلبوم‌های تازه
              </h1>

              <p className={`mt-1 text-sm ${muted}`}>
                جدیدترین آلبوم‌های دنیای موسیقی
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAlbums}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-500 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            بروزرسانی
          </button>
        </header>

        {/* Album Count */}
        <div
          className={`mb-7 flex items-center justify-between rounded-2xl border p-4 transition-colors duration-300 ${surface}`}
        >
          <div>
            <p className={`text-xs ${muted}`}>
              تعداد آلبوم‌ها
            </p>

            <p className="mt-1 text-2xl font-extrabold text-blue-500">
              {albums.length}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <FiMusic size={22} />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className={`animate-pulse rounded-2xl border p-3 ${surface}`}
              >
                <div className="aspect-square rounded-xl bg-slate-500/20" />

                <div className="mt-4 h-4 w-3/4 rounded bg-slate-500/20" />

                <div className="mt-2 h-3 w-1/2 rounded bg-slate-500/20" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className={`rounded-2xl border p-8 text-center ${surface}`}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <FiAlertCircle size={36} />
            </div>

            <h2 className="text-lg font-bold">
              دریافت آلبوم‌ها ناموفق بود
            </h2>

            <p className={`mt-2 text-sm ${muted}`}>
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAlbums}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              تلاش مجدد
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && albums.length === 0 && (
          <div
            className={`flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center ${surface}`}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500">
              <FiDisc size={38} />
            </div>

            <h2 className="mt-5 text-lg font-extrabold">
              هنوز آلبومی ثبت نشده است
            </h2>

            <p className={`mt-2 text-sm leading-7 ${muted}`}>
              بعد از اضافه شدن آلبوم‌های جدید، آن‌ها را اینجا مشاهده می‌کنی.
            </p>
          </div>
        )}

        {/* Albums Grid */}
        {!loading && !error && albums.length > 0 && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                جدیدترین آلبوم‌ها
              </h2>

              <span className={`text-xs ${muted}`}>
                {albums.length} آلبوم
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {albums.map((album, index) => {
                const albumId = album.id ?? album._id;

                return (
                  <div
                    key={albumId ?? index}
                    className="min-w-0 transition duration-300 hover:-translate-y-1"
                  >
                    <AlbumCard
                      album={album}
                      to={
                        albumId !== undefined
                          ? `/album/${albumId}`
                          : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
