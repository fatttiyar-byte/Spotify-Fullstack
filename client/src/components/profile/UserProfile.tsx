
import axios from "axios";
import { useAuthStore } from "../../store/authStore";

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

interface ProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export const updateProfile = async (
  payload: { name: string; email: string }
): Promise<ProfileResponse> => {
  const { data } = await api.put<ProfileResponse>(
    "/user/update-profile",
    payload
  );

  return data;
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse> => {
  const { data } = await api.put<ApiResponse>(
    "/user/change-password",
    payload
  );

  return data;
};

export const logoutUser = async (): Promise<ApiResponse> => {
  const { data } = await api.post<ApiResponse>("/user/logout");

  return data;
};
