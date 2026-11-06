
import type { AuthenticatedRequest } from "../middleware.js";
import { Trycatch } from "../Trycatch.js";
import { sql } from "../config/db.js";
import { redisClient } from "../index.js";

export const deleteAlbume = Trycatch(
  async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "شناسه آلبوم معتبر نیست.",
      });
      return;
    }

    const album = await sql`
      SELECT * FROM albums WHERE id = ${id}
    `;

    if (album.length === 0) {
      res.status(404).json({
        message: "آلبومی با این شناسه یافت نشد.",
      });
      return;
    }

    await sql`
      DELETE FROM songs WHERE album_id = ${id}
    `;

    await sql`
      DELETE FROM albums WHERE id = ${id}
    `;

    await Promise.all([
      redisClient.del("albums").catch(() => {}),
      redisClient.del("songs").catch(() => {}),
    ]);

    res.status(200).json({
      success: true,
      message: "آلبوم و آهنگ‌های مرتبط با آن حذف شدند.",
    });
  }
);
