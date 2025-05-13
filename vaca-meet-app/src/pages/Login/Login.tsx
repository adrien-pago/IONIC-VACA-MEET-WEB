import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonText,
  IonLoading,
  IonRouterLink,
  IonToast,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonListHeader,
  IonBadge,
  IonCardSubtitle,
  IonModal
} from '@ionic/react';
import './Login.css';
import '../../styles/global.css';
import { useHistory } from 'react-router-dom';
import { authService, LoginRequest } from '../../services/authService';
import { checkmarkCircle, warning, closeCircle, informationCircle, checkmark, close } from 'ionicons/icons';
import axios from 'axios';

const Login: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le test de l'API
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('');
  const [toastIcon, setToastIcon] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  
  // États pour les résultats détaillés du test API
  const [showApiTestResults, setShowApiTestResults] = useState(false);
  const [apiTestResults, setApiTestResults] = useState<{
    status: 'success' | 'error';
    endpoint: string;
    statusCode?: number;
    responseTime?: number;
    responseData?: any;
    error?: string;
    errorDetails?: any;
  }>({
    status: 'error',
    endpoint: ''
  });

  const handleChange = (e: CustomEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const testApiConnection = async () => {
    setIsTestingApi(true);
    const endpoint = 'http://10.0.2.2:8000/api/test';
    const startTime = Date.now();
    
    try {
      const response = await axios.get(endpoint, { timeout: 10000 });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Préparer les résultats détaillés
      setApiTestResults({
        status: 'success',
        endpoint,
        statusCode: response.status,
        responseTime,
        responseData: response.data
      });
      
      // Préparer le toast de succès
      setToastMessage(`Connexion API réussie (${responseTime}ms)`);
      setToastColor('success');
      setToastIcon(checkmarkCircle);
      setShowToast(true);
      
      // Afficher les résultats détaillés
      setShowApiTestResults(true);
    } catch (error: any) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.error('Erreur de connexion API:', error);
      
      // Préparer les résultats détaillés
      setApiTestResults({
        status: 'error',
        endpoint,
        responseTime,
        error: error.message,
        errorDetails: {
          name: error.name,
          code: error.code,
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          } : 'Pas de réponse du serveur'
        }
      });
      
      // Préparer le toast d'erreur
      let errorMessage = 'Erreur de connexion à l\'API';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Délai d\'attente dépassé';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur réseau - Serveur inaccessible';
      } else if (error.response) {
        errorMessage = `Erreur HTTP ${error.response.status}`;
      }
      
      setToastMessage(errorMessage);
      setToastColor('danger');
      setToastIcon(warning);
      setShowToast(true);
      
      // Afficher les résultats détaillés
      setShowApiTestResults(true);
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation des champs
      if (!formData.email || !formData.password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      // Appel au service d'authentification
      await authService.login(formData);
      
      // Redirection vers la page d'accueil après connexion réussie
      history.push('/home');
    } catch (err: any) {
      let errorMessage = 'Erreur de connexion';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderApiTestResultCard = () => {
    const { status, endpoint, statusCode, responseTime, responseData, error, errorDetails } = apiTestResults;
    
    return (
      <IonCard className="api-test-results-card">
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon 
              icon={status === 'success' ? checkmarkCircle : closeCircle} 
              color={status === 'success' ? 'success' : 'danger'}
            /> 
            Test API {status === 'success' ? 'Réussi' : 'Échoué'}
          </IonCardTitle>
          <IonCardSubtitle>{endpoint}</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none">
            <IonItem>
              <IonLabel>
                <h3>Temps de réponse</h3>
                <p>{responseTime ? `${responseTime} ms` : 'N/A'}</p>
              </IonLabel>
            </IonItem>
            
            {status === 'success' && (
              <>
                <IonItem>
                  <IonLabel>
                    <h3>Code de statut</h3>
                    <p>{statusCode}</p>
                  </IonLabel>
                  <IonBadge color="success" slot="end">{statusCode}</IonBadge>
                </IonItem>
                
                <IonItem>
                  <IonLabel>
                    <h3>Réponse</h3>
                    <pre style={{ overflowX: 'auto', fontSize: '12px' }}>
                      {JSON.stringify(responseData, null, 2)}
                    </pre>
                  </IonLabel>
                </IonItem>
              </>
            )}
            
            {status === 'error' && (
              <>
                <IonItem>
                  <IonLabel>
                    <h3>Erreur</h3>
                    <p style={{ color: 'var(--ion-color-danger)' }}>{error}</p>
                  </IonLabel>
                </IonItem>
                
                {errorDetails && errorDetails.response && (
                  <IonItem>
                    <IonLabel>
                      <h3>Code HTTP</h3>
                      <p>{errorDetails.response.status} - {errorDetails.response.statusText}</p>
                    </IonLabel>
                    <IonBadge color="danger" slot="end">{errorDetails.response.status}</IonBadge>
                  </IonItem>
                )}
                
                <IonItem>
                  <IonLabel>
                    <h3>Détails</h3>
                    <pre style={{ overflowX: 'auto', fontSize: '12px' }}>
                      {JSON.stringify(errorDetails, null, 2)}
                    </pre>
                  </IonLabel>
                </IonItem>
                
                <IonItem>
                  <IonLabel class="ion-text-wrap">
                    <h3>Conseils de dépannage</h3>
                    <p>
                      {error?.includes('Network Error') && "• Vérifiez que votre serveur API est démarré et accessible"}
                      {error?.includes('ECONNREFUSED') && "• Le serveur a refusé la connexion. Vérifiez le port et l'adresse"}
                      {error?.includes('timeout') && "• La requête a expiré. Le serveur peut être lent ou inaccessible"}
                      {error?.includes('404') && "• L'endpoint n'existe pas ou n'est pas correctement configuré"}
                      {error?.includes('500') && "• Erreur interne du serveur. Vérifiez les logs de votre API"}
                      {error?.includes('403') && "• Accès interdit. Vérifiez la configuration CORS"}
                      {!error?.includes('Network Error') && 
                       !error?.includes('ECONNREFUSED') && 
                       !error?.includes('timeout') && 
                       !error?.includes('404') && 
                       !error?.includes('500') && 
                       !error?.includes('403') && 
                       "• Vérifiez la configuration de votre serveur API et la connectivité réseau"}
                    </p>
                  </IonLabel>
                </IonItem>
              </>
            )}
          </IonList>
          
          <IonButton 
            expand="block" 
            color="medium" 
            onClick={() => setShowApiTestResults(false)}
            style={{ marginTop: '16px' }}
          >
            Fermer
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-heading">
            <h1>Bienvenue</h1>
            <p>Connectez-vous pour accéder à votre compte</p>
          </div>

          {error && (
            <IonText color="danger" className="error-message">
              <p>{error}</p>
            </IonText>
          )}

          <IonItem className="form-input">
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              name="email"
              value={formData.email}
              onIonChange={handleChange}
              required
            />
          </IonItem>

          <IonItem className="form-input">
            <IonLabel position="floating">Mot de passe</IonLabel>
            <IonInput
              type="password"
              name="password"
              value={formData.password}
              onIonChange={handleChange}
              required
            />
          </IonItem>

          <IonButton 
            expand="block" 
            type="submit" 
            className="login-button"
          >
            Se connecter
          </IonButton>

          <div className="register-link">
            <p>
              Pas encore de compte?{' '}
              <IonRouterLink routerLink="/register">
                S'inscrire
              </IonRouterLink>
            </p>
          </div>
        </form>
        
        <div className="api-test" style={{ marginTop: '20px', textAlign: 'center' }}>
          <IonButton 
            expand="block" 
            color="tertiary" 
            onClick={testApiConnection}
            className="test-api-button"
          >
            Tester la connexion à l'API
          </IonButton>
          <IonText color="medium" style={{ fontSize: '12px', marginTop: '8px', display: 'block' }}>
            Cible: http://10.0.2.2:8000/api/test
          </IonText>
        </div>
        
        {showApiTestResults && renderApiTestResultCard()}
        
        <IonLoading 
          isOpen={loading} 
          message="Connexion en cours..." 
          duration={10000}
        />
        
        <IonLoading
          isOpen={isTestingApi}
          message="Test de l'API en cours..."
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          icon={toastIcon}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login; 