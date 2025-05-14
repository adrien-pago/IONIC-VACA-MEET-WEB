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
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const testApi = async () => {
    setLoading(true);
    setResponse('');
    setError('');
    
    try {
      // Remplacez cette URL par l'URL de votre API sur votre sous-domaine
      const apiUrl = 'https://mobile.vaca-meet.fr/api/test';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Erreur lors du test API:', err);
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Test API</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Test de connexion à l'API</h1>
        <p>Cliquez sur le bouton ci-dessous pour tester la connexion à l'API hébergée sur votre sous-domaine.</p>
        
        <IonButton expand="block" onClick={testApi} disabled={loading}>
          {loading ? 'Chargement...' : 'Tester la connexion API'}
        </IonButton>
        
        {response && (
          <div className="api-response success">
            <h2>Réponse de l'API:</h2>
            <pre>{response}</pre>
          </div>
        )}
        
        {error && (
          <div className="api-response error">
            <h2>Erreur:</h2>
            <IonText color="danger">{error}</IonText>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ApiTest; 