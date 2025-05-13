import { FormEvent } from 'react';
import AuthService, { RegisterData } from '../../services/authService';

/**
 * Gère la soumission du formulaire d'inscription
 * @param event L'événement de soumission du formulaire
 * @param userData Les données d'inscription de l'utilisateur
 * @param confirmPassword Le mot de passe de confirmation
 * @param onSuccess Callback appelé en cas de succès
 * @param onError Callback appelé en cas d'erreur avec le message d'erreur
 */
export const handleSubmit = async (
  event: FormEvent,
  userData: RegisterData,
  confirmPassword: string,
  onSuccess: () => void,
  onError: (message: string) => void
) => {
  event.preventDefault();
  
  // Validation basique
  if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
    onError('Veuillez remplir tous les champs obligatoires');
    return;
  }

  // Vérification de la correspondance des mots de passe
  if (userData.password !== confirmPassword) {
    onError('Les mots de passe ne correspondent pas');
    return;
  }

  try {
    await AuthService.register(userData);
    onSuccess();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Échec de l\'inscription';
    onError(errorMessage);
  }
};

/**
 * Gère les changements dans les champs du formulaire
 * @param e L'événement de changement
 * @param setUserData Fonction pour mettre à jour les données utilisateur
 * @param currentUserData Les données utilisateur actuelles
 */
export const handleInputChange = (
  e: any,
  setUserData: (data: RegisterData) => void,
  currentUserData: RegisterData
) => {
  const { name, value } = e.target;
  setUserData({
    ...currentUserData,
    [name]: value
  });
}; 