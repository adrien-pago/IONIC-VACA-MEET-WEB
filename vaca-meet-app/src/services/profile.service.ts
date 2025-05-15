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
      const response = await api.get(config.api.endpoints.userProfile);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du chargement du profil complet:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les informations du profil utilisateur
   * @param data Les données à mettre à jour
   */
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await api.put(config.api.endpoints.updateProfile, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour uniquement le thème de l'utilisateur
   * @param theme Le nouveau thème à appliquer
   */
  async updateTheme(theme: ThemeType): Promise<UserProfile> {
    try {
      const response = await api.put(config.api.endpoints.updateProfile, { theme });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du thème:', error);
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
      const response = await api.put(config.api.endpoints.updatePassword, {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  }
} 