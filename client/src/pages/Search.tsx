
import { useEffect, useState, type ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiPlay,
  FiMusic,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

import { useTheme } from "../context/ThemeContext";
import {
  useMusicPlayer,
  type Song,
} from "../context/MusicPlayerContext";

const API = "http://localhost:5000/api/v1";

interface SearchResponse {
  success: boolean;
  songs: Song[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const Search = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { playSong } = useMusicPlayer();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // هماهنگ‌کردن عبارت جستجو با URL
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
  }, [searchParams]);

  // جستجوی داینامیک با Debounce
  useEffect(() => {
    const searchValue = query.trim();

    if (!searchValue) {
      setSongs([]);
      setTotal(0);
      setTotalPages(0);
      setError("");
      setLoading(false);
      setHasSearched(false);

      if (searchParams.has("q")) {
        setSearchParams({}, { replace: true });
      }

      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      setHasSearched(true);

      setSearchParams(
        { q: searchValue },
        { replace: true }
      );

      try {
        const response = await axios.get<SearchResponse>(
          `${API}/songs/search`,
          {
            params: {
              q: searchValue,
              page,
              limit: 12,
              sortBy: "created_at",
              order: "desc",
            },
            signal: controller.signal,
          }
        );

        const result = response.data;

        setSongs(Array.isArray(result.songs) ? result.songs : []);
        setTotal(result.pagination?.total ?? 0);
        setTotalPages(result.pagination?.totalPages ?? 0);
      } catch (err) {
        if (axios.isCancel(err)) return;

        console.error("Search error:", err);

        setSongs([]);
        setTotal(0);
        setTotalPages(0);
        setError(
          "دریافت نتایج جستجو با مشکل مواجه شد. اتصال بک‌اند را بررسی کن."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, page]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const handlePlay = (song: Song) => {
    const normalizedSong: Song = {
      ...song,
      id: song.id ?? song._id,
      src:
        song.src ||
        song.audio ||
        song.audio_url ||
        song.file_url,
    };

    playSong(normalizedSong, songs);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getThumbnail = (song: Song) => {
    return (
      song.thumbnail ||
      song.cover ||
      song.image ||
      ""
    );
  };

  return (
    <div
      className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isDark
          ? "bg-[#080d18] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-500">
              <FiSearch size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                جستجوی موسیقی
              </h1>

              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                آهنگ مورد علاقه‌ات را در TopMusic پیدا کن
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative mb-8 overflow-hidden rounded-2xl border transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 ${
            isDark
              ? "border-white/10 bg-[#111a2b]"
              : "border-slate-200 bg-white"
          }`}
        >
          <FiSearch
            className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-500"
            size={22}
          />

          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="نام آهنگ، توضیحات یا آلبوم را جستجو کن..."
            className={`w-full bg-transparent py-5 pr-14 pl-14 text-sm outline-none sm:text-base ${
              isDark
                ? "text-white placeholder:text-gray-500"
                : "text-slate-900 placeholder:text-gray-400"
            }`}
          />

          {loading && (
            <FiLoader
              className="absolute left-5 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
              size={21}
            />
          )}
        </motion.div>

        {/* Results Header */}
        {hasSearched && !error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                نتایج جستجو
              </h2>

              {!loading && (
                <p
                  className={`mt-1 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {total} نتیجه برای «{query.trim()}»
                </p>
              )}
            </div>

            <span className="rounded-full bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-500">
              {total} آهنگ
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4">
            <FiLoader
              className="animate-spin text-blue-500"
              size={36}
            />

            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              در حال جستجوی آهنگ‌ها...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <FiAlertCircle size={40} className="text-red-500" />

            <p className="max-w-lg text-sm text-red-500">
              {error}
            </p>
          </div>
        )}

        {/* Empty Search */}
        {!loading && !error && !hasSearched && (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-500">
              <FiMusic size={38} />
            </div>

            <h2 className="mb-2 text-xl font-bold">
              دنبال چه آهنگی هستی؟
            </h2>

            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              برای شروع، نام آهنگ یا آلبوم را جستجو کن.
            </p>
          </div>
        )}

        {/* No Results */}
        {!loading &&
          !error &&
          hasSearched &&
          songs.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <FiSearch
                size={42}
                className={`mb-4 ${
                  isDark ? "text-gray-600" : "text-gray-300"
                }`}
              />

              <h3 className="mb-2 text-lg font-bold">
                نتیجه‌ای پیدا نشد!
              </h3>

              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                عبارت دیگری را امتحان کن.
              </p>
            </div>
          )}

        {/* Songs Grid */}
        {!loading && !error && songs.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {songs.map((song, index) => {
              const thumbnail = getThumbnail(song);

              return (
                <motion.div
                  layout
                  key={song.id ?? song._id ?? index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.04, 0.3),
                  }}
                  className={`group flex items-center gap-4 overflow-hidden rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5 ${
                    isDark
                      ? "border-white/10 bg-[#111a2b]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-blue-500/10">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={song.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-blue-500">
                        <FiMusic size={30} />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePlay(song)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-label={`پخش ${song.title}`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 shadow-lg">
                        <FiPlay size={19} />
                      </span>
                    </button>
                  </div>

                  {/* Song Info */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate text-sm font-bold"
                      title={song.title}
                    >
                      {song.title}
                    </h3>

                    <p
                      className={`mt-2 truncate text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {song.artist ||
                        song.album_title ||
                        "هنرمند نامشخص"}
                    </p>

                    {song.album_title && (
                      <p className="mt-1 truncate text-[11px] text-blue-500">
                        {song.album_title}
                      </p>
                    )}
                  </div>

                
                
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronRight size={22} />
            </button>

            <span className="text-sm">
              صفحه{" "}
              <strong className="text-blue-500">{page}</strong>
              {" "}از{" "}
              <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronLeft size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
