import axios from 'axios';

const BASE_URL = 'http://localhost:5123/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ═══════════ TOKEN İDARƏSİ ═══════════ */
export const tokenStore = {
  get access() { return localStorage.getItem('accessToken'); },
  get refresh() { return localStorage.getItem('refreshToken'); },
  set(access, refresh) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

/* ═══════════ REQUEST: token əlavə et ═══════════ */
API.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ═══════════ RESPONSE: 401 → refresh ═══════════ */
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Auth endpointlərində refresh cəhdi ETMƏ
    const isAuthEndpoint =
      original?.url?.includes('/Auth/login') ||
      original?.url?.includes('/Auth/register') ||
      original?.url?.includes('/Auth/refresh-token');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (!tokenStore.refresh) {
        tokenStore.clear();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return API(original);
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
        return API(original);
      } catch (err) {
        processQueue(err, null);
        tokenStore.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/* ═══════════ XƏTA MESAJI ═══════════ */
export const getError = (error, fallback = 'Xəta baş verdi.') => {
  // Serverdən cavab gəlməyibsə
  if (!error?.response) {
    if (error?.request) return 'Serverlə əlaqə yoxdur. Backend işləyirmi? (localhost:5123)';
    return error?.message || fallback;
  }

  const d = error.response.data;

  if (typeof d === 'string' && d.trim()) return d;
  if (d?.message) return d.message;

  if (d?.errors) {
    if (Array.isArray(d.errors) && d.errors.length) return d.errors[0];
    const first = Object.values(d.errors)[0];
    if (Array.isArray(first)) return first[0];
    if (typeof first === 'string') return first;
  }

  if (d?.title) return d.title;

  // Status koduna görə oxunaqlı mesaj
  switch (error.response.status) {
    case 400: return 'Daxil edilən məlumatlar düzgün deyil.';
    case 401: return 'E-poçt və ya parol yanlışdır.';
    case 403: return 'Bu əməliyyat üçün icazəniz yoxdur.';
    case 404: return 'Məlumat tapılmadı.';
    case 500: return 'Serverdə xəta baş verdi.';
    default:  return fallback;
  }
};

export default API;




