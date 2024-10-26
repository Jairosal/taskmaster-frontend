import axios from 'axios';
import config from '../config/config';

const instance = axios.create({
  baseURL: config.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Añade estas dos líneas para CORS
  withCredentials: true,
  credentials: 'include'
});

// Lista de rutas que no necesitan token
const publicRoutes = [
  '/api/token/',
  '/api/register/',
  '/api/password-reset/',
  '/api/password-reset-confirm/'
];

// Lista de rutas que pueden tomar más tiempo
const longProcessRoutes = [
  '/api/password-reset/'
];

instance.interceptors.request.use(
  (config) => {
    // Asegúrate de que las URLs empiecen con /
    if (!config.url.startsWith('/') && !config.url.startsWith('http')) {
      config.url = '/' + config.url;
    }

    // Ajusta el timeout para rutas que pueden tomar más tiempo
    if (longProcessRoutes.some(route => config.url.includes(route))) {
      config.timeout = 30000; // 30 segundos para estas rutas
    }

    // Verifica si la ruta actual está en la lista de rutas públicas
    const isPublicRoute = publicRoutes.some(route => config.url.includes(route));
    
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Para debug
    console.log('URL:', config.url);
    console.log('Es ruta pública:', isPublicRoute);
    console.log('Timeout configurado:', config.timeout);
    console.log('Headers:', config.headers);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Manejo específico para errores de timeout
    if (error.code === 'ECONNABORTED') {
      console.log('La operación está tomando más tiempo de lo esperado...');
      return Promise.reject({
        ...error,
        message: 'La operación está tomando más tiempo de lo esperado. Por favor, inténtelo nuevamente.'
      });
    }

    // Solo redirige a login si es error 401 y NO es una ruta de reset de contraseña
    if (error.response?.status === 401 && !error.config.url.includes('password-reset')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;