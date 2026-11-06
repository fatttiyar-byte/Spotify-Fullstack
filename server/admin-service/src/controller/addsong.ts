import type { AuthenticatedRequest } from "../middleware.js"
import { Trycatch } from "../Trycatch.js"
import cloudinary from "../config/cloudinary.js"
import { sql } from "../config/db.js"
import { redisClient } from "../index.js"
import { uploadBuffer } from "../config/uploadBuffer.js"

export const addSong = Trycatch(async (req: AuthenticatedRequest, res) => {
    // نقش ادمین در روتر (isAdmin) بررسی می‌شود
    const { title, description, album } = req.body
    const albumId = Number(album)

    if (
        typeof title !== "string" || !title.trim() ||
        typeof description !== "string" || !description.trim() ||
        !Number.isInteger(albumId) || albumId <= 0
    ) {
        res.status(400).json({ message: "عنوان، توضیحات و شناسه معتبر آلبوم الزامی هستند." })
        return
    }

    const isAlbum = await sql`SELECT id FROM albums WHERE id = ${albumId}`
    if (isAlbum.length === 0) {
        res.status(404).json({ message: "آلبوم موردنظر یافت نشد." })
        return
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
    const audioFile = files?.["src"]?.[0]
    const thumbnailFile = files?.["thumbnail"]?.[0]

    if (!audioFile || !thumbnailFile) {
        res.status(400).json({ message: "فایل صوتی با نام src و کاور با نام thumbnail الزامی هستند." })
        return
    }

    if (!audioFile.mimetype.startsWith("audio/")) {
        res.status(400).json({ message: "فایل src باید صوتی باشد." })
        return
    }

    if (!thumbnailFile.mimetype.startsWith("image/")) {
        res.status(400).json({ message: "فایل thumbnail باید تصویر باشد." })
        return
    }

    // آپلود موازی؛ allSettled تا در صورت شکست یکی، دیگری پاک شود
    const [audioRes, thumbRes] = await Promise.allSettled([
        uploadBuffer(audioFile.buffer, { folder: "songs/audio", resource_type: "video" }),
        uploadBuffer(thumbnailFile.buffer, { folder: "songs/thumbnails", resource_type: "image" }),
    ])

    const cleanup = async () => {
        if (audioRes.status === "fulfilled") {
            await cloudinary.uploader
                .destroy(audioRes.value.public_id, { resource_type: "video" })
                .catch(() => {})
        }
        if (thumbRes.status === "fulfilled") {
            await cloudinary.uploader
                .destroy(thumbRes.value.public_id, { resource_type: "image" })
                .catch(() => {})
        }
    }

    if (audioRes.status === "rejected") {
        await cleanup()
        throw audioRes.reason
    }
    if (thumbRes.status === "rejected") {
        await cleanup()
        throw thumbRes.reason
    }

    let song
    try {
        const result = await sql`
            INSERT INTO songs (title, description, album_id, audio, thumbnail)
            VALUES (
                ${title.trim()},
                ${description.trim()},
                ${albumId},
                ${audioRes.value.secure_url},
                ${thumbRes.value.secure_url}
            )
            RETURNING *`
        song = result[0]
    } catch (error) {
        await cleanup()
        throw error
    }

    await redisClient.del("songs").catch(() => {})

    res.status(201).json({
        message: "آهنگ و کاور با موفقیت به آلبوم اضافه شدند.",
        song,
    })
})