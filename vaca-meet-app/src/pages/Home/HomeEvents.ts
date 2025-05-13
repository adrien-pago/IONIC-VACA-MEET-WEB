import { MouseEvent } from 'react';
import AuthService from '../../services/authService';

/**
 * Gestionnaire d'événement pour la déconnexion
 * @param event L'événement de clic
 * @param onLogoutSuccess Callback appelé après une déconnexion réussie
 */
export const handleLogout = (
  event: MouseEvent<HTMLIonButtonElement>,
  onLogoutSuccess: () => void
) => {
  event.preventDefault();
  AuthService.logout();
  onLogoutSuccess();
};

/**
 * Fonction pour charger le profil utilisateur
 * @param onSuccess Callback appelé en cas de succès avec les données utilisateur
 * @param onError Callback appelé en cas d'erreur avec le message d'erreur
 */
export const fetchUserProfile = async (
  onSuccess: (userData: any) => void,
  onError: (errorMessage: string) => void
) => {
  try {
    if (AuthService.isAuthenticated()) {
      const userData = await AuthService.getUserProfile();
      onSuccess(userData);
    }
  } catch (err) {
    onError('Impossible de charger votre profil');
  }
}; 