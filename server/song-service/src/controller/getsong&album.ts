import { sql } from "../config/db.js";
import { redisClient } from "../index.js";
import TryCatch from "../TryCatch.js";

const CACHE_EXPIRY = 1800;

export const getAllAlbums = TryCatch(async (req, res) => {
  let albums;

  if (redisClient.isReady) {
    const cached = await redisClient.get("albums");
    if (cached) {
      console.log("Cache Hit💥");
      res.json(JSON.parse(cached));
      return;
    }
  }

  console.log("Cache miss💘");
  albums = await sql`SELECT * FROM albums`;

  if (redisClient.isReady) {
    await redisClient.set("albums", JSON.stringify(albums), {
      EX: CACHE_EXPIRY,
    });
  }

  res.json(albums);
});

export const getAllSongs = TryCatch(async (req, res) => {
  let songs;

  if (redisClient.isReady) {
    const cached = await redisClient.get("songs");
    if (cached) {
      console.log("Cache Hit");
      res.json(JSON.parse(cached));
      return;
    }
  }

  console.log("Cache Miss");
  songs = await sql`SELECT * FROM songs`;

  if (redisClient.isReady) {
    await redisClient.set("songs", JSON.stringify(songs), {
      EX: CACHE_EXPIRY,
    });
  }

  res.json(songs);
});

export const getAllSongsOfAlbum = TryCatch(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ message: "شناسه آلبوم نامعتبر است" });
    return;
  }

  if (redisClient.isReady) {
    const cached = await redisClient.get(`album_songs_${id}`);
    if (cached) {
      console.log("Cache Hit");
      res.json(JSON.parse(cached));
      return;
    }
  }

  const album = await sql`SELECT * FROM albums WHERE id = ${id}`;

  if (album.length === 0) {
    res.status(404).json({
      message: "آلبومی با این شناسه پیدا نشد",
    });
    return;
  }

  const songs = await sql`SELECT * FROM songs WHERE album_id = ${id}`;

  const response = { songs, album: album[0] };

  if (redisClient.isReady) {
    await redisClient.set(`album_songs_${id}`, JSON.stringify(response), {
      EX: CACHE_EXPIRY,
    });
  }

  console.log("Cache Miss");
  res.json(response);
});

export const getSingleSong = TryCatch(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ message: "شناسه آهنگ نامعتبر است" });
    return;
  }

  const song = await sql`SELECT * FROM songs WHERE id = ${id}`;

  if (song.length === 0) {
    res.status(404).json({ message: "آهنگی با این شناسه پیدا نشد" });
    return;
  }

  res.json(song[0]);
});