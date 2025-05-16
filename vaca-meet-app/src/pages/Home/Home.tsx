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
  IonMenu,
  IonList,
  IonMenuButton,
  IonMenuToggle,
  useIonRouter
} from '@ionic/react';
import { personCircleOutline, menu, logOutOutline, arrowForwardOutline, homeOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import api from '../../services/api';
import config from '../../services/config';
import AnimatedInput from '../../components/AnimatedInput';
import AnimatedButton from '../../components/AnimatedButton';
import GlassCard from '../../components/GlassCard';
import BackgroundEffects from '../../components/BackgroundEffects';
import './Home.css';

interface Destination {
  id: number;
  username: string;
}

interface DestinationDetail {
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
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const router = useIonRouter();
  const authService = new AuthService();

  // Définir fetchDestinations en dehors du useEffect pour pouvoir l'appeler ailleurs
  const fetchDestinations = async () => {
    try {
      setShowLoading(true);
      console.log('Chargement des destinations...');
      
      const response = await api.get(config.api.endpoints.destinations);
      console.log('Réponse API destinations brute:', response);
      
      if (response.data && Array.isArray(response.data.destinations)) {
        // Vérifier que chaque destination a un id et un username
        const validDestinations = response.data.destinations.filter(
          (dest: any) => dest && dest.id && dest.username
        );
        
        if (validDestinations.length === 0) {
          console.warn('Aucune destination valide trouvée dans la réponse:', response.data.destinations);
          throw new Error('Aucune destination valide trouvée');
        }
        
        console.log('Destinations valides:', validDestinations);
        setDestinations(validDestinations);
        
        if (validDestinations.length !== response.data.destinations.length) {
          console.warn(
            `Attention: ${response.data.destinations.length - validDestinations.length} destinations invalides ont été filtrées`
          );
        }
      } else {
        console.error('Format de réponse invalide ou aucune destination:', response.data);
        throw new Error('Format de réponse invalide ou aucune destination trouvée');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des destinations:', error);
      
      // Afficher un message d'erreur à l'utilisateur
      let errorMessage = 'Impossible de charger les destinations. Veuillez vérifier votre connexion et réessayer.';
      
      if (error.response) {
        console.error('Détails de l\'erreur de réponse:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error('Erreur de requête (pas de réponse):', error.request);
        errorMessage = 'Le serveur n\'a pas répondu. Veuillez vérifier votre connexion internet.';
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      setToastMessage(errorMessage);
      setShowToast(true);
      setDestinations([]);
    } finally {
      setShowLoading(false);
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setShowLoading(true);
        const userData = await authService.getUserProfile();
        setUser(userData);
        console.log('Profil utilisateur chargé:', userData);
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setToastMessage('Impossible de charger votre profil');
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
    
    // Stocker l'information que l'utilisateur est sur la page Home
    const pageValue = 'home';
    sessionStorage.setItem('lastPage', pageValue);
    localStorage.setItem('lastPage', pageValue);
    console.log('Page Home: lastPage défini à "home" (session et local)');
  }, []);

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    authService.logout();
    router.push('/login', 'root', 'replace');
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
      
      // Appel à l'API pour vérifier le mot de passe
      const response = await api.post(config.api.endpoints.verifyPassword, {
        destinationId: selectedDestination,
        password: vacationPassword
      });
      
      if (response.data && response.data.valid) {
        // Naviguer vers la page du camping
        router.push(`/camping/${selectedDestination}`);
      } else {
        setPasswordError('Mot de passe incorrect');
      }
    } catch (error: any) {
      console.error('Erreur lors de la vérification du mot de passe:', error);
      
      // Afficher un message d'erreur spécifique si disponible
      if (error.response && error.response.data && error.response.data.message) {
        setPasswordError(error.response.data.message);
      } else {
        setPasswordError('Mot de passe incorrect');
      }
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <>
      <IonMenu contentId="main-content" menuId="home-menu">
        <IonHeader>
          <IonToolbar className="menu-toolbar">
            <IonTitle className="ion-text-center">Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="menu-content">
          <div className="menu-header">
            <div className="menu-avatar">
              <IonIcon icon={personCircleOutline} />
            </div>
            <h2>{user?.firstName} {user?.lastName}</h2>
            <p>{user?.username}</p>
          </div>
          
          <IonList>
            <IonMenuToggle menu="home-menu">
              <IonItem routerLink="/home" detail={false}>
                <IonIcon slot="start" icon={homeOutline} />
                <IonLabel>Accueil Vaca Meet</IonLabel>
              </IonItem>
            </IonMenuToggle>
            
            <IonMenuToggle menu="home-menu">
              <IonItem 
                button
                detail={false}
                onClick={() => {
                  // Stocker explicitement que l'on vient de la page Home avant de naviguer
                  const sourceValue = 'home';
                  sessionStorage.setItem('accountPageSource', sourceValue);
                  localStorage.setItem('accountPageSource', sourceValue);
                  console.log('Navigation vers Account depuis Home, source définie:', sourceValue);
                  router.push('/account');
                }}
              >
                <IonIcon slot="start" icon={personOutline} />
                <IonLabel>Compte</IonLabel>
              </IonItem>
            </IonMenuToggle>
            
            <IonMenuToggle menu="home-menu">
              <IonItem button onClick={handleLogout} detail={false} color="danger">
                <IonIcon slot="start" icon={logOutOutline} />
                <IonLabel>Déconnexion</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>
        </IonContent>
      </IonMenu>
      
      <IonPage id="main-content">
        <BackgroundEffects variant="gradient" density="high" animate={false} useThemeColors={true} />
        
        <IonHeader className="ion-no-border transparent-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton menu="home-menu"></IonMenuButton>
            </IonButtons>
            <IonTitle className="user-name-title">
              {user?.firstName} {user?.lastName}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout} color="danger">
                <IonIcon slot="icon-only" icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent fullscreen className="ion-padding home-content">
          <IonGrid className="full-height">
            <IonRow className="ion-justify-content-center ion-align-items-center">
              <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="5">
                <div className={`welcome-container ${animation}`}>
                  <h1 className="welcome-title">Vaca Meet</h1>
                </div>
                
                <GlassCard
                  color="tertiary"
                  className={`destination-card ${animation}`}
                  animated={false}
                >
                  <h2 className="section-title">Choisissez votre destination</h2>
                  
                  <div className="destination-form">
                    {destinations.length > 0 ? (
                      <>
                        <div className="form-spacer"></div>
                        <IonItem className="custom-select" lines="none">
                          <IonSelect 
                            interface="popover" 
                            cancelText="Annuler"
                            placeholder="Sélectionnez une destination"
                            onIonChange={handleDestinationSelection}
                            className="destination-select"
                            interfaceOptions={{
                              cssClass: 'select-popover'
                            }}
                            style={{ width: '100%' }}
                          >
                            {destinations.map((destination) => (
                              <IonSelectOption key={destination.id} value={destination.id}>
                                {destination.username}
                              </IonSelectOption>
                            ))}
                          </IonSelect>
                        </IonItem>
                        
                        <AnimatedInput
                          label="Mot de passe"
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
                      </>
                    ) : (
                      <div className="no-destinations">
                        <p className="no-data-message">Aucune destination disponible pour le moment.</p>
                        <AnimatedButton onClick={() => fetchDestinations()} color="primary">
                          Actualiser
                        </AnimatedButton>
                      </div>
                    )}
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
            header="Attention"
            message={alertMessage}
            buttons={['OK']}
          />
          
          <IonAlert
            isOpen={showLogoutAlert}
            onDidDismiss={() => setShowLogoutAlert(false)}
            header="Déconnexion"
            message="Voulez-vous vraiment vous déconnecter ?"
            cssClass="logout-alert"
            buttons={[
              {
                text: 'Non',
                role: 'cancel',
                cssClass: 'secondary'
              },
              {
                text: 'Oui',
                handler: confirmLogout,
                cssClass: 'primary'
              }
            ]}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default Home; 