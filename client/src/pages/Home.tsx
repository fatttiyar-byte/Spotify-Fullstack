
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import toast from "react-hot-toast";

import {
  FiMusic,
  FiHeadphones,
  FiLock,
  FiArrowLeft,
  FiUserPlus,
  FiStar,
  FiDisc,
} from "react-icons/fi";

import { musicApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../context/ThemeContext";
import {
  useMusicPlayer,
  type Song as PlayerSong,
} from "../context/MusicPlayerContext";

import SongCard from "../components/music/SongCard";
import AlbumCard, { type Album } from "../components/music/AlbumCard";

/* ---------------- Types ---------------- */

interface Song {
  id?: number | string;
  _id?: string;
  title: string;
  artist?: string;
  album_title?: string;
  thumbnail?: string;
  cover?: string;
  image?: string;
  src?: string;
  audio?: string;
  audio_url?: string;
  file_url?: string;
  url?: string;
  play_count?: number;
}

type SongsResponse =
  | Song[]
  | {
      success?: boolean;
      songs?: Song[];
      data?: Song[] | { songs?: Song[] };
    };

type AlbumsResponse =
  | Album[]
  | {
      success?: boolean;
      albums?: Album[];
      data?: Album[];
    };

/* ---------------- Helpers ---------------- */

const getSongId = (song: Song | PlayerSong) =>
  String(song.id ?? ("_id" in song ? song._id : "") ?? "");

const getAudioUrl = (song: Song) =>
  song.audio_url ??
  song.src ??
  song.audio ??
  song.file_url ??
  song.url ??
  "";

const getThumbnail = (song: Song) =>
  song.thumbnail ??
  song.cover ??
  song.image ??
  "";

/* ---------------- Response helpers ---------------- */

const extractSongs = (response: SongsResponse): Song[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.songs)) {
    return response.songs;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (
    response.data &&
    !Array.isArray(response.data) &&
    Array.isArray(response.data.songs)
  ) {
    return response.data.songs;
  }

  return [];
};

const extractAlbums = (response: AlbumsResponse): Album[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.albums)) {
    return response.albums;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/* ---------------- Convert API Song to Player Song ---------------- */

const toPlayerSong = (song: Song): PlayerSong | null => {
  const id = song.id ?? song._id;
  const audioUrl = getAudioUrl(song);

  if (id == null || !audioUrl) {
    return null;
  }

  return {
    id,
    title: song.title,
    artist: song.artist,
    album_title: song.album_title,
    thumbnail: getThumbnail(song),
    image: song.image,
    src: audioUrl,
    audio_url: audioUrl,
  };
};

/* ---------------- Animation tokens ---------------- */

const spring = {
  type: "spring",
  stiffness: 220,
  damping: 26,
} as const;

const wordStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const wordItem: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    rotateX: -40,
  },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 24,
    },
  },
};

/* ---------------- Counter ---------------- */

function Counter({ value }: { value: number }) {
  const mv = useMotionValue(0);

  const springed = useSpring(mv, {
    stiffness: 60,
    damping: 18,
  });

  const rounded = useTransform(springed, (v) =>
    Math.round(v)
  );

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  return <motion.span>{rounded}</motion.span>;
}

/* ---------------- Hero illustration ---------------- */

function HeroArt({ dark }: { dark: boolean }) {
  const bars = [
    25, 45, 70, 38, 90, 55, 75, 35, 95,
    50, 70, 30, 60, 85, 40, 65, 30,
  ];

  return (
    <div className="relative mx-auto flex h-[330px] w-full max-w-[520px] items-center justify-center sm:h-[410px] lg:h-[470px]">
      {/* Ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-64 w-64 rounded-full bg-blue-500/30 blur-[90px] sm:h-80 sm:w-80"
      />

      {/* Rotating vinyl */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute flex h-[220px] w-[220px] items-center justify-center rounded-full border-[5px] border-slate-700/50 bg-[repeating-radial-gradient(circle,#101827_0px,#101827_3px,#26364c_4px,#101827_6px)] shadow-2xl shadow-blue-950/50 sm:h-[290px] sm:w-[290px]"
      >
        <div className="absolute h-[95px] w-[95px] rounded-full border border-blue-400/40 bg-gradient-to-br from-blue-700 to-slate-950 shadow-inner sm:h-[120px] sm:w-[120px]" />
        <div className="z-10 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_15px_#22d3ee]" />
      </motion.div>

      {/* Headphones */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-5, 3, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute z-20 flex h-44 w-44 items-center justify-center rounded-[2.5rem] border border-blue-400/30 bg-gradient-to-br from-blue-500/20 via-slate-900/90 to-cyan-500/10 shadow-[0_25px_80px_rgba(0,100,255,0.25)] backdrop-blur-xl sm:h-56 sm:w-56"
      >
        <div className="absolute inset-4 rounded-[2rem] border border-white/10" />

        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[7px] border-blue-400/80 bg-gradient-to-br from-slate-800 to-slate-950 shadow-[0_0_35px_rgba(0,130,255,0.4)] sm:h-36 sm:w-36">
          <FiHeadphones className="text-5xl text-cyan-300 sm:text-6xl" />
        </div>

        <div className="absolute -right-2 top-12 h-14 w-5 rounded-full bg-gradient-to-b from-cyan-300 to-blue-600 shadow-lg shadow-blue-500/40 sm:h-16" />
        <div className="absolute -left-2 top-12 h-14 w-5 rounded-full bg-gradient-to-b from-blue-600 to-cyan-300 shadow-lg shadow-blue-500/40 sm:h-16" />
      </motion.div>

      {/* Floating brand card */}
      <motion.div
        animate={{ y: [0, -9, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute right-0 top-7 z-30 rounded-2xl border p-3 shadow-xl backdrop-blur-xl sm:right-2 sm:top-10 sm:p-4 ${
          dark
            ? "border-white/10 bg-slate-900/80"
            : "border-white bg-white/90 shadow-blue-900/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
            <FiMusic />
          </div>

          <div>
            <p className={`text-xs font-bold ${dark ? "text-white" : "text-slate-900"}`}>
              TopMusic
            </p>
            <p className="mt-1 text-[10px] text-blue-400">
              Feel the music
            </p>
          </div>
        </div>
      </motion.div>

      {/* Animated equalizer */}
      <motion.div
        animate={{ y: [0, 8, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute bottom-5 left-0 z-30 rounded-2xl border p-3 shadow-xl backdrop-blur-xl sm:bottom-10 sm:left-2 sm:p-4 ${
          dark
            ? "border-white/10 bg-slate-900/85"
            : "border-white bg-white/90"
        }`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span className={`text-[10px] font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}>
            NOW PLAYING
          </span>
        </div>

        <div className="flex h-9 items-center gap-[3px]">
          {bars.map((height, index) => (
            <motion.span
              key={index}
              animate={{ scaleY: [0.35, 1, 0.45, 0.8, 0.35] }}
              transition={{
                duration: 1.1 + (index % 4) * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.045,
              }}
              style={{ height: `${height}%` }}
              className="w-[3px] origin-center rounded-full bg-gradient-to-t from-blue-600 to-cyan-300 sm:w-1"
            />
          ))}
        </div>
      </motion.div>

      {/* Floating notes */}
      <motion.div
        animate={{ y: [0, -18, 0], rotate: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute left-10 top-12 text-3xl text-blue-400/80"
      >
        ♪
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-20 right-10 text-4xl text-cyan-400/80"
      >
        ♫
      </motion.div>
    </div>
  );
}

/* ---------------- Home ---------------- */

function Home() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const isAuthenticated = useAuthStore(
    (s) => s.isAuthenticated
  );

  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
  } = useMusicPlayer();

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);

  const [loading, setLoading] = useState(true);
  const [albumsLoading, setAlbumsLoading] = useState(true);

  // مهمان: ۱۰ آهنگ | عضو: ۳۰ آهنگ
  const songLimit = isAuthenticated ? 30 : 10;

  /* ---------- Fetch popular songs ---------- */

  useEffect(() => {
    let active = true;

    const fetchSongs = async () => {
      try {
        setLoading(true);

        const res = await musicApi.get<SongsResponse>(
          `/songs/popular?limit=${songLimit}`
        );

        if (!active) return;

        const list = extractSongs(res.data);

        console.log("TopMusic songs:", list);

        setSongs(list.slice(0, songLimit));
      } catch (error) {
        console.error("Home songs error:", error);

        if (active) {
          setSongs([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSongs();

    return () => {
      active = false;
    };
  }, [songLimit]);

  /* ---------- Fetch albums ---------- */

  useEffect(() => {
    let active = true;

    const fetchAlbums = async () => {
      try {
        setAlbumsLoading(true);

        const res = await musicApi.get<AlbumsResponse>(
          "/album/all"
        );

        if (!active) return;

        const list = extractAlbums(res.data);

        console.log("TopMusic albums:", list);

        setAlbums(list);
      } catch (error) {
        console.error("Home albums error:", error);

        if (active) {
          setAlbums([]);
        }
      } finally {
        if (active) {
          setAlbumsLoading(false);
        }
      }
    };

    fetchAlbums();

    return () => {
      active = false;
    };
  }, []);

  /* ---------- Global music playback ---------- */

  const handlePlay = (song: Song) => {
    const playerSong = toPlayerSong(song);

    if (!playerSong) {
      toast.error("آدرس فایل صوتی این آهنگ موجود نیست");
      return;
    }

    const songId = getSongId(song);

    const activeSongId = currentSong
      ? getSongId(currentSong)
      : "";

    // اگر همین آهنگ انتخاب شده، فقط پخش/توقف را تغییر بده
    if (activeSongId && activeSongId === songId) {
      togglePlay();
      return;
    }

    // ساخت صف پخش
    const playerQueue = songs
      .map(toPlayerSong)
      .filter(
        (item): item is PlayerSong => item !== null
      );

    playSong(playerSong, playerQueue);

    // ثبت تعداد پخش
    if (songId) {
      musicApi
        .post(`/songs/${songId}/play`)
        .catch((error) => {
          console.error("Play count error:", error);
        });
    }
  };

  /* ---------- Theme ---------- */

  const bg = dark
    ? "bg-[#070B14] text-white"
    : "bg-[#F4F6FB] text-[#0F172A]";

  const surface = dark
    ? "border-white/[0.06] bg-white/[0.03]"
    : "border-slate-200/80 bg-white";

  const titleWords: {
    text: string;
    gradient: boolean;
  }[] = [
    { text: "موسیقی", gradient: false },
    { text: "را", gradient: false },
    { text: "متفاوت", gradient: true },
    { text: "تجربه", gradient: false },
    { text: "کن.", gradient: false },
  ];

  return (
    <div
      dir="rtl"
      className={`relative min-h-screen overflow-x-hidden ${bg} transition-colors duration-300`}
    >
      {/* ---------- Animated background ---------- */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -top-40 right-1/4 h-[440px] w-[440px] rounded-full blur-[120px] ${
            dark ? "bg-blue-600/25" : "bg-blue-400/20"
          }`}
        />

        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 50, -30, 0],
            scale: [1, 0.95, 1.1, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full blur-[120px] ${
            dark ? "bg-cyan-500/20" : "bg-cyan-400/15"
          }`}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 pb-28 pt-6 sm:px-6">

        {/* ---------- Premium Hero ---------- */}

        <section className="relative mb-20 grid min-h-[470px] items-center gap-8 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
          {/* Hero text */}
          <div className="relative z-10 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold backdrop-blur-xl ${
                dark
                  ? "border-blue-400/20 bg-blue-500/[0.08] text-blue-300"
                  : "border-blue-200 bg-blue-50 text-blue-600"
              }`}
            >
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-cyan-400"
              />
              تجربه‌ای متفاوت از دنیای موسیقی
            </motion.div>

            <motion.h1
              variants={wordStagger}
              initial="hidden"
              animate="show"
              className="mt-7 max-w-2xl text-4xl font-black leading-[1.6] sm:text-5xl lg:text-[58px]"
            >
              {titleWords.map((word, i) => (
                <motion.span
                  key={i}
                  variants={wordItem}
                  className={`inline-block whitespace-pre ${
                    word.gradient
                      ? "bg-gradient-to-l from-blue-500 via-sky-400 to-cyan-300 bg-clip-text text-transparent"
                      : ""
                  }`}
                >
                  {word.text}
                  {i < titleWords.length - 1 ? " " : ""}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className={`mt-5 max-w-lg text-sm leading-8 sm:text-base ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              به دنیایی از آهنگ‌های محبوب، آلبوم‌های جذاب و پلی‌لیست‌های اختصاصی وارد شو. هر لحظه، موسیقی متناسب با حال‌وهوای تو منتظرته.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-l from-blue-600 to-sky-400 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition duration-300 hover:-translate-y-1 hover:shadow-blue-500/40"
                  >
                    <FiUserPlus className="text-lg" />
                    شروع رایگان
                    <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                  </Link>

                  <Link
                    to="/login"
                    className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition hover:-translate-y-1 ${
                      dark
                        ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    }`}
                  >
                    ورود به حساب
                  </Link>
                </>
              ) : (
                <Link
                  to="/profile"
                  className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-l from-blue-600 to-sky-400 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1"
                >
                  <FiHeadphones className="text-lg" />
                  ورود به دنیای موسیقی
                  <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                </Link>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-10 flex flex-wrap gap-8"
            >
              <div>
                <p className={`text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>
                  24/7
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  همراه موسیقی
                </p>
              </div>

              <div className={`w-px ${dark ? "bg-white/10" : "bg-slate-200"}`} />

              <div>
                <p className={`text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>
                  HD
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  تجربه شنیداری
                </p>
              </div>

              <div className={`w-px ${dark ? "bg-white/10" : "bg-slate-200"}`} />

              <div>
                <p className="text-2xl font-black text-blue-500">∞</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  لحظه‌های موسیقی
                </p>
              </div>
            </motion.div>
          </div>

          {/* Hero visual */}
          <div className="relative order-1 lg:order-2">
            <HeroArt dark={dark} />
          </div>
        </section>

        {/* ---------- Albums ---------- */}

        <section className="mb-14">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-cyan-400" />

                <h2 className="text-xl font-black sm:text-2xl">
                  آلبوم‌های موسیقی
                </h2>
              </div>

              <p className="text-xs text-slate-500">
                مجموعه‌ای از آلبوم‌های منتخب
              </p>
            </div>

            <span
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-bold ${surface}`}
            >
              <FiDisc className="text-blue-500" />
              {albums.length} آلبوم
            </span>
          </div>

          {albumsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border p-2.5 ${surface}`}
                >
                  <div
                    className={`aspect-square animate-pulse rounded-xl ${
                      dark ? "bg-white/[0.05]" : "bg-slate-100"
                    }`}
                  />

                  <div
                    className={`mt-3 h-3 w-3/4 animate-pulse rounded ${
                      dark ? "bg-white/[0.05]" : "bg-slate-100"
                    }`}
                  />

                  <div
                    className={`mt-2 h-2.5 w-1/2 animate-pulse rounded ${
                      dark ? "bg-white/[0.05]" : "bg-slate-100"
                    }`}
                  />
                </div>
              ))}
            </div>
          ) : albums.length === 0 ? (
            <div className={`rounded-2xl border p-8 text-center ${surface}`}>
              <FiDisc className="mx-auto mb-3 text-3xl text-slate-400" />

              <p className="text-sm font-bold">
                آلبومی موجود نیست
              </p>

              <p className="mt-1 text-xs text-slate-500">
                هنوز آلبومی به کتابخانه اضافه نشده است.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {albums.map((album, index) => {
                const albumId = album.id ?? album._id;

                return (
                  <motion.div
                    key={albumId ?? index}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...spring,
                      delay: Math.min(index * 0.05, 0.3),
                    }}
                  >
                    <AlbumCard
                      album={album}
                      to={
                        albumId != null
                          ? `/album/${albumId}`
                          : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ---------- Popular heading ---------- */}

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <motion.span
                animate={{ scaleY: [1, 1.4, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-cyan-400"
              />

              <h2 className="text-xl font-black sm:text-2xl">
                آهنگ‌های پرطرفدار
              </h2>
            </div>

            <p className="text-xs text-slate-500">
              <Counter value={songs.length} /> آهنگ ·{" "}
              {isAuthenticated
                ? "دسترسی ویژه اعضا"
                : "دسترسی رایگان"}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-bold ${surface}`}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-blue-500"
            >
              <FiStar />
            </motion.span>

            {isAuthenticated
              ? "دسترسی ویژه اعضا"
              : "دسترسی رایگان"}
          </motion.div>
        </div>

        {/* ---------- Songs grid ---------- */}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-2.5 ${surface}`}
              >
                <div
                  className={`aspect-square animate-pulse rounded-xl ${
                    dark ? "bg-white/[0.04]" : "bg-slate-100"
                  }`}
                />

                <div
                  className={`mt-3 h-3 w-3/4 animate-pulse rounded ${
                    dark ? "bg-white/[0.04]" : "bg-slate-100"
                  }`}
                />

                <div
                  className={`mt-2 h-2.5 w-1/2 animate-pulse rounded ${
                    dark ? "bg-white/[0.03]" : "bg-slate-100"
                  }`}
                />
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-14 text-center ${surface}`}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mx-auto mb-3 w-fit text-3xl text-slate-400"
            >
              <FiMusic />
            </motion.div>

            <p className="text-sm font-bold">
              آهنگی موجود نیست
            </p>

            <p className="mt-1 text-xs text-slate-500">
              به‌زودی آهنگ‌های تازه اضافه می‌شوند.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {songs.map((song, index) => {
              const id = getSongId(song);

              const active =
                !!currentSong &&
                getSongId(currentSong) === id &&
                isPlaying;

              return (
                <SongCard
                  key={id || index}
                  song={song}
                  isPlaying={active}
                  onPlay={() => handlePlay(song)}
                />
              );
            })}
          </motion.div>
        )}

        {/* ---------- Registration gate ---------- */}

        {!isAuthenticated ? (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={spring}
            className={`relative mt-14 overflow-hidden rounded-2xl border p-6 sm:p-8 ${surface}`}
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-[80px]" />

            <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-right">
              <motion.div
                animate={{
                  rotate: [0, -8, 8, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-blue-500"
              >
                <FiLock />
              </motion.div>

              <div className="flex-1">
                <h3 className="text-base font-black sm:text-lg">
                  موسیقی بیشتری کشف کن
                </h3>

                <p className="mt-1.5 text-xs leading-6 text-slate-500">
                  ۱۰ آهنگ اول برای همه آزاد است. با یک حساب
                  رایگان به ۳۰ آهنگ و امکانات اعضا دسترسی داشته
                  باش.
                </p>
              </div>

              <Link
                to="/register"
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-l from-blue-500 to-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40"
              >
                ثبت‌نام رایگان
                <FiArrowLeft className="transition group-hover:-translate-x-1" />
              </Link>
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={spring}
            className={`mt-14 flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${surface}`}
          >
            <div>
              <h3 className="text-sm font-bold">
                به جمع اعضای TopMusic خوش آمدی
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                حالا آهنگ‌های بیشتری در دسترس توست.
              </p>
            </div>

            <Link
              to="/profile"
              className="group inline-flex items-center gap-2 text-xs font-bold text-blue-500 hover:text-blue-400"
            >
              حساب کاربری
              <FiArrowLeft className="transition group-hover:-translate-x-1" />
            </Link>
          </motion.section>
        )}
      </div>
    </div>
  );
}

export default Home;
