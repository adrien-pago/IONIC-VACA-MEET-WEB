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
  IonSelect,
  IonSelectOption,
  IonText,
  IonToggle
} from '@ionic/react';
import './ApiTest.css';

const ApiTest: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('https://mobile.vaca-meet.fr/api/test');
  const [protocol, setProtocol] = useState('https');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [useProxy, setUseProxy] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResponse('');
    setError('');
    setErrorDetails(null);
    
    const fullUrl = apiUrl.startsWith('http') ? apiUrl : `${protocol}://${apiUrl}`;
    
    console.log('Testing API connection to:', fullUrl);
    
    try {
      // Ajout d'un timeout de 10 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      };
      
      // Si nous utilisons un proxy CORS
      const fetchUrl = useProxy 
        ? `https://corsproxy.io/?${encodeURIComponent(fullUrl)}` 
        : fullUrl;
      
      const response = await fetch(fetchUrl, fetchOptions);
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Erreur lors du test API:', err);
      
      let errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      
      // Collecter plus de détails sur l'erreur
      const details = {
        message: err.message,
        name: err.name,
        stack: err.stack,
        type: err instanceof TypeError ? 'TypeError' : 
              err instanceof DOMException ? 'DOMException' : 
              err instanceof Error ? 'Error' : typeof err
      };
      
      if (err.name === 'AbortError') {
        setError('Timeout - La requête a pris trop de temps (>10s)');
      }
      
      setErrorDetails(details);
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
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Configuration</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Protocole</IonLabel>
              <IonSelect value={protocol} onIonChange={e => setProtocol(e.detail.value)}>
                <IonSelectOption value="http">HTTP</IonSelectOption>
                <IonSelectOption value="https">HTTPS</IonSelectOption>
              </IonSelect>
            </IonItem>
            
            <IonItem>
              <IonLabel position="stacked">URL de l'API</IonLabel>
              <IonInput 
                value={apiUrl} 
                onIonChange={e => setApiUrl(e.detail.value || '')}
                placeholder="mobile.vaca-meet.fr/api/test"
              />
            </IonItem>
            
            <IonItem>
              <IonLabel>Utiliser un proxy CORS</IonLabel>
              <IonToggle checked={useProxy} onIonChange={e => setUseProxy(e.detail.checked)} />
            </IonItem>
            
            <IonButton expand="block" className="ion-margin-top" onClick={testApi} disabled={loading}>
              {loading ? 'Chargement...' : 'Tester la connexion API'}
            </IonButton>
          </IonCardContent>
        </IonCard>
        
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
            
            {errorDetails && (
              <>
                <IonButton 
                  size="small" 
                  fill="clear" 
                  onClick={() => setShowDetails(!showDetails)}
                  className="ion-margin-top"
                >
                  {showDetails ? 'Masquer les détails' : 'Afficher les détails techniques'}
                </IonButton>
                
                {showDetails && (
                  <div className="error-details">
                    <h3>Détails de l'erreur:</h3>
                    <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
                    
                    <h3>Suggestions:</h3>
                    <ul>
                      <li>Vérifiez que l'URL est correcte</li>
                      <li>Vérifiez que le serveur API est en ligne</li>
                      <li>Vérifiez la configuration CORS du serveur</li>
                      <li>Si vous utilisez HTTPS, vérifiez le certificat SSL</li>
                      <li>Essayez d'utiliser HTTP au lieu de HTTPS pour tester</li>
                      <li>Activez l'option "Utiliser un proxy CORS" pour contourner les restrictions CORS</li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ApiTest; 