import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import config from './config';

// URL de production fixe - sans le préfixe "/api" pour éviter la duplication
const API_BASE_URL = 'https://mobile.vaca-meet.fr';

console.log('Service API initialisé avec URL de production:', API_BASE_URL);

// Configuration des options avancées
const axiosConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.requestTimeout
  // Nous supprimons la configuration httpsAgent qui utilise require() 
  // car require() n'est pas disponible dans le contexte du navigateur/WebView
};

console.log('Configuration API avancée:', axiosConfig);

// Créer une instance axios avec l'URL de base de l'API
const api = axios.create(axiosConfig);

// Ajouter un intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use((requestConfig) => {
  // Log des requêtes en mode développement
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Requête API: ${requestConfig.method?.toUpperCase()} ${requestConfig.baseURL}${requestConfig.url}`);
  }
  
  const token = localStorage.getItem(config.storage.tokenKey);
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// Ajouter un intercepteur pour logger les réponses en mode développement
api.interceptors.response.use(
  response => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Réponse API (${response.status}): ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  error => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Erreur API:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

// Méthode pour tester la connexion API
export const testApiConnection = async (url: string): Promise<any> => {
  try {
    console.log(`Test de connexion API vers: ${url}`);
    const startTime = Date.now();
    const response = await axios.get(url, { 
      timeout: config.requestTimeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const endTime = Date.now();
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      time: endTime - startTime,
      success: true
    };
  } catch (error: any) {
    // Formater l'erreur de manière cohérente
    return {
      error: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      time: null,
      success: false
    };
  }
};

// Méthodes d'API génériques
export const fetchData = async <T>(endpoint: string, options?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.get(endpoint, options);
  return response.data;
};

export const postData = async <T>(endpoint: string, data: any, options?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await api.post(endpoint, data, options);
  return response.data;
};

export default api; 