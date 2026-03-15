import axios from "axios";

let API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  ''; // Cambiar en caso de otro puerto o dominio
  
API_BASE_URL = API_BASE_URL.replace("http://", "https://");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;