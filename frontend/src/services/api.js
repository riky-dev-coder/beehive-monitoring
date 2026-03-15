import axios from "axios";

let API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://beehive-monitoring-production.up.railway.app";

// Forzar HTTPS siempre
API_BASE_URL = API_BASE_URL.replace("http://", "https://");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para forzar HTTPS en cualquier request
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith("http://")) {
    config.url = config.url.replace("http://", "https://");
  }
  return config;
});

export default api;