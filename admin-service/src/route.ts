import express from "express";
import uploadFile, { isAuth} from "./middleware.js";
import { addAlbum } from "./controller/addalbum.js";
import { addSong } from "./controller/addsong.js";
import { addThumbnail } from "./controller/addthumnail.js";
import { deleteAlbume } from "./controller/deletealbum.js";
import { deleteSong } from "./controller/deletesong.js";
import { getAlbums, getSongs } from "./controller/getsong&album.js";




const router = express.Router()

router.post('/album/new' , isAuth ,uploadFile,addAlbum)
router.post('/song/new', isAuth, uploadFile, addSong)
router.post('/song/:id',isAuth,uploadFile,addThumbnail)
router.delete('/album/:id',isAuth,deleteAlbume)
router.delete('/song/:id',isAuth,deleteSong)
router.get("/albums", isAuth, getAlbums);
router.get("/songs", isAuth, getSongs);
export default router;