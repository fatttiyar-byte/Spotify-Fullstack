import type { AuthenticatedRequest } from "../middleware.js";
import { Trycatch } from "../Trycatch.js";
import { sql } from "../config/db.js";

export const getSongById = Trycatch(
  async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "شناسه آهنگ معتبر نیست.",
      });
      return;
    }

    const result = await sql`
      SELECT *
      FROM songs
      WHERE id = ${id}
    `;

    if (result.length === 0) {
      res.status(404).json({
        message: "آهنگی با این شناسه پیدا نشد.",
      });
      return;
    }

    res.status(200).json({
      song: result[0],
    });
  }
);