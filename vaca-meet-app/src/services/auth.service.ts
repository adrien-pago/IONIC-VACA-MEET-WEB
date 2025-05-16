import axios from 'axios';
import config from './config';

export class AuthService {
  private token: string | null = null;
  private apiBaseUrl: string = config.api.baseUrl; // Utilisation du baseUrl de la configuration

  constructor() {
    // Récupérer le token du localStorage lors de l'initialisation
    this.token = localStorage.getItem(config.storage.tokenKey);
    
    // Affichage des informations de configuration pour le débogage
    console.log('Informations environnement:', config.env);
    console.log('URL API utilisée (production uniquement):', this.apiBaseUrl);
  }

  async register(userData: { username: string; password: string; firstName?: string; lastName?: string }) {
    try {
      console.log('Tentative d\'inscription avec:', userData);
      
      const endpoint = `${this.apiBaseUrl}${config.api.endpoints.register}`;
      console.log('URL API register utilisée:', endpoint);
      
      // Configuration détaillée pour débogage
      const requestConfig = {
        timeout: config.requestTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (config.debug.verbose) {
        console.log('Configuration requête inscription:', requestConfig);
        console.log('Données envoyées:', JSON.stringify(userData));
      }
      
      // Appel réel à l'API
      const response = await axios.post(endpoint, userData, requestConfig);
      
      console.log('Réponse API register:', response.data);
      
      // Stocker le token seulement s'il est présent dans la réponse
      if (response.data && response.data.token) {
        this.storeToken(response.data.token);
      }
      
      // Retourner toutes les données de la réponse
      return response.data;
    } catch (error: any) {
      console.error('Erreur d\'inscription détaillée:', {
        message: error.message,
        code: error.code,
        name: error.name,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
      
      // Analyse spécifique des erreurs courantes
      if (error.code === 'ECONNABORTED') {
        console.error('ERREUR TIMEOUT: Le serveur a mis trop de temps à répondre');
        console.log('Vérifiez que votre serveur API est bien démarré et accessible à l\'adresse:', this.apiBaseUrl);
      } else if (error.message.includes('Network Error')) {
        console.error('ERREUR RÉSEAU: Impossible de se connecter au serveur');
        console.log('Vérifiez votre connexion internet et que le serveur est accessible');
      }
      
      throw error;
    }
  }

  async login(credentials: { username: string; password: string }) {
    try {
      console.log('Tentative de connexion avec:', credentials);
      
      const endpoint = `${this.apiBaseUrl}${config.api.endpoints.login}`;
      console.log('URL API login utilisée:', endpoint);
      
      // Configuration détaillée
      const requestConfig = {
        timeout: config.requestTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (config.debug.verbose) {
        console.log('Configuration requête login:', requestConfig);
        console.log('Identifiants envoyés:', JSON.stringify({
          username: credentials.username,
          password: '***HIDDEN***'
        }));
      }
      
      // Appel à l'API de login
      const response = await axios.post(endpoint, {
        username: credentials.username,
        password: credentials.password
      }, requestConfig);
      
      console.log('Réponse API login:', response.data);
      
      if (response.data && response.data.token) {
        this.storeToken(response.data.token);
      }
      return response.data;
    } catch (error: any) {
      console.error('Erreur de connexion détaillée:', {
        message: error.message,
        code: error.code,
        name: error.name,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      });
      
      // Analyse spécifique des erreurs courantes
      if (error.code === 'ECONNABORTED') {
        console.error('ERREUR TIMEOUT: Le serveur a mis trop de temps à répondre');
        console.log('Vérifiez que votre serveur API est bien démarré et accessible à l\'adresse:', this.apiBaseUrl);
      } else if (error.message.includes('Network Error')) {
        console.error('ERREUR RÉSEAU: Impossible de se connecter au serveur');
        console.log('Vérifiez votre connexion internet et que le serveur est accessible');
      }
      
      throw error;
    }
  }

  storeToken(token: string) {
    this.token = token;
    localStorage.setItem(config.storage.tokenKey, token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout() {
    this.token = null;
    localStorage.removeItem(config.storage.tokenKey);
  }

  async getUserProfile() {
    try {
      if (!this.token) {
        throw new Error('Non authentifié');
      }
      
      const endpoint = `${this.apiBaseUrl}${config.api.endpoints.profile}`;
      console.log('URL API profile utilisée:', endpoint);
      
      // Configuration détaillée
      const requestConfig = {
        timeout: config.requestTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.token}`
        }
      };
      
      if (config.debug.verbose) {
        console.log('Configuration requête profil:', {
          ...requestConfig,
          headers: {
            ...requestConfig.headers,
            'Authorization': 'Bearer ***TOKEN_HIDDEN***'
          }
        });
      }
      
      const response = await axios.get(endpoint, requestConfig);
      
      // Le backend renvoie directement les données utilisateur, pas besoin d'extraire user
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération profil détaillée:', {
        message: error.message,
        code: error.code,
        name: error.name,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      throw error;
    }
  }

} 