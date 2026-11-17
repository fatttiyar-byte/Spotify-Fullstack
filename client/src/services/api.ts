import axios from "axios";

export const userApi = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

export const adminApi = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

export const musicApi = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});