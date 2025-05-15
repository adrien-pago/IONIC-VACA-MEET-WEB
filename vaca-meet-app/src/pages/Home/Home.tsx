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
  IonLoading,
  IonText,
  IonItem,
  IonLabel,
  IonAvatar,
  useIonRouter
} from '@ionic/react';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import './Home.css';

interface UserProfile {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  
  const authService = new AuthService();
  const router = useIonRouter();

  useEffect(() => {
    // Vérifier l'authentification et charger les données utilisateur
    const loadData = async () => {
      setLoading(true);
      try {
        const isAuthenticated = authService.isAuthenticated();
        if (!isAuthenticated) {
          router.push('/login', 'forward', 'replace');
          return;
        }

        // Charger le profil utilisateur
        try {
          const userProfile = await authService.getUserProfile();
          setProfile(userProfile);
        } catch (profileError) {
          console.error('Erreur lors du chargement du profil:', profileError);
          setError('Impossible de charger les informations du profil.');
        }

        // Test de l'API
        try {
          const response = await authService.test();
          if (response && response.message) {
            setApiStatus(response.message);
          }
        } catch (apiError) {
          console.error('Erreur lors de la vérification de l\'API:', apiError);
          setApiStatus('Impossible de contacter l\'API.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
        <IonLoading isOpen={loading} message={'Chargement...'} />
        
        {!loading && (
          <div className="home-container">
            {error && (
              <IonCard color="danger">
                <IonCardContent>
                  <IonText color="light">{error}</IonText>
                </IonCardContent>
              </IonCard>
            )}
            
            {profile && (
              <IonCard className="profile-card">
                <IonCardHeader>
                  <div className="profile-header">
                    <IonAvatar className="profile-avatar">
                      <IonIcon icon={personCircleOutline} size="large" />
                    </IonAvatar>
                    <IonCardTitle>Bienvenue {profile.firstName || profile.username} !</IonCardTitle>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonLabel>
                      <h2>Informations du compte</h2>
                      <p><strong>Nom d'utilisateur:</strong> {profile.username}</p>
                      {profile.firstName && <p><strong>Prénom:</strong> {profile.firstName}</p>}
                      {profile.lastName && <p><strong>Nom:</strong> {profile.lastName}</p>}
                      {profile.email && <p><strong>Email:</strong> {profile.email}</p>}
                    </IonLabel>
                  </IonItem>
                </IonCardContent>
              </IonCard>
            )}
            
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>État de l'API</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>{apiStatus || 'Vérification de l\'état de l\'API...'}</p>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home; 