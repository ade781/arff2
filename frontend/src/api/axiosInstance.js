import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const saved = localStorage.getItem('arff-session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {

      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/autentikasi/login')) {
      localStorage.removeItem('arff-session');
      window.dispatchEvent(new Event('arff-unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Terjadi kesalahan pada sistem.';
}

export default axiosInstance;
