import type { Request, Response } from "express";
import { sql } from "../config/db.js";
import { redisClient } from "../index.js";
import { Trycatch } from "../Trycatch.js";

const CACHE_KEY = "dashboard:stats";
const CACHE_TTL_SECONDS = 60;

export const getDashboardStats = Trycatch(async (_req: Request, res: Response): Promise<void> => {
  // تلاش برای خواندن از کش (خطای ردیس نباید داشبورد را از کار بیندازد)
  const cached = await redisClient.get(CACHE_KEY).catch(() => null);
  if (cached) {
    res.status(200).json(JSON.parse(cached));
    return;
  }

  // همه‌ی کوئری‌ها موازی اجرا می‌شوند
  const [counts, topAlbums, latestSongs] = await Promise.all([
    sql`
      SELECT
        (SELECT COUNT(*) FROM songs)::int AS total_songs,
        (SELECT COUNT(*) FROM albums)::int AS total_albums,
        (SELECT COUNT(*) FROM songs WHERE album_id IS NULL)::int AS songs_without_album,
        (SELECT COUNT(*) FROM songs WHERE created_at >= NOW() - INTERVAL '7 days')::int AS recent_songs,
        (SELECT COUNT(*) FROM albums WHERE created_at >= NOW() - INTERVAL '7 days')::int AS recent_albums
    `,
    sql`
      SELECT
        albums.id,
        albums.title,
        albums.thumbnail,
        COUNT(songs.id)::int AS song_count
      FROM albums
      LEFT JOIN songs ON songs.album_id = albums.id
      GROUP BY albums.id, albums.title, albums.thumbnail
      ORDER BY COUNT(songs.id) DESC, albums.id ASC
      LIMIT 5
    `,
    sql`
      SELECT id, title, description, thumbnail, audio, album_id, created_at
      FROM songs
      ORDER BY created_at DESC
      LIMIT 5
    `,
  ]);

  const c = counts[0];

  const payload = {
    success: true,
    statistics: {
      totalSongs: c?.total_songs ?? 0,
      totalAlbums: c?.total_albums ?? 0,
      songsWithoutAlbum: c?.songs_without_album ?? 0,
      recentSongs: c?.recent_songs ?? 0,
      recentAlbums: c?.recent_albums ?? 0,
    },
    topAlbums,
    latestSongs,
  };

  await redisClient.set(CACHE_KEY, JSON.stringify(payload), { EX: CACHE_TTL_SECONDS }).catch(() => {});

  res.status(200).json(payload);
});