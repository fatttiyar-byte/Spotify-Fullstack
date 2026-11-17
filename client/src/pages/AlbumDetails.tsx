
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FiArrowRight,
  FiDisc,
  FiMusic,
  FiPlay,
  FiLoader,
  FiHeadphones,
} from "react-icons/fi";

import toast from "react-hot-toast";

import SongCard, {
  type Song,
} from "../components/music/SongCard";

import { useMusicPlayer } from "../context/MusicPlayerContext";
import { useTheme } from "../context/ThemeContext";
import { musicApi } from "../services/api";

import {
  addToHistory,
  getFavorites,
  isFavorite,
  toggleFavorite,
} from "../utils/musicStorage";

interface Album {
  id?: string | number;
  _id?: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  cover?: string;
  image?: string;
  song_count?: number;
  songsCount?: number;
  songs?: Song[];
}

function extractSongs(data: any): Song[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.songs)) return data.songs;
  if (Array.isArray(data?.data?.songs)) return data.data.songs;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function extractAlbum(data: any): Album | null {
  const album =
    data?.album ??
    data?.data?.album ??
    data?.data ??
    data;

  if (
    album &&
    !Array.isArray(album) &&
    typeof album === "object" &&
    album.title
  ) {
    return album as Album;
  }

  return null;
}

function getSongId(song: Song | null | undefined): string {
  return String(song?.id ?? song?._id ?? "");
}

export default function AlbumDetails() {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [album, setAlbum] = useState<Album | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    getFavorites()
      .map((song) => getSongId(song))
      .filter(Boolean)
  );

  const {
    playSong,
    togglePlay,
    currentSong,
    isPlaying,
  } = useMusicPlayer();

  // دریافت اطلاعات آلبوم
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadAlbum = async () => {
      try {
        setLoading(true);

        const [albumResponse, albumsResponse] =
          await Promise.allSettled([
            musicApi.get(`/album/${id}`),
            musicApi.get("/album/all"),
          ]);

        let albumData: Album | null = null;
        let albumSongs: Song[] = [];

        if (albumResponse.status === "fulfilled") {
          const data = albumResponse.value.data;

          albumData = extractAlbum(data);
          albumSongs = extractSongs(data);

          if (albumData?.songs?.length) {
            albumSongs = albumData.songs;
          }
        }

        if (albumsResponse.status === "fulfilled") {
          const allAlbums = extractSongs({
            data: albumsResponse.value.data,
          }) as unknown as Album[];

          const foundAlbum = allAlbums.find(
            (item) =>
              String(item.id ?? item._id) === String(id)
          );

          if (foundAlbum) {
            albumData = {
              ...foundAlbum,
              ...albumData,
            };
          }
        }

        if (!albumData && albumSongs.length === 0) {
          throw new Error("Album not found");
        }

        setAlbum(albumData);
        setSongs(albumSongs);
      } catch (error) {
        console.error("Album details error:", error);
        toast.error("دریافت اطلاعات آلبوم با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    loadAlbum();
  }, [id]);

  // پخش آهنگ
  const handlePlay = (song: Song) => {
    const selectedId = getSongId(song);
    const currentId = getSongId(currentSong);

    if (selectedId && selectedId === currentId) {
      togglePlay();
      return;
    }

    addToHistory(song);
    playSong(song, songs);
  };

  // پخش کل آلبوم
  const handlePlayAll = () => {
    if (!songs.length) {
      toast.error("این آلبوم هنوز آهنگی ندارد.");
      return;
    }

    const firstSong = songs[0];

    addToHistory(firstSong);
    playSong(firstSong, songs);

    toast.success("آلبوم در حال پخش است.");
  };

  // علاقه‌مندی‌ها
  const handleFavorite = (song: Song) => {
    const wasFavorite = isFavorite(song);
    const updated = toggleFavorite(song);

    setFavoriteIds(
      updated
        .map((item) => getSongId(item))
        .filter(Boolean)
    );

    toast.success(
      wasFavorite
        ? "از علاقه‌مندی‌ها حذف شد."
        : "به علاقه‌مندی‌ها اضافه شد."
    );
  };

  const currentSongId = getSongId(currentSong);

  const cover =
    album?.thumbnail ||
    album?.cover ||
    album?.image ||
    "";

  // Loading
  if (loading) {
    return (
      <main
        dir="rtl"
        className={`flex min-h-[70vh] items-center justify-center ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        <div className="text-center">
          <FiLoader
            className="mx-auto animate-spin text-blue-500"
            size={42}
          />
          <p
            className={`mt-4 text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            در حال دریافت اطلاعات آلبوم...
          </p>
        </div>
      </main>
    );
  }

  // Album not found
  if (!album) {
    return (
      <main
        dir="rtl"
        className={`px-4 py-16 text-center ${
          isDark ? "text-white" : "text-slate-900"
        }`}
      >
        <FiDisc
          className="mx-auto mb-4 text-blue-500"
          size={56}
        />

        <h2 className="text-xl font-black">
          آلبوم موردنظر پیدا نشد.
        </h2>

        <Link
          to="/newalbum"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <FiArrowRight />
          بازگشت به آلبوم‌ها
        </Link>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className={`min-h-screen overflow-hidden px-4 py-7 transition-colors duration-300 sm:px-6 sm:py-10 lg:px-8 ${
        isDark
          ? "bg-[#080d18] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl">

        {/* Back Button */}
        <Link
          to="/newalbum"
          className={`mb-8 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:border-blue-400 hover:text-blue-500 ${
            isDark
              ? "border-white/10 bg-[#111a2b] text-slate-300"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          <FiArrowRight size={17} />
          بازگشت به آلبوم‌ها
        </Link>

        {/* Album Hero */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`relative isolate overflow-hidden rounded-[2rem] border p-6 shadow-xl sm:p-9 lg:p-12 ${
            isDark
              ? "border-blue-400/10 bg-gradient-to-br from-[#101d35] via-[#111a2b] to-[#0c2638] shadow-blue-500/5"
              : "border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-blue-500/5"
          }`}
        >
          {/* Background Decoration */}
          <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-9 md:flex-row md:gap-12">

            {/* Circular Album Cover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.15,
                type: "spring",
              }}
              className="relative shrink-0"
            >
              <div className="absolute -inset-4 rounded-full border border-blue-400/20" />

              <div className="absolute -inset-2 rounded-full border-2 border-dashed border-blue-400/40" />

              <div
                className={`relative h-52 w-52 overflow-hidden rounded-full border-[6px] shadow-2xl shadow-blue-500/25 sm:h-64 sm:w-64 lg:h-72 lg:w-72 ${
                  isDark
                    ? "border-[#243a59] bg-[#1c2940]"
                    : "border-white bg-slate-100"
                }`}
              >
                {cover ? (
                  <img
                    src={cover}
                    alt={album.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-blue-500">
                    <FiDisc size={90} />
                  </div>
                )}

                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-950/20 to-transparent" />
              </div>

              <div
                className={`absolute bottom-3 right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 bg-blue-600 text-white shadow-lg ${
                  isDark
                    ? "border-[#17263c]"
                    : "border-white"
                }`}
              >
                <FiMusic size={18} />
              </div>
            </motion.div>

            {/* Album Information */}
            <div className="min-w-0 flex-1 text-center md:text-right">

              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black tracking-wider ${
                  isDark
                    ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                    : "border-blue-200 bg-blue-100/70 text-blue-700"
                }`}
              >
                <FiDisc size={15} />
                ALBUM DETAILS
              </div>

              <motion.h1
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="break-words text-3xl font-black leading-tight sm:text-4xl lg:text-5xl"
              >
                {album.title}
              </motion.h1>

              <p
                className={`mt-4 text-sm font-medium sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {album.artist || "Unknown artist"}
              </p>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <div
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-slate-200 bg-white/80 text-slate-600"
                  }`}
                >
                  <FiMusic className="text-blue-500" size={18} />
                  {songs.length} آهنگ
                </div>

                <div
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-slate-200 bg-white/80 text-slate-600"
                  }`}
                >
                  <FiHeadphones className="text-cyan-500" size={18} />
                  آلبوم موسیقی
                </div>
              </div>

              {/* Play All */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handlePlayAll}
                disabled={songs.length === 0}
                className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-500/25 transition hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 sm:px-9 sm:py-4"
              >
                <FiPlay size={19} />
                پخش کل آلبوم
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* Songs Section */}
        <section className="mt-12">

          {/* Section Heading */}
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isDark
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <FiMusic size={20} />
                </div>

                <h2 className="text-xl font-black sm:text-2xl">
                  آهنگ‌های آلبوم
                </h2>
              </div>

              <p
                className={`mt-2 pr-12 text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                آهنگ‌های موجود در این مجموعه
              </p>
            </div>

            <span
              className={`rounded-full border px-4 py-2 text-xs font-bold ${
                isDark
                  ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                  : "border-blue-200 bg-blue-50 text-blue-600"
              }`}
            >
              {songs.length} آهنگ
            </span>
          </div>

          {/* Songs Grid */}
          {songs.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.07,
                  },
                },
              }}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5"
            >
              {songs.map((song, index) => {
                const songId =
                  getSongId(song) || String(index);

                const playing =
                  currentSongId !== "" &&
                  currentSongId === getSongId(song) &&
                  isPlaying;

                return (
                  <motion.div
                    key={songId}
                    variants={{
                      hidden: {
                        opacity: 0,
                        y: 20,
                      },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: 0.35,
                        },
                      },
                    }}
                    className="min-w-0"
                  >
                    <SongCard
                      song={song}
                      isPlaying={playing}
                      isFavorite={favoriteIds.includes(songId)}
                      onPlay={handlePlay}
                      onToggleFavorite={handleFavorite}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div
              className={`rounded-3xl border border-dashed px-5 py-20 text-center ${
                isDark
                  ? "border-blue-400/20 bg-blue-500/5"
                  : "border-blue-300/60 bg-blue-50/40"
              }`}
            >
              <div
                className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
                  isDark
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-blue-100 text-blue-500"
                }`}
              >
                <FiMusic size={30} />
              </div>

              <h3 className="text-lg font-bold">
                هنوز آهنگی برای این آلبوم ثبت نشده است.
              </h3>

              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                بعداً برای شنیدن آهنگ‌های این آلبوم مراجعه کنید.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
