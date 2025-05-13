import axios from 'axios';

// URL de base de l'API
// Pour un émulateur Android, on utilise 10.0.2.2 au lieu de localhost
const API_URL = 'http://10.0.2.2:8000/api';

// Types
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Stockage du token dans le localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Service d'authentification
export const authService = {
  // Test simple de l'API
  testApi: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}/test`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du test de l\'API:', error);
      throw error;
    }
  },

  // Inscription
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  },

  // Connexion
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/login`, data);
    
    // Stockage du token et des données utilisateur
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Déconnexion
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Récupération du token
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Récupération des données utilisateur
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  },

  // Vérification si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Récupération du profil utilisateur depuis l'API
  getProfile: async (): Promise<User> => {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('Utilisateur non authentifié');
    }
    
    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.user;
  }
};

// Intercepteur pour ajouter le token aux requêtes
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authService; 