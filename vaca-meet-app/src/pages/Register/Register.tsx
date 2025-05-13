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
  useIonRouter
} from '@ionic/react';
import { RegisterData } from '../../services/authService';
import { handleSubmit, handleInputChange } from './RegisterEvents';
import './Register.css';
import '../../styles/global.css';

const Register: React.FC = () => {
  const [userData, setUserData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const router = useIonRouter();

  const onRegisterSuccess = () => {
    // Afficher un message de succès puis rediriger vers la page de connexion
    setAlertMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    setShowAlert(true);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  const onRegisterError = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inscription</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding register-container">
        <h2 className="register-title">Créez votre compte</h2>
        
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6" offsetMd="3">
              <div className="register-form-container fade-in">
                <form onSubmit={(e) => handleSubmit(e, userData, confirmPassword, onRegisterSuccess, onRegisterError)}>
                  <IonRow className="register-name-row">
                    <IonCol>
                      <IonItem className="register-input">
                        <IonLabel position="floating">Prénom</IonLabel>
                        <IonInput 
                          type="text" 
                          name="firstName" 
                          value={userData.firstName} 
                          onIonChange={(e) => handleInputChange(e, setUserData, userData)}
                          required
                        />
                      </IonItem>
                    </IonCol>
                    <IonCol>
                      <IonItem className="register-input">
                        <IonLabel position="floating">Nom</IonLabel>
                        <IonInput 
                          type="text" 
                          name="lastName" 
                          value={userData.lastName} 
                          onIonChange={(e) => handleInputChange(e, setUserData, userData)}
                          required
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                  
                  <IonItem className="register-input">
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput 
                      type="email" 
                      name="email" 
                      value={userData.email} 
                      onIonChange={(e) => handleInputChange(e, setUserData, userData)}
                      required
                    />
                  </IonItem>
                  
                  <IonItem className="register-input">
                    <IonLabel position="floating">Mot de passe</IonLabel>
                    <IonInput 
                      type="password" 
                      name="password" 
                      value={userData.password} 
                      onIonChange={(e) => handleInputChange(e, setUserData, userData)}
                      required
                    />
                  </IonItem>
                  
                  <IonItem className="register-input">
                    <IonLabel position="floating">Confirmer le mot de passe</IonLabel>
                    <IonInput 
                      type="password" 
                      value={confirmPassword} 
                      onIonChange={(e) => setConfirmPassword(e.detail.value || '')}
                      required
                    />
                  </IonItem>
                  
                  <IonButton 
                    expand="block" 
                    type="submit" 
                    className="register-button"
                  >
                    S'inscrire
                  </IonButton>
                </form>
                
                <div className="register-login-link">
                  <IonButton expand="block" fill="clear" routerLink="/login">
                    Déjà un compte ? Se connecter
                  </IonButton>
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Information'}
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Register; 