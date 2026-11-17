
import { userApi } from "./api";

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  token: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const { data } = await userApi.post<LoginResponse>(
    "/user/login",
    payload
  );

  return data;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const { data } = await userApi.post<RegisterResponse>(
    "/user/register",
    payload
  );

  return data;
};
































// import axios from "axios"; لوکال

// const api = axios.create({
//   baseURL: "http://localhost:3000/api/v1",
// });

// interface LoginResponse {
//   success: boolean;
//   message: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     role: "user" | "admin";
//   };
//   token: string;
// }

// interface RegisterResponse {
//   success: boolean;
//   message: string;
// }

// // ورود
// export const loginUser = async (payload: {
//   email: string;
//   password: string;
// }) => {
//   const { data } = await api.post<LoginResponse>(
//     "/user/login",
//     payload
//   );

//   return data;
// };

// // ثبت‌نام
// export const registerUser = async (payload: {
//   name: string;
//   email: string;
//   password: string;
// }) => {
//   const { data } = await api.post<RegisterResponse>(
//     "/user/register",
//     payload
//   );

//   return data;
// };
