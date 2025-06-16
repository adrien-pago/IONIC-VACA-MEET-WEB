import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import config from './config';

// URL de production fixe
const API_BASE_URL = 'https://mobile.vaca-meet.fr';

console.log('Service API initialisé avec URL de production:', API_BASE_URL);

// Configuration des options avancées
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état
      console.error('Erreur de réponse du serveur:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Erreur de connexion:', {
        message: error.message,
        request: error.request
      });
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 