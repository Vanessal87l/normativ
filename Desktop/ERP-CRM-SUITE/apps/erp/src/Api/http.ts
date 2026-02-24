import axios from "axios"

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  // agar siz JWT tokenni localStorage’da saqlasangiz:
  const token = localStorage.getItem("access")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
