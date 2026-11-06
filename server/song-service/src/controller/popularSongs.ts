
import { sql } from "../config/db.js";
import TryCatch from "../TryCatch.js";

export const getPopularSongs = TryCatch(async (req, res) => {
  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const songs = await sql`
    SELECT
      s.*,
      a.title AS album_title
    FROM songs s
    LEFT JOIN albums a ON s.album_id = a.id
    ORDER BY s.play_count DESC, s.id DESC
    LIMIT ${limit}
  `;

  res.status(200).json({
    success: true,
    total: songs.length,
    songs
  });
});
