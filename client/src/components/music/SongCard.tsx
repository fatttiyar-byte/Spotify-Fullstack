
import { motion } from "framer-motion";
import {
  FiPlay,
  FiPause,
  FiHeart,
  FiMusic,
  FiHeadphones,
} from "react-icons/fi";

import { useTheme } from "../../context/ThemeContext";

export interface Song {
  id?: string | number;
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
  play_count?: number;
}

interface SongCardProps {
  song: Song;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onPlay?: (song: Song) => void;
  onToggleFavorite?: (song: Song) => void;
}

const SongCard = ({
  song,
  isPlaying = false,
  isFavorite = false,
  onPlay,
  onToggleFavorite,
}: SongCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cover =
    song.thumbnail || song.cover || song.image || "";

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className={`
        group relative overflow-hidden rounded-2xl
        border p-3
        transition-all duration-300
        ${
          isDark
            ? "border-white/[0.08] bg-[#111a2b] shadow-lg shadow-black/10 hover:border-blue-400/30 hover:shadow-blue-500/10"
            : "border-slate-200 bg-white shadow-sm hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10"
        }
      `}
    >
      {/* Cover */}
      <div
        className={`relative aspect-square overflow-hidden rounded-xl ${
          isDark ? "bg-[#1c2940]" : "bg-slate-100"
        }`}
      >
        {cover ? (
          <img
            src={cover}
            alt={song.title}
            loading="lazy"
            className={`
              h-full w-full object-cover
              transition-transform duration-700
              group-hover:scale-110
              ${isPlaying ? "scale-105" : ""}
            `}
          />
        ) : (
          <div
            className={`
              flex h-full items-center justify-center
              ${
                isDark
                  ? "bg-gradient-to-br from-[#1b3150] to-[#101a2d] text-blue-400"
                  : "bg-gradient-to-br from-blue-100 to-slate-200 text-blue-500"
              }
            `}
          >
            <FiMusic size={46} />
          </div>
        )}

        {/* Image Overlay */}
        <div className="
          absolute inset-0
          bg-gradient-to-t from-black/65 via-black/10 to-black/10
          opacity-70 transition-opacity duration-300
          group-hover:opacity-100
        " />

        {/* Playing Indicator */}
        {isPlaying && (
          <div className="
            absolute right-3 top-3
            flex items-center gap-1.5
            rounded-full border border-white/20
            bg-black/45 px-3 py-1.5
            text-[10px] font-medium text-white
            backdrop-blur-md
          ">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            در حال پخش
          </div>
        )}

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(song)}
            aria-label={
              isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
            className="
              absolute left-3 top-3
              flex h-9 w-9 items-center justify-center
              rounded-full border border-white/20
              bg-black/40 text-white
              backdrop-blur-md
              transition-all duration-200
              hover:scale-110 hover:bg-black/60
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-blue-400
            "
          >
            <FiHeart
              size={17}
              className={
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-white"
              }
            />
          </button>
        )}

        {/* Play Button */}
        <button
          type="button"
          onClick={() => onPlay?.(song)}
          aria-label={isPlaying ? "Pause song" : "Play song"}
          className="
            absolute bottom-3 right-3
            flex h-12 w-12 items-center justify-center
            rounded-full border border-white/30
            bg-blue-500 text-white
            shadow-lg shadow-blue-500/30
            backdrop-blur-md
            transition-all duration-300
            hover:scale-110 hover:bg-blue-400
            sm:translate-y-3 sm:opacity-0
            sm:group-hover:translate-y-0
            sm:group-hover:opacity-100
            focus:translate-y-0 focus:opacity-100
          "
        >
          {isPlaying ? (
            <FiPause size={21} />
          ) : (
            <FiPlay size={21} className="translate-x-[-1px]" />
          )}
        </button>

        {/* Play Count */}
        {typeof song.play_count === "number" && (
          <div className="
            absolute bottom-3 left-3
            flex items-center gap-1.5
            rounded-full bg-black/45
            px-2.5 py-1.5 text-[10px]
            text-white backdrop-blur-md
          ">
            <FiHeadphones size={12} />
            {song.play_count.toLocaleString("fa-IR")}
          </div>
        )}
      </div>

      {/* Song Information */}
      <div className="flex min-w-0 items-center justify-between gap-2 px-1 pt-4">
        <div className="min-w-0 flex-1">
          <h3
            title={song.title}
            className={`
              truncate text-sm font-bold
              transition-colors duration-200
              ${
                isDark
                  ? "text-white group-hover:text-blue-400"
                  : "text-slate-800 group-hover:text-blue-600"
              }
            `}
          >
            {song.title}
          </h3>

          <p
            className={`mt-1.5 truncate text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {song.artist || "هنرمند ناشناس"}
          </p>
        </div>

        {/* Playing Animation */}
        {isPlaying && (
          <div className="flex h-7 shrink-0 items-end gap-0.5">
            <span className="h-2 w-1 animate-pulse rounded-full bg-blue-500" />
            <span className="h-5 w-1 animate-pulse rounded-full bg-cyan-400 [animation-delay:150ms]" />
            <span className="h-3 w-1 animate-pulse rounded-full bg-blue-500 [animation-delay:300ms]" />
            <span className="h-6 w-1 animate-pulse rounded-full bg-cyan-400 [animation-delay:100ms]" />
          </div>
        )}
      </div>

      {/* Bottom Accent */}
      <div className="
        absolute bottom-0 left-0 h-[2px] w-0
        bg-gradient-to-r from-blue-500 to-cyan-400
        transition-all duration-500
        group-hover:w-full
      " />
    </motion.article>
  );
};

export default SongCard;
