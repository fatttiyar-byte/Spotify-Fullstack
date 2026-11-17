
import { userApi } from "../../services/api";

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
  const { data } = await userApi.put<ProfileResponse>(
    "/user/update-profile",
    payload
  );

  return data;
};

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse> => {
  const { data } = await userApi.put<ApiResponse>(
    "/user/change-password",
    payload
  );

  return data;
};

export const logoutUser = async (): Promise<ApiResponse> => {
  const { data } = await userApi.post<ApiResponse>("/user/logout");

  return data;
};
