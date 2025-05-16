import api from './api';
import config from './config';
import { ThemeType } from '../context/ThemeContext';

export interface UserProfile {
  id: number;
  username: string; // Correspond à l'email en base de données
  firstName: string;
  lastName: string;
  email?: string;    // Alias pour username pour plus de clarté
  theme?: ThemeType;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  username?: string; // Correspond à l'email en base de données
  email?: string;    // Alias pour username pour plus de clarté
  currentPassword?: string;
  newPassword?: string;
  theme?: ThemeType;
}

export class ProfileService {
  /**
   * Récupérer les informations complètes du profil utilisateur
   */
  async getFullProfile(): Promise<UserProfile> {
    try {
      // Vérifier si le token existe
      const token = localStorage.getItem(config.storage.tokenKey);
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      // Configurer les en-têtes avec le token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Récupération du profil utilisateur...');
      console.log('URL utilisée:', `${config.api.baseUrl}${config.api.endpoints.userProfile}`);
      
      const response = await api.get(config.api.endpoints.userProfile);
      console.log('Réponse profil:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement du profil complet:', error);
      
      // Essayer avec l'endpoint de profil standard en cas d'échec
      try {
        const response = await api.get(config.api.endpoints.profile);
        console.log('Fallback réussi avec profile standard:', response.data);
        return response.data;
      } catch (fallbackError) {
        console.error('Échec du fallback profile:', fallbackError);
        throw error; // Rethrow the original error
      }
    }
  }

  /**
   * Mettre à jour les informations du profil utilisateur
   * @param data Les données à mettre à jour
   */
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      // Vérifier si le token existe
      const token = localStorage.getItem(config.storage.tokenKey);
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      // Configurer les en-têtes avec le token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Données brutes reçues pour mise à jour du profil:', data);
      
      // Préparation des données à envoyer (ne garder que les champs nécessaires)
      const cleanData: Record<string, string> = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        username: data.username || ''
      };
      
      if (data.theme) {
        cleanData['theme'] = data.theme;
      }
      
      console.log('Données nettoyées pour mise à jour du profil:', cleanData);
      console.log('URL complète de mise à jour du profil:', `${config.api.baseUrl}${config.api.endpoints.updateProfile}`);
      console.log('Token d\'authentification utilisé:', token.substring(0, 15) + '...');
      
      const response = await api.put(config.api.endpoints.updateProfile, cleanData);
      console.log('Réponse brute du serveur:', response);
      console.log('Réponse mise à jour profil (data):', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Erreur de requête (pas de réponse):', error.request);
      } else {
        console.error('Erreur:', error.message);
      }
      
      throw error;
    }
  }

  /**
   * Mettre à jour uniquement le thème de l'utilisateur
   * @param theme Le nouveau thème à appliquer
   */
  async updateTheme(theme: ThemeType): Promise<UserProfile> {
    try {
      // Vérifier si le token existe
      const token = localStorage.getItem(config.storage.tokenKey);
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      // Configurer les en-têtes avec le token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Mise à jour du thème:', theme);
      console.log('URL de mise à jour du thème:', `${config.api.baseUrl}${config.api.endpoints.updateTheme}`);
      
      // Utiliser l'endpoint spécifique pour la mise à jour du thème
      const response = await api.post(config.api.endpoints.updateTheme, { theme });
      console.log('Réponse mise à jour thème:', response.data);
      
      if (response.data && response.data.user) {
        return response.data.user;
      } else if (response.data && response.data.success) {
        // Créer un objet utilisateur minimal avec le thème mis à jour
        return {
          id: 0,
          username: '',
          firstName: '',
          lastName: '',
          theme: theme
        };
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du thème:', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      // On peut quand même continuer sans l'enregistrement du thème sur le serveur
      // On renvoie un objet minimal permettant de continuer
      const emergencyResponse: UserProfile = {
        id: 0,
        username: '',
        firstName: '',
        lastName: '',
        theme: theme
      };
      
      throw error;
    }
  }

  /**
   * Mettre à jour le mot de passe de l'utilisateur
   * @param currentPassword Mot de passe actuel
   * @param newPassword Nouveau mot de passe
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier si le token existe
      const token = localStorage.getItem(config.storage.tokenKey);
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      // Configurer les en-têtes avec le token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Mise à jour du mot de passe');
      console.log('URL de mise à jour du mot de passe:', `${config.api.baseUrl}${config.api.endpoints.updatePassword}`);
      
      try {
        // Essayer d'abord avec PUT (méthode standard)
        console.log('Tentative avec PUT...');
        const response = await api.put(config.api.endpoints.updatePassword, {
          currentPassword,
          newPassword
        });
        console.log('Réponse mise à jour mot de passe (PUT):', response.data);
        
        return response.data;
      } catch (putError: any) {
        // En cas d'erreur avec PUT, essayer avec POST
        console.log('Échec avec PUT, tentative avec POST...', putError.message);
        
        const response = await api.post(config.api.endpoints.updatePassword, {
          currentPassword,
          newPassword
        });
        console.log('Réponse mise à jour mot de passe (POST):', response.data);
        
        return response.data;
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur lors de la mise à jour du mot de passe:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('Erreur de requête (pas de réponse):', error.request);
      } else {
        console.error('Erreur:', error.message);
      }
      
      throw error;
    }
  }

  /**
   * Mettre à jour les informations du profil utilisateur (SQL direct)
   * @param data Les données à mettre à jour
   */
  async updateProfileDirect(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      // Vérifier si le token existe
      const token = localStorage.getItem(config.storage.tokenKey);
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      // Configurer les en-têtes avec le token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Données brutes reçues pour mise à jour directe du profil:', data);
      
      // Préparation des données à envoyer (ne garder que les champs nécessaires)
      const cleanData: Record<string, string> = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        username: data.username || ''
      };
      
      if (data.theme) {
        cleanData['theme'] = data.theme;
      }
      
      console.log('Données nettoyées pour mise à jour directe du profil:', cleanData);
      const directUrl = `${config.api.endpoints.updateProfile}/direct`;
      console.log('URL complète de mise à jour directe du profil:', `${config.api.baseUrl}${directUrl}`);
      console.log('Token d\'authentification utilisé:', token.substring(0, 15) + '...');
      
      const response = await api.put(directUrl, cleanData);
      console.log('Réponse brute du serveur (méthode directe):', response);
      console.log('Réponse mise à jour directe profil (data):', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour directe du profil:', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur (méthode directe):', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Erreur de requête (pas de réponse):', error.request);
      } else {
        console.error('Erreur:', error.message);
      }
      
      throw error;
    }
  }

  /**
   * Mettre à jour les informations du profil utilisateur mobile
   * @param data Les données à mettre à jour
   */
  async updateMobileProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      // Vérifier si le token existe
      const token = localStorage.getItem(config.storage.tokenKey);
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      // Configurer les en-têtes avec le token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Données brutes reçues pour mise à jour du profil mobile:', data);
      
      // Préparation des données à envoyer - IMPORTANT: ne jamais inclure username
      const cleanData: Record<string, string> = {};
      
      if (data.firstName) {
        cleanData.firstName = data.firstName;
      }
      
      if (data.lastName) {
        cleanData.lastName = data.lastName;
      }
      
      // Le username est intentionnellement omis pour respecter les contraintes du backend
      
      console.log('Données nettoyées pour mise à jour du profil mobile:', cleanData);
      console.log('URL complète de mise à jour du profil mobile:', `${config.api.baseUrl}${config.api.endpoints.updateMobileProfile}`);
      
      const response = await api.post(config.api.endpoints.updateMobileProfile, cleanData);
      console.log('Réponse du serveur pour mise à jour profil mobile:', response);
      
      if (response.data && response.data.user) {
        return response.data.user;
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil mobile:', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw error;
    }
  }
} 