
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5123/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
// ---------- Token helpers ----------
export const tokenStore = {
  get access() { return localStorage.getItem("accessToken"); },
  get refresh() { return localStorage.getItem("refreshToken"); },
  set(access, refresh) {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  },
  clear() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};

// ---------- Request: token əlavə et ----------
api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- Response: 401 → refresh ----------
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (!tokenStore.refresh) {
        tokenStore.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/Auth/refresh-token`, {
          accessToken: tokenStore.access,
          refreshToken: tokenStore.refresh,
        });

        const newAccess = data.data.accessToken;
        tokenStore.set(newAccess, data.data.refreshToken);
        processQueue(null, newAccess);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        tokenStore.clear();
        toast.error("Sessiya bitdi. Yenidən daxil olun.");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      toast.error("Bu əməliyyat üçün icazəniz yoxdur.");
    }

    return Promise.reject(error);
  }
);

/** Xəta mesajını çıxarır */
export const getError = (error, fallback = "Xəta baş verdi.") =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0] ||
  fallback;

export default api;