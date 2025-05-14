import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonButton, 
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonAlert,
  useIonRouter
} from '@ionic/react';
import { AuthService } from '../../services/auth.service';
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const router = useIonRouter();
  const authService = new AuthService();

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      setAlertMessage('Veuillez remplir tous les champs obligatoires.');
      setShowAlert(true);
      return;
    }

    setShowLoading(true);

    try {
      if (isRegister) {
        const userData = {
          username,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined
        };
        await authService.register(userData);
        setAlertMessage('Inscription réussie !');
      } else {
        await authService.login({ username, password });
        setAlertMessage('Connexion réussie !');
      }
      
      setShowAlert(true);
      // Rediriger vers la page d'accueil après connexion
      setTimeout(() => {
        router.push('/home', 'forward', 'replace');
      }, 1000);
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      setAlertMessage(
        isRegister 
          ? 'Erreur lors de l\'inscription. Veuillez réessayer.' 
          : 'Identifiants incorrects. Veuillez réessayer.'
      );
      setShowAlert(true);
    } finally {
      setShowLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isRegister ? 'Inscription' : 'Connexion'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <div className="login-container">
                <h2 className="ion-text-center">{isRegister ? 'Créer un compte' : 'Se connecter'}</h2>
                
                <IonItem>
                  <IonLabel position="floating">Nom d'utilisateur</IonLabel>
                  <IonInput 
                    value={username} 
                    onIonChange={e => setUsername(e.detail.value!)} 
                    required
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Mot de passe</IonLabel>
                  <IonInput 
                    type="password" 
                    value={password} 
                    onIonChange={e => setPassword(e.detail.value!)} 
                    required
                  />
                </IonItem>

                {isRegister && (
                  <>
                    <IonItem>
                      <IonLabel position="floating">Prénom (optionnel)</IonLabel>
                      <IonInput 
                        value={firstName} 
                        onIonChange={e => setFirstName(e.detail.value!)}
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="floating">Nom (optionnel)</IonLabel>
                      <IonInput 
                        value={lastName} 
                        onIonChange={e => setLastName(e.detail.value!)}
                      />
                    </IonItem>
                  </>
                )}

                <IonButton 
                  expand="block" 
                  className="ion-margin-top" 
                  onClick={handleAuth}
                >
                  {isRegister ? 'S\'inscrire' : 'Se connecter'}
                </IonButton>

                <div className="ion-text-center ion-margin-top">
                  <IonButton fill="clear" onClick={toggleAuthMode}>
                    {isRegister ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
                  </IonButton>
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading
          isOpen={showLoading}
          message={'Veuillez patienter...'}
        />

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

export default Login; 