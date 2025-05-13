import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// TEMPORAIRE: Configuration pour une utilisation sans backend
const MOCK_USER = {
  id: 1,
  email: "demo@exemple.com",
  firstName: "Jean",
  lastName: "Dupont"
};

const MOCK_TOKEN = "mock_jwt_token_for_development_only";

const AuthService = {
  /**
   * Connecte un utilisateur avec ses identifiants
   */
  login: async (credentials: LoginCredentials) => {
    try {
      // TEMPORAIRE: Version locale sans appel API
      console.log("Connexion avec:", credentials);
      
      // Simulation d'une vérification basique
      if (credentials.email && credentials.password) {
        // Stocker le token fictif
        localStorage.setItem('token', MOCK_TOKEN);
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        
        return {
          token: MOCK_TOKEN,
          user: MOCK_USER
        };
      } else {
        throw new Error("Email ou mot de passe manquant");
      }
      
      /* Version réelle avec API (à décommenter une fois l'API prête)
      const response = await api.post<AuthResponse>('/login_check', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
      */
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    }
  },

  /**
   * Inscrit un nouvel utilisateur
   */
  register: async (userData: RegisterData) => {
    try {
      // TEMPORAIRE: Version locale sans appel API
      console.log("Inscription avec:", userData);
      
      // Simulation de succès
      const mockResponse = {
        token: MOCK_TOKEN,
        user: {
          id: 1,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      };
      
      return mockResponse;
      
      /* Version réelle avec API (à décommenter une fois l'API prête)
      const response = await api.post<AuthResponse>('/register', userData);
      return response.data;
      */
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    }
  },

  /**
   * Déconnecte l'utilisateur en supprimant son token
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Vérifie si l'utilisateur est actuellement connecté
   */
  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  },

  /**
   * Récupère le profil de l'utilisateur actuel
   */
  getUserProfile: async () => {
    try {
      // TEMPORAIRE: Version locale sans appel API
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      
      return MOCK_USER;
      
      /* Version réelle avec API (à décommenter une fois l'API prête)
      const response = await api.get('/user/profile');
      return response.data;
      */
    } catch (error) {
      console.error("Erreur de récupération du profil:", error);
      throw error;
    }
  }
};

export default AuthService; 