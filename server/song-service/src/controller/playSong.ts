
import { sql } from "../config/db.js";
import TryCatch from "../TryCatch.js";

export const playSong = TryCatch(async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({
      message: "شناسه آهنگ نامعتبر است."
    });
    return;
  }

  // افزایش اتمیک تعداد پخش آهنگ
  const result = await sql`
  
    UPDATE songs
    SET play_count = play_count + 1
    WHERE id = ${id}
    RETURNING id, title, play_count
  `;

  if (result.length === 0) {
    res.status(404).json({
      message: "آهنگ موردنظر پیدا نشد."
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "تعداد پخش آهنگ ثبت شد.",
    song: result[0]
  });
});
