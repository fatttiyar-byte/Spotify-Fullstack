import express from "express";
import uploadFile, { isAuth, isAdmin, validateId, uploadFiles } from "./middleware.js";
import { addAlbum } from "./controller/addalbum.js";
import { addSong } from "./controller/addsong.js";
import { addThumbnail } from "./controller/addthumnail.js";
import { deleteAlbume } from "./controller/deletealbum.js";
import { deleteSong } from "./controller/deletesong.js";
import { getAlbums, getSongs } from "./controller/getsong&album.js";
import { updateSong } from "./controller/updatesong.js";
import { getSongById } from "./controller/getSongById.js";
import { getDashboardStats } from "./controller/dashboard.js";

const router = express.Router()

// albums
router.get("/albums", isAuth, getAlbums)
router.post("/album/new", isAuth, isAdmin, uploadFile, addAlbum)
router.delete("/album/:id", isAuth, isAdmin, validateId, deleteAlbume)

//songs
router.get("/songs", isAuth, getSongs)
router.get("/song/:id", isAuth, validateId, getSongById)
router.post("/song/new", isAuth, isAdmin, uploadFiles, addSong)
router.patch("/song/:id", isAuth, isAdmin, validateId, uploadFiles, updateSong)
router.post("/song/:id/thumbnail", isAuth, isAdmin, validateId, uploadFile, addThumbnail)
router.delete("/song/:id", isAuth, isAdmin, validateId, deleteSong)

 //Dashboard 
router.get("/dashboard/stats", isAuth, isAdmin, getDashboardStats)

export default router