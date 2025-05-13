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
import { LoginCredentials } from '../../services/authService';
import { handleSubmit, handleInputChange } from './LoginEvents';
import './Login.css';
import '../../styles/global.css';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useIonRouter();

  const onLoginSuccess = () => {
    router.push('/home');
  };

  const onLoginError = (message: string) => {
    setErrorMessage(message);
    setShowAlert(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding login-container">
        <h2 className="login-title">Connectez-vous à votre compte</h2>
        
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6" offsetMd="3">
              <div className="login-form-container fade-in">
                <form onSubmit={(e) => handleSubmit(e, credentials, onLoginSuccess, onLoginError)}>
                  <IonItem className="login-input">
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput 
                      type="email" 
                      name="email" 
                      value={credentials.email} 
                      onIonChange={(e) => handleInputChange(e, setCredentials, credentials)}
                      required
                    />
                  </IonItem>
                  
                  <IonItem className="login-input">
                    <IonLabel position="floating">Mot de passe</IonLabel>
                    <IonInput 
                      type="password" 
                      name="password" 
                      value={credentials.password} 
                      onIonChange={(e) => handleInputChange(e, setCredentials, credentials)}
                      required
                    />
                  </IonItem>
                  
                  <IonButton 
                    expand="block" 
                    type="submit" 
                    className="login-button"
                  >
                    Se connecter
                  </IonButton>
                </form>
                
                <div className="login-register-link">
                  <IonButton expand="block" fill="clear" routerLink="/register">
                    Pas encore de compte ? S'inscrire
                  </IonButton>
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Erreur'}
          message={errorMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login; 