import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonThumbnail,
  useIonViewWillEnter
} from '@ionic/react';
import { add, logOut, personCircle } from 'ionicons/icons';
import { authService, User } from '../../services/authService';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<User | null>(null);

  useIonViewWillEnter(() => {
    // Vérifier si l'utilisateur est connecté
    if (!authService.isAuthenticated()) {
      history.replace('/login');
      return;
    }

    // Récupérer les informations de l'utilisateur connecté
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  });

  const handleLogout = () => {
    authService.logout();
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Accueil</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon slot="icon-only" icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user && (
          <div className="welcome-container">
            <IonIcon icon={personCircle} className="profile-icon" />
            <h2>Bonjour, {user.firstName || user.email}</h2>
            <p>Bienvenue sur Vaca Meet</p>
          </div>
        )}

        <IonCard className="stats-card">
          <IonCardHeader>
            <IonCardTitle>Tableau de bord</IonCardTitle>
            <IonCardSubtitle>Votre activité</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="stats-container">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Rencontres créées</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Participants</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">À venir</div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        <div className="section-header">
          <h3>Rencontres à venir</h3>
          <IonButton fill="clear" routerLink="/meet-form">
            <IonIcon slot="start" icon={add} />
            Créer
          </IonButton>
        </div>

        <IonList className="meetings-list">
          <IonItem detail={true} lines="full" className="empty-list-message">
            <IonLabel>
              <h2>Aucune rencontre prévue</h2>
              <p>Créez votre première rencontre pour commencer</p>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home; 