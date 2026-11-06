import express from 'express'
import { getAllAlbums, getAllSongs, getAllSongsOfAlbum, getSingleSong } from './controller/getsong&album.js';
import { searchSongs } from './controller/searchsong.js';
import { playSong } from './controller/playSong.js';
import { getPopularSongs } from './controller/popularSongs.js';


const router = express.Router()

router.get("/album/all", getAllAlbums);
router.get("/song/all", getAllSongs);
router.get("/album/:id", getAllSongsOfAlbum);
router.get("/song/:id", getSingleSong);
router.get("/songs/search", searchSongs);
router.post("/songs/:id/play", playSong);
router.get("/songs/popular", getPopularSongs);
export default router