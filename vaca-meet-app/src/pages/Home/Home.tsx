import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonToast
} from '@ionic/react';
import AuthService from '../../services/authService';
import { handleLogout, fetchUserProfile } from './HomeEvents';
import './Home.css';
import '../../styles/global.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  // TEMPORAIRE: Désactivé pour éviter le chargement infini tant que l'API n'est pas disponible
  /*
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      await fetchUserProfile(
        (userData) => setUser(userData),
        (errorMsg) => {
          setError(errorMsg);
          setShowToast(true);
        }
      );
      setLoading(false);
    };

    loadUserProfile();
  }, []);
  */

  // Simulation d'un chargement rapide
  useEffect(() => {
    setLoading(true);
    // Simuler un délai court
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogoutSuccess = () => {
    setUser(null);
  };

  // Fonction temporaire pour simuler une connexion - à supprimer quand l'API sera prête
  const simulateLogin = () => {
    setUser({
      email: 'utilisateur@exemple.com',
      firstName: 'John',
      lastName: 'Doe'
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Accueil - Vaca Meet</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding home-container">
        <IonLoading isOpen={loading} message="Chargement..." />

        {!AuthService.isAuthenticated() && !user ? (
          <div className="text-center fade-in">
            <h2 className="home-title">Bienvenue sur Vaca Meet!</h2>
            <p className="home-subtitle">Connectez-vous ou inscrivez-vous pour commencer à organiser des rencontres.</p>
            
            <div className="home-button-container">
              <IonButton routerLink="/login" expand="block" className="ion-margin-bottom">
                Se connecter
              </IonButton>
              <IonButton routerLink="/register" expand="block" color="secondary">
                S'inscrire
              </IonButton>
              
              {/* Bouton temporaire pour tester l'interface sans backend */}
              <IonButton expand="block" color="tertiary" onClick={simulateLogin} className="ion-margin-top">
                Simuler une connexion
              </IonButton>
            </div>
          </div>
        ) : (
          <div className="fade-in">
            <IonCard className="home-welcome-card">
              <IonCardHeader>
                <IonCardTitle>Bonjour, {user?.firstName || 'utilisateur'} !</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>Bienvenue sur votre espace Vaca Meet.</p>
                
                {user && (
                  <IonList className="home-user-info">
                    <IonItem>
                      <IonLabel>Email: {user.email}</IonLabel>
                    </IonItem>
                    {user.firstName && (
                      <IonItem>
                        <IonLabel>Prénom: {user.firstName}</IonLabel>
                      </IonItem>
                    )}
                    {user.lastName && (
                      <IonItem>
                        <IonLabel>Nom: {user.lastName}</IonLabel>
                      </IonItem>
                    )}
                  </IonList>
                )}
                
                <IonButton 
                  expand="block" 
                  color="danger" 
                  className="home-logout-button"
                  onClick={(e) => {
                    // Version simplifiée pour test sans backend
                    e.preventDefault();
                    setUser(null);
                    AuthService.logout();
                  }}
                >
                  Se déconnecter
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={error}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Home; 