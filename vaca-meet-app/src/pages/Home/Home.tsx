import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonButton,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonLoading,
  useIonRouter
} from '@ionic/react';
import { personCircleOutline, settingsOutline, logOutOutline, arrowForwardOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import api from '../../services/api';
import AnimatedInput from '../../components/AnimatedInput';
import AnimatedButton from '../../components/AnimatedButton';
import GlassCard from '../../components/GlassCard';
import BackgroundEffects from '../../components/BackgroundEffects';
import './Home.css';

interface Destination {
  id: number;
  username: string;
}

const Home: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<number | null>(null);
  const [vacationPassword, setVacationPassword] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [animation, setAnimation] = useState('');

  const router = useIonRouter();
  const authService = new AuthService();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setShowLoading(true);
        const userData = await authService.getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setToastMessage('Impossible de charger votre profil');
        setShowToast(true);
      } finally {
        setShowLoading(false);
      }
    };

    const fetchDestinations = async () => {
      try {
        setShowLoading(true);
        const response = await api.get('/api/mobile/destinations');
        if (response.data && response.data.destinations) {
          setDestinations(response.data.destinations);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des destinations:', error);
        setToastMessage('Impossible de charger les destinations');
        setShowToast(true);
      } finally {
        setShowLoading(false);
      }
    };

    loadUserProfile();
    fetchDestinations();
    
    // Ajouter l'animation après un court délai
    setTimeout(() => {
      setAnimation('animate-slide-up');
    }, 100);
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/login', 'root', 'replace');
  };

  const navigateToProfile = () => {
    router.push('/profile');
  };

  const handleDestinationSelection = (event: CustomEvent) => {
    setSelectedDestination(event.detail.value);
    setPasswordError('');
  };

  const handlePasswordChange = (event: CustomEvent) => {
    setVacationPassword(event.detail.value);
    setPasswordError('');
  };

  const verifyVacationPassword = async () => {
    if (!selectedDestination) {
      setAlertMessage('Veuillez sélectionner une destination');
      setShowAlert(true);
      return;
    }

    if (!vacationPassword.trim()) {
      setPasswordError('Veuillez entrer le mot de passe');
      return;
    }

    try {
      setShowLoading(true);
      const response = await api.post('/api/mobile/verify-password', {
        userId: selectedDestination,
        vacationPassword
      });

      if (response.data && response.data.success) {
        setToastMessage('Mot de passe correct ! Redirection...');
        setShowToast(true);
        
        // Rediriger vers la page du camping après un court délai
        setTimeout(() => {
          router.push('/camping-home');
        }, 1500);
      } else {
        setPasswordError('Mot de passe incorrect');
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification du mot de passe:', error);
      setPasswordError('Mot de passe incorrect');
      
      if (error.response && error.response.data && error.response.data.message) {
        setToastMessage(error.response.data.message);
      } else {
        setToastMessage('Erreur lors de la vérification du mot de passe');
      }
      setShowToast(true);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <BackgroundEffects variant="gradient" density="medium" />
      
      <IonHeader className="ion-no-border transparent-header">
        <IonToolbar>
          <div className="user-profile-header">
            <div className="user-avatar">
              <IonIcon icon={personCircleOutline} />
            </div>
            <div className="user-info">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p>{user?.username}</p>
            </div>
          </div>
          
          <IonButtons slot="end">
            <IonButton onClick={navigateToProfile}>
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
            <IonButton onClick={handleLogout}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding home-content">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <div className={`welcome-container ${animation}`}>
                <h1 className="welcome-title">Bienvenue sur Vaca Meet</h1>
                <p className="welcome-subtitle">Votre compagnon de vacances idéal</p>
              </div>
              
              <GlassCard
                color="tertiary"
                className={`destination-card ${animation}`}
                animated={false}
              >
                <h2 className="section-title">Choisissez votre destination</h2>
                
                <div className="destination-form">
                  <IonItem className="custom-select" lines="none">
                    <IonLabel position="stacked">Destination</IonLabel>
                    <IonSelect 
                      interface="action-sheet" 
                      cancelText="Annuler"
                      placeholder="Sélectionnez une destination"
                      onIonChange={handleDestinationSelection}
                    >
                      {destinations.map((destination) => (
                        <IonSelectOption key={destination.id} value={destination.id}>
                          {destination.username}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                  
                  <AnimatedInput
                    label="Mot de passe pour cette destination"
                    name="vacationPassword"
                    type="password"
                    value={vacationPassword}
                    onChange={handlePasswordChange}
                    required
                    errorMessage={passwordError}
                  />
                  
                  <div className="form-actions">
                    <AnimatedButton onClick={verifyVacationPassword} icon={arrowForwardOutline}>
                      Let's Go
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        
        <IonLoading
          isOpen={showLoading}
          message="Veuillez patienter..."
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
        />
        
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Information"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home; 