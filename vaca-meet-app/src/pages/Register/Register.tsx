import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonText,
  IonLoading,
  IonRouterLink
} from '@ionic/react';
import { RegisterData } from '../../services/authService';
import { handleSubmit, handleInputChange } from './RegisterEvents';
import './Register.css';
import '../../styles/global.css';
import { useHistory } from 'react-router-dom';
import { authService, RegisterRequest } from '../../services/authService';

const Register: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: CustomEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation des champs
      if (!formData.email || !formData.password) {
        throw new Error('Email et mot de passe sont requis');
      }

      // Appel au service d'authentification
      await authService.register(formData);
      
      // Redirection vers la page de connexion après inscription réussie
      history.push('/login');
    } catch (err: any) {
      let errorMessage = "Erreur lors de l'inscription";
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inscription</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-heading">
            <h1>Créer un compte</h1>
            <p>Rejoignez-nous pour organiser vos rencontres</p>
          </div>

          {error && (
            <IonText color="danger" className="error-message">
              <p>{error}</p>
            </IonText>
          )}

          <IonItem className="form-input">
            <IonLabel position="floating">Email *</IonLabel>
            <IonInput
              type="email"
              name="email"
              value={formData.email}
              onIonChange={handleChange}
              required
            />
          </IonItem>

          <IonItem className="form-input">
            <IonLabel position="floating">Mot de passe *</IonLabel>
            <IonInput
              type="password"
              name="password"
              value={formData.password}
              onIonChange={handleChange}
              required
            />
          </IonItem>

          <IonItem className="form-input">
            <IonLabel position="floating">Prénom</IonLabel>
            <IonInput
              type="text"
              name="firstName"
              value={formData.firstName}
              onIonChange={handleChange}
            />
          </IonItem>

          <IonItem className="form-input">
            <IonLabel position="floating">Nom</IonLabel>
            <IonInput
              type="text"
              name="lastName"
              value={formData.lastName}
              onIonChange={handleChange}
            />
          </IonItem>

          <IonButton 
            expand="block" 
            type="submit" 
            className="register-button"
          >
            S'inscrire
          </IonButton>

          <div className="login-link">
            <p>
              Déjà un compte?{' '}
              <IonRouterLink routerLink="/login">
                Se connecter
              </IonRouterLink>
            </p>
          </div>
        </form>
        
        <IonLoading 
          isOpen={loading} 
          message="Inscription en cours..." 
          duration={10000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register; 