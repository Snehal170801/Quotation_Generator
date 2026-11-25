// src/services/api.ts

import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Derived from the current page's hostname so the same build works on any
// network (tplink, airfiber, Cognexa, ...) without hardcoding a LAN IP.
// Set VITE_API_URL to override (e.g. for a different backend host/port).
const defaultBaseURL = `http://${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? defaultBaseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 — but skip the login endpoint itself so error messages render
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
