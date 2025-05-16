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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLoading,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonBadge,
  useIonRouter,
  IonAlert
} from '@ionic/react';
import { personCircleOutline, menu, logOutOutline, homeOutline, personOutline, peopleOutline, informationCircleOutline, calendarOutline, arrowBackOutline, arrowForwardOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { CampingService, CampingInfo } from '../../services/camping.service';
import GlassCard from '../../components/GlassCard';
import BackgroundEffects from '../../components/BackgroundEffects';
import './HomeCamping.css';
import { useParams } from 'react-router';

interface RouteParams {
  id: string;
}

const HomeCamping: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const [user, setUser] = useState<any>(null);
  const [campingInfo, setCampingInfo] = useState<CampingInfo | null>(null);
  const [showLoading, setShowLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [animation, setAnimation] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const router = useIonRouter();
  const authService = new AuthService();
  const campingService = new CampingService();

  useEffect(() => {
    const loadData = async () => {
      try {
        setShowLoading(true);
        
        // Charger le profil utilisateur
        const userData = await authService.getUserProfile();
        setUser(userData);
        
        // Charger les informations du camping
        const camping = await campingService.getCampingInfo(parseInt(id));
        setCampingInfo(camping);
        
        // Ajouter l'animation après un court délai
        setTimeout(() => {
          setAnimation('animate-slide-up');
        }, 100);
      } catch (error: any) {
        console.error('Erreur lors du chargement des données:', error);
        setToastMessage(error.message || 'Impossible de charger les données');
        setShowToast(true);
      } finally {
        setShowLoading(false);
      }
    };

    loadData();
    
    // Stocker l'information que l'utilisateur est sur la page HomeCamping avec l'ID du camping
    if (id) {
      const pageValue = `camping:${id}`;
      sessionStorage.setItem('lastPage', pageValue);
      
      // Stocker également dans localStorage pour plus de persistance
      localStorage.setItem('lastPage', pageValue);
      
      console.log('Page HomeCamping: lastPage défini à', pageValue);
    }
  }, [id]);

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    authService.logout();
    router.push('/login', 'root', 'replace');
  };

  const navigateToProfile = () => {
    setToastMessage('La page de profil sera disponible prochainement');
    setShowToast(true);
  };
  const navigateToInfoCamping = () => {
    setToastMessage('La page d\'informations du camping sera disponible prochainement');
    setShowToast(true);
  };

  const navigateBack = () => {
    router.push('/home');
  };
  
  const navigateToActivity = () => {
    router.push(`/activity-camping/${id}`);
  };

  return (
    <>
      <IonMenu contentId="camping-content" menuId="camping-menu">
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
            <IonMenuToggle menu="camping-menu">
              <IonItem routerLink="/home" button detail={false}>
                <IonIcon slot="start" icon={homeOutline} />
                <IonLabel>Accueil Vaca Meet</IonLabel>
              </IonItem>
            </IonMenuToggle>
            
            <IonMenuToggle menu="camping-menu">
            <IonItem button onClick={navigateToInfoCamping} detail={false}>
                <IonIcon slot="start" icon={informationCircleOutline} />
                <IonLabel>Infos Camping</IonLabel>
              </IonItem>
            </IonMenuToggle>
            
            <IonMenuToggle menu="camping-menu">
              <IonItem 
                button
                detail={false}
                onClick={() => {
                  // Stocker explicitement que l'on vient de la page HomeCamping avant de naviguer
                  const sourceValue = `camping:${id}`;
                  sessionStorage.setItem('accountPageSource', sourceValue);
                  localStorage.setItem('accountPageSource', sourceValue);
                  console.log('Navigation vers Account depuis HomeCamping, source définie:', sourceValue);
                  router.push('/account');
                }}
              >
                <IonIcon slot="start" icon={personOutline} />
                <IonLabel>Compte</IonLabel>
              </IonItem>
            </IonMenuToggle>
            
            <IonMenuToggle menu="camping-menu">
              <IonItem button onClick={handleLogout} detail={false} color="danger">
                <IonIcon slot="start" icon={logOutOutline} />
                <IonLabel>Déconnexion</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>
        </IonContent>
      </IonMenu>
      
      <IonPage id="camping-content">
        <BackgroundEffects variant="gradient" density="high" animate={false} useThemeColors={true} />
        
        <IonHeader className="ion-no-border transparent-header">
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton menu="camping-menu"></IonMenuButton>
            </IonButtons>
            <IonTitle className="camping-title">
              {campingInfo && <div className="camping-subtitle">{campingInfo.camping.name}</div>}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout} color="danger">
                <IonIcon slot="icon-only" icon={logOutOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        
        <IonContent fullscreen className="ion-padding camping-content">
          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="12" sizeMd="10" sizeLg="8" sizeXl="6">
                <div className={`welcome-container ${animation}`}>
                  <h1 className="camping-welcome-title">
                    Bienvenue au {campingInfo?.camping.name}
                  </h1>
                </div>
                
                {/* Carte des animations du camping avec lien vers ActivityCamping */}
                <GlassCard
                  color="primary"
                  className={`animations-card ${animation}`}
                  animated={false}
                  onClick={navigateToActivity}
                >
                  <div className="card-header-centered">
                    <h2 className="section-title">
                      <IonIcon icon={calendarOutline} /> Animations du camping
                    </h2>
                  </div>
                  
                  <div className="centered-button-container">
                    <IonButton 
                      fill="solid" 
                      shape="round"
                      onClick={(e) => {
                        e.stopPropagation(); // Empêche le déclenchement du onClick du GlassCard parent
                        navigateToActivity();
                      }}
                      className="centered-action-button"
                    >
                      Voir les activités que propose le camping
                      <IonIcon slot="end" icon={arrowForwardOutline} />
                    </IonButton>
                  </div>
                </GlassCard>
                
                {/* Carte des services du camping */}
                <GlassCard
                  color="secondary"
                  className={`services-card ${animation}`}
                  animated={false}
                >
                  <h2 className="section-title">
                    <IonIcon icon={informationCircleOutline} /> Services disponibles
                  </h2>
                  
                  {campingInfo && campingInfo.services.length > 0 ? (
                    <div className="services-grid">
                      {campingInfo.services.map(service => (
                        <div key={service.id} className="service-item">
                          <h3 className="service-name">{service.name}</h3>
                          <p className="service-description">{service.description}</p>
                          <div className="service-hours">
                            <span>Horaires: {service.hours}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data-container">
                      <p className="no-data-message">Aucun service disponible pour le moment.</p>
                    </div>
                  )}
                </GlassCard>
                
                {/* Carte des activités des vacanciers */}
                <GlassCard
                  color="tertiary"
                  className={`activities-card ${animation}`}
                  animated={false}
                >
                  <h2 className="section-title">
                    <IonIcon icon={peopleOutline} /> Activités des vacanciers
                  </h2>
                  
                  {campingInfo && campingInfo.activities.length > 0 ? (
                    <IonList lines="full" className="transparent-list">
                      {campingInfo.activities.map(activity => (
                        <IonItem key={activity.id} className="activity-item">
                          <div className="activity-content">
                            <div className="activity-header">
                              <h3 className="activity-title">{activity.title}</h3>
                              <IonBadge color="tertiary">{activity.participants} participants</IonBadge>
                            </div>
                            <p className="activity-description">{activity.description}</p>
                            <div className="activity-details">
                              <span className="activity-day">{activity.day}</span>
                              <span className="activity-time">{activity.time}</span>
                              <span className="activity-location">{activity.location}</span>
                            </div>
                          </div>
                        </IonItem>
                      ))}
                    </IonList>
                  ) : (
                    <div className="no-data-container">
                      <p className="no-data-message">Aucune activité organisée pour le moment.</p>
                    </div>
                  )}
                </GlassCard>
              </IonCol>
            </IonRow>
          </IonGrid>
          
          <IonLoading
            isOpen={showLoading}
            message="Chargement des informations..."
          />
          
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={3000}
            position="top"
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

export default HomeCamping; 