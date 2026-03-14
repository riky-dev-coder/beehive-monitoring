import axios from 'axios';

// Usar HTTPS siempre. En desarrollo, fallback a https://localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:8000';

// Validar que siempre se use HTTPS
if (!import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL && !API_BASE_URL.startsWith('https')) {
  console.warn('⚠️ API_BASE_URL debe usar HTTPS. Configuración actual:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // En desarrollo, ignorar errores de certificado autofirmado
  ...(import.meta.env.DEV && {
    httpsAgent: {
      rejectUnauthorized: false, // Solo para desarrollo
    },
  }),
});

// Interceptor para agregar tokens de autenticación si es necesario
api.interceptors.request.use((config) => {
  // Aquí se pueden agregar headers de autenticación si es necesario
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Error 401: No autorizado - Verifica tus credenciales');
    }
    return Promise.reject(error);
  }
);

export default api;