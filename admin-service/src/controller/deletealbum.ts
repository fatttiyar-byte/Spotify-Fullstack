import type { AuthenticatedRequest } from "../middleware.js"
import { Trycatch } from "../Trycatch.js"
import { sql } from "../config/db.js";

export const deleteAlbume = Trycatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'شما دسترسی ادمین ندارید.' })
        return
    }

    const { id } = req.params

    const isAlbume = await sql`SELECT * FROM albums WHERE id =${id as string}`

    if (isAlbume.length === 0) {
        res.status(404).json({ message: 'آلبومی با این شناسه یافت نشد.' })
        return
    }

    await sql`DELETE FROM songs WHERE album_id = ${id as string}`

    await sql`DELETE FROM albums WHERE id = ${id as string}`

    res.json({
        message: 'آلبوم با موفقیت حذف شد',
    })

})
