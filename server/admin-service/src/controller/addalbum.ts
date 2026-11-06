import type { AuthenticatedRequest } from "../middleware.js"
import { Trycatch } from "../Trycatch.js"
import cloudinary from "../config/cloudinary.js"
import { sql } from "../config/db.js"
import { redisClient } from "../index.js"
import { uploadBuffer } from "../config/uploadBuffer.js"

export const addAlbum = Trycatch(async (req: AuthenticatedRequest, res) => {
    // نقش ادمین در روتر (isAdmin) بررسی می‌شود
    const title = typeof req.body.title === "string" ? req.body.title.trim() : ""
    const description = typeof req.body.description === "string" ? req.body.description.trim() : ""
    const file = req.file

    if (!title || !description) {
        res.status(400).json({ message: "عنوان و توضیحات الزامی است." })
        return
    }

    if (!file) {
        res.status(400).json({ message: "فایلی برای آپلود ارسال نشده است." })
        return
    }

    if (!file.mimetype.startsWith("image/")) {
        res.status(400).json({ message: "فقط فایل تصویر مجاز است." })
        return
    }

    const cloud = await uploadBuffer(file.buffer, {
        folder: "albums",
        resource_type: "image",
    })

    let album
    try {
        const result = await sql`
            INSERT INTO albums (title, description, thumbnail)
            VALUES (${title}, ${description}, ${cloud.secure_url})
            RETURNING *`
        album = result[0]
    } catch (error) {
        await cloudinary.uploader.destroy(cloud.public_id, { resource_type: "image" }).catch(() => {})
        throw error
    }

    await redisClient.del("albums").catch(() => {})

    res.status(201).json({
        message: "آلبوم با موفقیت ساخته شد.",
        album,
    })
})