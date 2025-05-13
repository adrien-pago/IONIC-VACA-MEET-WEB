import { FormEvent } from 'react';
import AuthService, { LoginCredentials } from '../../services/authService';

/**
 * Gère la soumission du formulaire de connexion
 * @param event L'événement de soumission du formulaire
 * @param credentials Les identifiants de connexion
 * @param onSuccess Callback appelé en cas de succès
 * @param onError Callback appelé en cas d'erreur avec le message d'erreur
 */
export const handleSubmit = async (
  event: FormEvent,
  credentials: LoginCredentials,
  onSuccess: () => void,
  onError: (message: string) => void
) => {
  event.preventDefault();
  
  // Validation basique
  if (!credentials.email || !credentials.password) {
    onError('Veuillez remplir tous les champs');
    return;
  }

  try {
    await AuthService.login(credentials);
    onSuccess();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Échec de la connexion';
    onError(errorMessage);
  }
};

/**
 * Gère les changements dans les champs du formulaire
 * @param e L'événement de changement
 * @param setCredentials Fonction pour mettre à jour les identifiants
 * @param currentCredentials Les identifiants actuels
 */
export const handleInputChange = (
  e: any,
  setCredentials: (creds: LoginCredentials) => void,
  currentCredentials: LoginCredentials
) => {
  const { name, value } = e.target;
  setCredentials({
    ...currentCredentials,
    [name]: value
  });
}; 