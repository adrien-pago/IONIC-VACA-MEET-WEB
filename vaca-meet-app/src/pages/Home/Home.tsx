import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  useIonRouter
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import './Home.css';

const Home: React.FC = () => {
  const [message, setMessage] = useState('');
  const authService = new AuthService();
  const router = useIonRouter();

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      if (!isAuthenticated) {
        router.push('/login', 'forward', 'replace');
        return;
      }

      // Test de l'API
      try {
        const response = await authService.test();
        if (response && response.message) {
          setMessage(response.message);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'API:', error);
        setMessage('Impossible de contacter l\'API.');
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login', 'forward', 'replace');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Accueil</IonTitle>
          <IonButton slot="end" fill="clear" onClick={handleLogout}>
            <IonIcon slot="icon-only" icon={logOutOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="home-container">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Bienvenue sur Vaca Meet !</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Vous êtes maintenant connecté à l'application.</p>
              {message && (
                <div className="api-message">
                  <strong>Message de l'API :</strong>
                  <p>{message}</p>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home; 