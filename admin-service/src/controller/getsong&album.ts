import type { AuthenticatedRequest } from "../middleware.js"
import { Trycatch } from "../Trycatch.js"
import { sql } from "../config/db.js";


export const getAlbums = Trycatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== "admin") {
        res.status(403).json({ message: "شما دسترسی ادمین ندارید." });
        return;
    }

    const albums = await sql`
        SELECT * FROM albums
        ORDER BY id DESC
    `;

    res.status(200).json({ albums });
});
//بررسی اطلاعات ثبت شده توسط ادمین
export const getSongs = Trycatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== "admin") {
        res.status(403).json({ message: "شما دسترسی ادمین ندارید." });
        return;
    }

    const songs = await sql`
        SELECT * FROM songs
        ORDER BY id DESC
    `;

    res.status(200).json({ songs });
});

