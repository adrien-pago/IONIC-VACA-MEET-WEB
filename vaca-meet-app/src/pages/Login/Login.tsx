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
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  useIonRouter
} from '@ionic/react';
import { settings, construct } from 'ionicons/icons';
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
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const router = useIonRouter();
  const authService = new AuthService();

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      setAlertMessage('Veuillez remplir tous les champs obligatoires.');
      setShowAlert(true);
      return;
    }

    setShowLoading(true);
    setErrorDetails(null);

    try {
      if (isRegister) {
        const userData = {
          username,
          password,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined
        };
        console.log("Envoi des données d'inscription:", userData);
        await authService.register(userData);
        setAlertMessage('Inscription réussie !');
      } else {
        console.log("Envoi des identifiants de connexion:", { username, password });
        await authService.login({ username, password });
        setAlertMessage('Connexion réussie !');
      }
      
      setShowAlert(true);
      // Rediriger vers la page d'accueil après connexion
      setTimeout(() => {
        router.push('/home', 'forward', 'replace');
      }, 1000);
    } catch (error: any) {
      console.error('Erreur d\'authentification complète:', error);
      
      // Récupérer le message d'erreur de l'API si disponible
      let errorMessage = isRegister 
        ? 'Erreur lors de l\'inscription. Veuillez réessayer.' 
        : 'Identifiants incorrects. Veuillez réessayer.';
      
      // Création d'un message d'erreur détaillé pour le débogage
      let detailedError = '';
      
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état hors de la plage 2xx
        detailedError = `Erreur serveur: ${error.response.status} ${error.response.statusText}\n`;
        
        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
            detailedError += `Message: ${error.response.data.message}\n`;
          }
          
          if (error.response.data.errors) {
            detailedError += `Erreurs: ${JSON.stringify(error.response.data.errors)}\n`;
          }
          
          detailedError += `Données: ${JSON.stringify(error.response.data)}`;
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion internet.';
        detailedError = 'La requête a été envoyée mais aucune réponse n\'a été reçue du serveur.\n';
        detailedError += 'Cela peut être dû à une connexion internet instable ou à un problème de configuration du serveur.';
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        errorMessage = `Erreur lors de la configuration de la requête: ${error.message}`;
        detailedError = `Erreur lors de la configuration: ${error.message}`;
      }
      
      setAlertMessage(errorMessage);
      setErrorDetails(detailedError);
      setShowAlert(true);
    } finally {
      setShowLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setErrorDetails(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isRegister ? 'Inscription' : 'Connexion'}</IonTitle>
          <IonButton slot="end" fill="clear" routerLink="/api-test">
            <IonIcon slot="icon-only" icon={construct} />
          </IonButton>
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
                
                {errorDetails && (
                  <>
                    <IonCard className="error-debug-card">
                      <IonCardContent>
                        <div className="ion-margin-bottom ion-text-center">
                          <IonButton fill="outline" size="small" routerLink="/api-test" color="medium">
                            <IonIcon slot="start" icon={settings} />
                            Diagnostiquer la connexion API
                          </IonButton>
                        </div>
                        <h3>Détails de l'erreur (Debug):</h3>
                        <IonText color="danger" className="error-details">
                          <pre>{errorDetails}</pre>
                        </IonText>
                      </IonCardContent>
                    </IonCard>
                  </>
                )}
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