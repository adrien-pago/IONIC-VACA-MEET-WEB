import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonSpinner,
  IonToast,
  IonText,
  IonList,
  IonListHeader,
  IonBadge
} from '@ionic/react';
import axios from 'axios';
import './ApiTest.css';

const ApiTest: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('https://votre-serveur.fr/api/mobile/test');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const startTime = Date.now();
      const response = await axios.get(apiUrl, {
        timeout: 10000
      });
      const endTime = Date.now();
      
      setResult({
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        time: endTime - startTime
      });
      
      setToastMessage('Connexion réussie!');
      setToastColor('success');
      setShowToast(true);
    } catch (err: any) {
      console.error('Erreur de connexion à l\'API:', err);
      
      setError(err.message || 'Erreur inconnue');
      setToastMessage('Erreur de connexion à l\'API');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Test de l'API</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Configuration</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">URL de l'API</IonLabel>
              <IonInput
                value={apiUrl}
                onIonChange={e => setApiUrl(e.detail.value || '')}
                placeholder="https://votre-serveur.fr/api/mobile/test"
              />
            </IonItem>
            
            <IonButton
              expand="block"
              className="ion-margin-top"
              onClick={testConnection}
              disabled={loading}
            >
              {loading ? <IonSpinner name="dots" /> : 'Tester la connexion'}
            </IonButton>
          </IonCardContent>
        </IonCard>
        
        {result && (
          <IonCard className="result-card">
            <IonCardHeader>
              <IonCardTitle color="success">Connexion réussie</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonListHeader>Détails de la réponse</IonListHeader>
                <IonItem>
                  <IonLabel>
                    <h2>Temps de réponse</h2>
                    <p>{result.time} ms</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Statut</h2>
                    <p>{result.status} - {result.statusText}</p>
                  </IonLabel>
                  <IonBadge color="success" slot="end">{result.status}</IonBadge>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Données</h2>
                    <pre className="response-data">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
        
        {error && (
          <IonCard className="error-card">
            <IonCardHeader>
              <IonCardTitle color="danger">Erreur de connexion</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText color="danger">{error}</IonText>
              
              <IonList className="ion-margin-top">
                <IonListHeader>Vérifications à faire</IonListHeader>
                <IonItem>
                  <IonLabel class="ion-text-wrap">
                    1. L'URL est-elle correcte ?
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel class="ion-text-wrap">
                    2. Le serveur est-il démarré et accessible ?
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel class="ion-text-wrap">
                    3. La configuration CORS est-elle correcte sur le serveur ?
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel class="ion-text-wrap">
                    4. Vérifiez les logs du serveur pour plus de détails.
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default ApiTest; 