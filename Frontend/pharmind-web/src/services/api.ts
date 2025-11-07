import axios from 'axios';
import { errorHandler } from './errorHandler.service';

const API_BASE_URL = 'http://localhost:5209/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token JWT a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta de forma centralizada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es error 401, limpiar sesión y redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Si no hay respuesta del servidor (error de red)
    else if (!error.response) {
      errorHandler.handleNetworkError();
    }
    // Para todos los demás errores, usar el manejador centralizado
    else {
      errorHandler.handleApiError(error);
    }

    return Promise.reject(error);
  }
);

export default api;
