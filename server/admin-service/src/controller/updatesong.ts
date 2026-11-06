
import type { AuthenticatedRequest } from "../middleware.js";
import { Trycatch } from "../Trycatch.js";
import { v2 as cloudinary } from "cloudinary";
import { getBuffer } from "../config/dataUri.js";
import { sql } from "../config/db.js";
import type { Response } from "express";

export const updateSong = Trycatch(
  async (req: AuthenticatedRequest, res: Response) => {
    // بررسی دسترسی ادمین
    

    // دریافت شناسه آهنگ
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        message: "شناسه آهنگ معتبر نیست.",
      });
      return;
    }

    // بررسی وجود آهنگ
    const existing = await sql`
      SELECT * FROM songs
      WHERE id = ${id}
    `;

    if (existing.length === 0) {
      res.status(404).json({
        message: "آهنگ پیدا نشد.",
      });
      return;
    }

    const oldSong = existing[0]!;

    // اطلاعات جدید یا مقادیر قبلی
    const title =
      req.body.title !== undefined
        ? String(req.body.title).trim()
        : oldSong.title;

    const description =
      req.body.description !== undefined
        ? String(req.body.description).trim()
        : oldSong.description;

    const albumId =
      req.body.album !== undefined
        ? Number(req.body.album)
        : Number(oldSong.album_id);

    if (
      !title ||
      !description ||
      !Number.isInteger(albumId) ||
      albumId <= 0
    ) {
      res.status(400).json({
        message: "عنوان، توضیحات یا شناسه آلبوم معتبر نیست.",
      });
      return;
    }

    // بررسی وجود آلبوم
    const albums = await sql`
      SELECT id FROM albums
      WHERE id = ${albumId}
    `;

    if (albums.length === 0) {
      res.status(404).json({
        message: "آلبوم موردنظر پیدا نشد.",
      });
      return;
    }

    // حفظ فایل‌های قبلی در صورت ارسال‌نشدن فایل جدید
    let audio: string = oldSong.audio;
    let thumbnail: string = oldSong.thumbnail;

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    // جایگزینی فایل صوتی در صورت ارسال
    const audioFile = files?.["src"]?.[0];

    if (audioFile) {
      const fileBuffer = getBuffer(audioFile);

      if (!fileBuffer) {
        res.status(500).json({
          message: "ساخت بافر فایل صوتی ناموفق بود.",
        });
        return;
      }

      const uploadedAudio = await cloudinary.uploader.upload(
        fileBuffer,
        {
          folder: "songs/audio",
          resource_type: "video",
        }
      );

      audio = uploadedAudio.secure_url;
    }

    // جایگزینی کاور در صورت ارسال
    const thumbnailFile = files?.["thumbnail"]?.[0];

    if (thumbnailFile) {
      const fileBuffer = getBuffer(thumbnailFile);

      if (!fileBuffer) {
        res.status(500).json({
          message: "ساخت بافر کاور ناموفق بود.",
        });
        return;
      }

      const uploadedThumbnail = await cloudinary.uploader.upload(
        fileBuffer,
        {
          folder: "songs/thumbnails",
          resource_type: "image",
        }
      );

      thumbnail = uploadedThumbnail.secure_url;
    }

    // ذخیره تغییرات در دیتابیس
    const result = await sql`
      UPDATE songs
      SET
        title = ${title},
        description = ${description},
        album_id = ${albumId},
        audio = ${audio},
        thumbnail = ${thumbnail}
      WHERE id = ${id}
      RETURNING *
    `;

    res.status(200).json({
      message: "آهنگ با موفقیت ویرایش شد.",
      song: result[0],
    });
  }
);
