import type { AuthenticatedRequest } from "../middleware.js"
import { Trycatch } from "../Trycatch.js"
import { sql } from "../config/db.js";



export const deleteSong = Trycatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'شما دسترسی ادمین ندارید.' })
        return
    }

    const { id } = req.params

    const song = await sql`SELECT * FROM songs WHERE id =${id as string}`

    if (song.length === 0) {
        res.status(404).json({ message: 'آهنگی با این شناسه یافت نشد.' })
        return
    }

    await sql`DELETE FROM songs WHERE id = ${id as string}`

    res.json({
        message: 'آهنگ با موفقیت حذف شد',
    })

})