
import type { AuthenticatedRequest } from "../middleware.js";
import { Trycatch } from "../Trycatch.js";
import cloudinary from "../config/cloudinary.js";
import { getBuffer } from "../config/dataUri.js";
import { sql } from "../config/db.js";

export const addSong = Trycatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== "admin") {
        res.status(403).json({
            message: "شما دسترسی ادمین ندارید."
        });
        return;
    }

    const { title, description, album } = req.body;

    if (!title || !description || !album) {
        res.status(400).json({
            message: "عنوان، توضیحات و شناسه آلبوم الزامی هستند."
        });
        return;
    }

    const isAlbum = await sql`
        SELECT id FROM albums WHERE id = ${Number(album)}
    `;

    if (isAlbum.length === 0) {
        res.status(404).json({
            message: "آلبوم مورد نظر یافت نشد."
        });
        return;
    }

    const file = req.file;

    if (!file) {
        res.status(400).json({
            message: "فایل آهنگ ارسال نشده است."
        });
        return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer) {
        res.status(500).json({
            message: "ساخت بافر فایل ناموفق بود."
        });
        return;
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer, {
        folder: "songs",
        resource_type: "video"
    });

    if (!cloud.secure_url) {
        res.status(500).json({
            message: "آدرس فایل در Cloudinary دریافت نشد."
        });
        return;
    }

    const result = await sql`
        INSERT INTO songs (title, description, album_id, audio)
        VALUES (
            ${title},
            ${description},
            ${Number(album)},
            ${cloud.secure_url}
        )
        RETURNING *
    `;

    res.status(201).json({
        message: "آهنگ با موفقیت ساخته شد.",
        song: result[0]
    });
});
