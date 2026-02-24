// pages/Dashboard/dashboard-api/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000/api", // 🔴 keyin backend URL qo‘yasan
  timeout: 10000,
});

// Agar token bo‘lsa (keyin kerak bo‘ladi)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
