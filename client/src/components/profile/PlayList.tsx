import axios from "axios";
import { useAuthStore } from "../../store/authStore";
// آدرس User Service
const userApi = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

// آدرس Admin Service
const adminApi = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

// ارسال توکن برای احراز هویت
const addToken = (config: any) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.token = token;
  }

  return config;
};

userApi.interceptors.request.use(addToken);
adminApi.interceptors.request.use(addToken);

// ساختار آهنگ
export interface Song {
  id: number;
  title: string;
  description: string;
  album_id: number;
  thumbnail: string | null;
  audio: string;
}

// دریافت پلی‌لیست کاربر
export const getMyPlaylist = async (): Promise<string[]> => {
  const { data } = await userApi.get("/user/playlist");

  return data.playlist;
};

// دریافت تمام آهنگ‌ها
export const getAllSongs = async (): Promise<Song[]> => {
  const { data } = await adminApi.get("/songs");

  return data.songs;
};

// دریافت اطلاعات آهنگ‌های پلی‌لیست
export const getPlaylistSongs = async (): Promise<Song[]> => {
  const [playlistIds, songs] = await Promise.all([
    getMyPlaylist(),
    getAllSongs(),
  ]);

  return songs.filter((song) =>
    playlistIds.includes(String(song.id))
  );
};

// حذف آهنگ از پلی‌لیست
export const removeFromPlaylist = async (songId: string) => {
  const { data } = await userApi.delete(
    `/user/playlist/${songId}`
  );

  return data;
};