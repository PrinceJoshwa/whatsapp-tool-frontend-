import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
});

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const mediaUrl = (u) => (u && u.startsWith("/") ? `${BACKEND_URL}${u}` : u);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("slash_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiError(e) {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(" ");
  return e?.message || "Something went wrong";
}

export default api;
