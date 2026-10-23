import type { AuthenticatedRequest } from "../middleware.js"
import { Trycatch } from "../Trycatch.js"
import { v2 as cloudinary } from 'cloudinary'
import { getBuffer } from "../config/dataUri.js"
import { sql } from "../config/db.js";


export const addThumbnail = Trycatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'شما دسترسی ادمین ندارید.' })
        return
    }

    const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id as string}`

    if (song.length === 0) {
        res.status(404).json({
            message: 'آهنگی با این شناسه یافت نشد'
        })
        return
    }

    const file = req.file

    if (!file) {
        res.status(400).json({ message: 'فایلی برای آپلود ارسال نشده است' })
        return
    }

    const fileBuffer = getBuffer(file)

    if (!fileBuffer) {
        res.status(500).json({ message: 'Failed to generate file buffer' })
        return
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer)

    const result = await sql`
     UPDATE songs 
     SET thumbnail = ${cloud.secure_url}
     WHERE id = ${req.params.id as string}
     RETURNING *
     `
    res.json({
        message: 'کاور با موفقیت اضافه شد',
        song: result[0]
    })

})
