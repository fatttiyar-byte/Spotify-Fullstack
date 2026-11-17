
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiDisc,
  FiMusic,
  FiPlay,
} from "react-icons/fi";

import { useTheme } from "../../context/ThemeContext";

export interface Album {
  id?: string | number;
  _id?: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  cover?: string;
  image?: string;
  song_count?: number;
  songsCount?: number;
}

interface AlbumCardProps {
  album: Album;
  onPlay?: (album: Album) => void;
  to?: string;
}

const AlbumCard = ({
  album,
  onPlay,
  to,
}: AlbumCardProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cover =
    album.thumbnail || album.cover || album.image || "";

  const songCount = album.song_count ?? album.songsCount;

  const albumId = album.id ?? album._id;

  const albumPath =
    to ||
    (albumId !== undefined
      ? `/album/${albumId}`
      : "#");

  const content = (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22 }}
      className={`
        group relative overflow-hidden rounded-2xl
        border p-3
        transition-all duration-300
        ${
          isDark
            ? "border-white/[0.08] bg-[#111a2b] shadow-lg shadow-black/10 hover:border-blue-400/30 hover:shadow-blue-500/10"
            : "border-slate-200 bg-white shadow-sm hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/10"
        }
      `}
    >
      {/* Album Cover */}
      <div
        className={`
          relative aspect-square overflow-hidden rounded-xl
          ${isDark ? "bg-[#1c2940]" : "bg-slate-100"}
        `}
      >
        {cover ? (
          <img
            src={cover}
            alt={album.title}
            loading="lazy"
            className="
              h-full w-full object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
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
            <FiDisc size={48} />
          </div>
        )}

        {/* Image Overlay */}
        <div
          className="
            absolute inset-0
            bg-black/0
            transition-colors duration-300
            group-hover:bg-black/35
          "
        />

        {/* Play Album Button */}
        {onPlay && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onPlay(album);
            }}
            aria-label={`Play ${album.title}`}
            className="
              absolute bottom-3 right-3
              flex h-11 w-11 items-center justify-center
              rounded-full border border-white/20
              bg-blue-500 text-white
              shadow-lg shadow-blue-500/30
              transition-all duration-300
              hover:scale-110 hover:bg-blue-600
              sm:translate-y-2 sm:opacity-0
              sm:group-hover:translate-y-0
              sm:group-hover:opacity-100
              focus:translate-y-0 focus:opacity-100
            "
          >
            <FiPlay size={19} />
          </button>
        )}
      </div>

      {/* Album Information */}
      <div className="min-w-0 pt-3">
        <h3
          title={album.title}
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
          {album.title}
        </h3>

        <p
          className={`
            mt-1 truncate text-xs
            ${isDark ? "text-slate-400" : "text-slate-500"}
          `}
        >
          {album.artist || "Unknown artist"}
        </p>

        {/* Song Count */}
        <div
          className={`
            mt-3 flex items-center gap-1.5 text-xs
            ${isDark ? "text-slate-400" : "text-slate-500"}
          `}
        >
          <FiMusic size={14} className="text-blue-500" />

          <span>
            {songCount !== undefined
              ? `${songCount} songs`
              : "Album"}
          </span>
        </div>
      </div>

      {/* Bottom Accent */}
      <div
        className="
          absolute bottom-0 left-0 h-[2px] w-0
          bg-gradient-to-r from-blue-500 to-cyan-400
          transition-all duration-500
          group-hover:w-full
        "
      />
    </motion.article>
  );

  // اگر شناسه آلبوم وجود نداشت، لینک نساز
  if (albumId === undefined && !to) {
    return (
      <div className="block min-w-0">
        {content}
      </div>
    );
  }

  return (
    <Link
      to={albumPath}
      className="block min-w-0"
      aria-label={`View ${album.title} album`}
    >
      {content}
    </Link>
  );
};

export default AlbumCard;
