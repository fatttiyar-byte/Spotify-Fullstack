
import axios from "axios";
import { useAuthStore } from "../store/authStore";

export interface UserProfile {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "user" | "admin";
  playlist?: string[];
  profileImage?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user: UserProfile;
}

export interface PlaylistResponse {
  message?: string;
  playlist: string[];
}

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

// ارسال توکن در تمام درخواست‌ها
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.token = token;
  }

  return config;
});

// دریافت اطلاعات پروفایل
export const getMyProfile = async () => {
  const { data } = await api.get<ProfileResponse>("/user/me");
  return data;
};

// ویرایش پروفایل
export const updateProfile = async (payload: {
  name: string;
  email: string;
}) => {
  const { data } = await api.put<ProfileResponse>(
    "/user/update-profile",
    payload
  );

  return data;
};

// تغییر رمز عبور
export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const { data } = await api.put(
    "/user/change-password",
    payload
  );

  return data;
};

// آپلود تصویر پروفایل
export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.put<{
    success: boolean;
    message: string;
    profileImage: string;
  }>("/user/profile-image", formData);

  return data;
};

// حذف تصویر پروفایل
export const deleteProfileImage = async () => {
  const { data } = await api.delete<{
    success: boolean;
    message: string;
    profileImage: string;
  }>("/user/profile-image");

  return data;
};

// خروج از حساب
export const logoutUser = async () => {
  const { data } = await api.post("/user/logout");
  return data;
};

// دریافت پلی‌لیست
export const getPlaylist = async () => {
  const { data } = await api.get<PlaylistResponse>(
    "/user/playlist"
  );

  return data.playlist;
};

// افزودن آهنگ به پلی‌لیست
export const addSongToPlaylist = async (songId: string) => {
  const { data } = await api.post<PlaylistResponse>(
    `/user/playlist/${songId}`
  );

  return data;
};

// حذف آهنگ از پلی‌لیست
export const removeSongFromPlaylist = async (songId: string) => {
  const { data } = await api.delete<PlaylistResponse>(
    `/user/playlist/${songId}`
  );

  return data;
};
