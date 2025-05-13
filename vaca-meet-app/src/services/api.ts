import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';

// Configuration de l'instance axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // URL de base de votre API Symfony (à adapter selon votre configuration)
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Intercepteur pour ajouter le token d'authentification si nécessaire
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default api; 