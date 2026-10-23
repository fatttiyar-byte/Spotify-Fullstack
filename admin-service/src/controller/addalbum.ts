
import type { AuthenticatedRequest } from "../middleware.js"
import { Trycatch } from "../Trycatch.js"
import { v2 as cloudinary } from 'cloudinary'
import { getBuffer } from "../config/dataUri.js"
import { sql } from "../config/db.js";

export const addAlbum = Trycatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'شما دسترسی ادمین ندارید.' })
        return
    }

    const { title, description } = req.body
    const file = req.file

    if (!file) {
        res.status(400).json({ message: 'فایلی برای آپلود ارسال نشده .' })
        return
    }

    const fileBuffer = getBuffer(file)

    if (!fileBuffer) {
        res.status(500).json({ message: 'failed to generate file buffer' })
        return
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer, {
        folder: 'albums'
    })

    const result = await sql`
      INSERT INTO albums (title,description,thumbnail)
      VALUES(${title},${description},${cloud.secure_url})
      RETURNING * `
    res.json({
        message: 'آلبوم با موفقیت ساخته شد .',
        album: result[0]
    })
})