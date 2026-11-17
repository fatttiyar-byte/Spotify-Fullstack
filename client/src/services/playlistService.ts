
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.token = token;
  }

  return config;
});

// افزودن آهنگ به پلی‌لیست
export const addSongToPlaylist = async (songId: string) => {
  const { data } = await api.post(
    `/user/playlist/${songId}`
  );

  return data;
};

// دریافت پلی‌لیست
export const getMyPlaylist = async () => {
  const { data } = await api.get("/user/playlist");

  return data;
};

// حذف آهنگ از پلی‌لیست
export const removeSongFromPlaylist = async (songId: string) => {
  const { data } = await api.delete(
    `/user/playlist/${songId}`
  );

  return data;
};
