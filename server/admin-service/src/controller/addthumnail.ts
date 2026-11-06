import type { AuthenticatedRequest } from "../middleware.js"
import { Trycatch } from "../Trycatch.js"
import cloudinary from "../config/cloudinary.js"
import { sql } from "../config/db.js"
import { redisClient } from "../index.js"
import { uploadBuffer } from "../config/uploadBuffer.js"

export const addThumbnail = Trycatch(async (req: AuthenticatedRequest, res) => {
    // نقش ادمین و اعتبار id در روتر (isAdmin و validateId) بررسی می‌شود
    const id = Number(req.params.id)

    const songs = await sql`SELECT id FROM songs WHERE id = ${id}`
    if (songs.length === 0) {
        res.status(404).json({ message: 'آهنگی با این شناسه یافت نشد.' })
        return
    }

    const file = req.file
    if (!file) {
        res.status(400).json({ message: 'فایلی برای آپلود ارسال نشده است.' })
        return
    }

    if (!file.mimetype.startsWith('image/')) {
        res.status(400).json({ message: 'فقط فایل تصویر مجاز است.' })
        return
    }

    const cloud = await uploadBuffer(file.buffer, {
        folder: 'songs/thumbnails',
        resource_type: 'image',
    })

    let song
    try {
        const result = await sql`
            UPDATE songs
            SET thumbnail = ${cloud.secure_url}
            WHERE id = ${id}
            RETURNING *`
        song = result[0]
    } catch (error) {
        // جلوگیری از فایل یتیم
        await cloudinary.uploader.destroy(cloud.public_id).catch(() => {})
        throw error
    }

    await redisClient.del('songs').catch(() => {})

    res.status(200).json({
        message: 'کاور با موفقیت اضافه شد.',
        song,
    })
})