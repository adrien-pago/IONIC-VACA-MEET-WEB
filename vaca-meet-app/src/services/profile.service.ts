import api from './api';
import config from './config';
import { ThemeType } from '../context/ThemeContext';

export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  theme?: ThemeType;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  username?: string;
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
      
      console.log('Mise à jour du profil:', data);
      console.log('URL de mise à jour du profil:', `${config.api.baseUrl}${config.api.endpoints.updateProfile}`);
      
      // Préparation des données à envoyer (ne garder que les champs nécessaires)
      const cleanData = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username
      };
      
      const response = await api.put(config.api.endpoints.updateProfile, cleanData);
      console.log('Réponse mise à jour profil:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data
        });
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
      console.log('URL de mise à jour du thème:', `${config.api.baseUrl}${config.api.endpoints.updateProfile}`);
      
      const response = await api.put(config.api.endpoints.updateProfile, { theme });
      console.log('Réponse mise à jour thème:', response.data);
      
      return response.data;
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
      const response = await api.put(config.api.endpoints.updatePassword, {
        currentPassword,
        newPassword
      });
      console.log('Réponse mise à jour mot de passe:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  }
} 