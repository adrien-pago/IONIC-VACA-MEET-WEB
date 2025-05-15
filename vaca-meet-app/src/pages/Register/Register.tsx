import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonAlert,
  IonLoading,
  IonText,
  IonCol,
  IonGrid,
  IonRow,
  IonIcon
} from '@ionic/react';
import { personCircleOutline, mailOutline, lockClosedOutline, arrowForwardOutline, personOutline } from 'ionicons/icons';
import { useIonRouter } from '@ionic/react';
import { AuthService } from '../../services/auth.service';
import AnimatedInput from '../../components/AnimatedInput';
import AnimatedButton from '../../components/AnimatedButton';
import GlassCard from '../../components/GlassCard';
import BackgroundEffects from '../../components/BackgroundEffects';
import '../Login/Login.css'; // Réutilisation des styles de Login

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [animation, setAnimation] = useState<string>('');
  // Vérifier si nous sommes en mode développement ou production
  const isProduction = process.env.NODE_ENV === 'production';
  
  const router = useIonRouter();
  const authService = new AuthService();
  
  useEffect(() => {
    // Animation de démarrage avec timeout pour assurer le rendu correct
    const timer = setTimeout(() => {
      setAnimation('animate-slide-up');
    }, 50);
    
    // Nettoyage en cas de démontage du composant
    return () => {
      clearTimeout(timer);
      setAnimation('');
    };
  }, []);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!username.trim()) {
      newErrors.username = 'Veuillez entrer votre email';
    } else if (!/\S+@\S+\.\S+/.test(username)) {
      newErrors.username = 'Veuillez entrer un email valide';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Veuillez entrer votre mot de passe';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setShowLoading(true);
    setErrorDetails(null);

    try {
      const userData = {
        username,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined
      };
      
      const response = await authService.register(userData);
      setAlertMessage(response.message || 'Inscription réussie ! Veuillez vous connecter.');
      setShowAlert(true);
      
      // Rediriger vers la page de connexion après inscription réussie
      setTimeout(() => {
        goToLogin();
      }, 1000);
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      
      let errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
      let detailedError = '';
      
      if (error.response) {
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
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion internet.';
        detailedError = 'La requête a été envoyée mais aucune réponse n\'a été reçue du serveur.\n';
      } else {
        errorMessage = `Erreur de configuration: ${error.message}`;
        detailedError = `Erreur: ${error.message}`;
      }
      
      setAlertMessage(errorMessage);
      setErrorDetails(detailedError);
      setShowAlert(true);
    } finally {
      setShowLoading(false);
    }
  };

  const goToLogin = () => {
    // Animation de transition moderne
    router.push('/login', 'root');
  };

  return (
    <IonPage className="auth-page">
      <BackgroundEffects variant="gradient" density="medium" />
      
      <IonContent fullscreen className="ion-padding auth-content">
        <IonGrid className="full-height">
          <IonRow className="full-height ion-justify-content-center ion-align-items-center">
            <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="5">
              <div className={`logo-container ${animation}`}>
                <IonIcon 
                  icon={personCircleOutline} 
                  className="auth-logo"
                />
                <h1 className="app-title">Vaca Meet</h1>
              </div>
              
              <GlassCard 
                color="tertiary"
                className={`auth-card ${animation}`}
                animated={false}
              >
                <h2 className="auth-title">
                  Créer un compte
                </h2>
                              
                <div className="auth-form">
                  <AnimatedInput
                    label="Email"
                    name="username"
                    type="email"
                    value={username}
                    onChange={e => setUsername(e.detail.value!)}
                    icon={mailOutline}
                    required
                    errorMessage={errors.username}
                    autoComplete="email"
                  />
                  
                  <AnimatedInput
                    label="Mot de passe"
                    name="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.detail.value!)}
                    icon={lockClosedOutline}
                    required
                    errorMessage={errors.password}
                    autoComplete="new-password"
                  />
                  
                  <AnimatedInput
                    label="Prénom"
                    name="firstName"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.detail.value!)}
                    icon={personOutline}
                    errorMessage={errors.firstName}
                  />
                  
                  <AnimatedInput
                    label="Nom"
                    name="lastName"
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.detail.value!)}
                    icon={personOutline}
                    errorMessage={errors.lastName}
                  />
                  
                  <div className="form-actions">
                    <AnimatedButton
                      expand="block"
                      size="large"
                      onClick={handleRegister}
                      icon={arrowForwardOutline}
                      iconPosition="end"
                      className="auth-button"
                      loading={showLoading}
                      pulse={!showLoading}
                    >
                      Créer un compte
                    </AnimatedButton>
                    
                    <div className="auth-toggle">
                      <IonText color="medium">
                        Déjà un compte ?
                      </IonText>
                      
                      <button 
                        className="toggle-button"
                        onClick={goToLogin}
                      >
                        Se connecter
                      </button>
                    </div>
                  </div>
              
                </div>
              </GlassCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        
        <IonLoading 
          isOpen={showLoading}
          message="Inscription en cours..."
        />
      </IonContent>
    </IonPage>
  );
};

export default Register; 