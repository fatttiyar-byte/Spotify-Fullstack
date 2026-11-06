
import { sql } from "../config/db.js";
import TryCatch from "../TryCatch.js";

export const searchSongs = TryCatch(async (req, res) => {
  // دریافت پارامترهای جستجو
  const q = String(req.query.q ?? "").trim();

  const albumId = req.query.albumId
    ? Number(req.query.albumId)
    : undefined;

  // صفحه‌بندی
  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.min(
    50,
    Math.max(1, Number(req.query.limit) || 10)
  );

  const offset = (page - 1) * limit;

  // اعتبارسنجی شناسه آلبوم
  if (
    albumId !== undefined &&
    (!Number.isInteger(albumId) || albumId <= 0)
  ) {
    res.status(400).json({
      message: "شناسه آلبوم نامعتبر است."
    });
    return;
  }

  // دریافت اطلاعات مرتب‌سازی
  const sortBy = String(req.query.sortBy ?? "created_at");
  const order = String(req.query.order ?? "desc").toLowerCase();

  // ستون‌های مجاز برای مرتب‌سازی
  const sortColumns = {
    title: sql`s.title`,
    created_at: sql`s.created_at`,
    id: sql`s.id`
  };

  if (!(sortBy in sortColumns)) {
    res.status(400).json({
      message: "فیلد مرتب‌سازی نامعتبر است."
    });
    return;
  }

  if (!["asc", "desc"].includes(order)) {
    res.status(400).json({
      message: "ترتیب مرتب‌سازی باید asc یا desc باشد."
    });
    return;
  }

  const sortColumn =
    sortColumns[sortBy as keyof typeof sortColumns];

  const sortOrder = order === "asc"
    ? sql`ASC`
    : sql`DESC`;

  const searchTerm = `%${q}%`;

  // جستجو و فیلتر آهنگ‌ها
  const songs = await sql`
    SELECT
      s.*,
      a.title AS album_title,
      a.thumbnail AS album_thumbnail
    FROM songs s
    LEFT JOIN albums a ON s.album_id = a.id
    WHERE
      (
        ${q === ""}
        OR s.title ILIKE ${searchTerm}
        OR s.description ILIKE ${searchTerm}
        OR a.title ILIKE ${searchTerm}
      )
      AND (
        ${albumId === undefined}
        OR s.album_id = ${albumId ?? null}
      )
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  // شمارش کل نتایج
  const countResult = await sql`
    SELECT COUNT(*) AS total
    FROM songs s
    LEFT JOIN albums a ON s.album_id = a.id
    WHERE
      (
        ${q === ""}
        OR s.title ILIKE ${searchTerm}
        OR s.description ILIKE ${searchTerm}
        OR a.title ILIKE ${searchTerm}
      )
      AND (
        ${albumId === undefined}
        OR s.album_id = ${albumId ?? null}
      )
  `;

  const total = Number(countResult[0]?.total ?? 0);

  // پاسخ نهایی
  res.status(200).json({
    success: true,
    filters: {
      q,
      albumId: albumId ?? null,
      sortBy,
      order
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    songs
  });
});
