
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const attachToken = (config: any) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.token = token;
  }

  return config;
};

export const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API_URL || "http://localhost:3000/api/v1",
});

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL || "http://localhost:4000/api/v1",
});

export const musicApi = axios.create({
  baseURL: import.meta.env.VITE_MUSIC_API_URL || "http://localhost:5000/api/v1",
});

userApi.interceptors.request.use(attachToken);
adminApi.interceptors.request.use(attachToken);
musicApi.interceptors.request.use(attachToken);
