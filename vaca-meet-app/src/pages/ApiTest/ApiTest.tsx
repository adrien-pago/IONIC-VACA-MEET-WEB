import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonIcon,
  IonText,
  IonNote,
  IonAccordion,
  IonAccordionGroup,
  IonToggle
} from '@ionic/react';
import { 
  checkmarkCircle, 
  closeCircle, 
  refreshCircle, 
  arrowBack, 
  serverOutline,
  terminalOutline,
  helpCircleOutline,
  warningOutline
} from 'ionicons/icons';
import { testApiConnectivity } from '../../services/config';
import config from './../../services/config';
import { testApiConnection } from '../../services/api';
import './ApiTest.css';
import axios from 'axios';

// URL de production fixe
const PRODUCTION_API_URL = 'https://mobile.vaca-meet.fr/api';
// Service proxy CORS gratuit pour contourner les problèmes CORS temporairement
// NOTE: À utiliser uniquement pour le développement et les tests
const CORS_PROXY = 'https://corsproxy.io/?';

const ApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [customUrl, setCustomUrl] = useState('');
  const [activeUrl] = useState(PRODUCTION_API_URL);
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'unknown' | 'ssl_error' | 'network_error' | 'timeout'>('unknown');
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [verboseMode, setVerboseMode] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState<boolean>(false);
  
  // Test standard par défaut au chargement
  useEffect(() => {
    getNetworkInfo();
    runConnectivityTest();
  }, []);

  // Obtenir des informations sur le réseau
  const getNetworkInfo = () => {
    const info: any = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      isOnline: navigator.onLine,
      date: new Date().toISOString()
    };
    
    setNetworkInfo(info);
    
    // Tester la connectivité DNS/réseau de base
    testBasicConnectivity();
  };
  
  // Test de connectivité basique (DNS/réseau)
  const testBasicConnectivity = async () => {
    try {
      // Essayer d'atteindre le domaine avec un ping simple via une requête HEAD
      const domainUrl = 'https://mobile.vaca-meet.fr';
      const urlToTest = useProxy ? `${CORS_PROXY}${encodeURIComponent(domainUrl)}` : domainUrl;
      
      setResults(prev => [...prev, {
        url: `Test connectivité domaine: ${domainUrl}${useProxy ? ' (via proxy)' : ''}`,
        success: false,
        details: 'Vérification de l\'accessibilité du domaine...',
        isLoading: true
      }]);
      
      try {
        console.log(`Test d'accès au domaine: ${urlToTest}`);
        const startTime = Date.now();
        
        // Utiliser une requête HEAD qui est plus légère
        const response = await axios.head(urlToTest, {
          timeout: 10000, // Timeout plus court pour ce test
          headers: {
            'Accept': '*/*'
          },
          validateStatus: () => true // Accepter tous les codes de statut
        });
        
        const endTime = Date.now();
        const pingTime = endTime - startTime;
        
        console.log(`Domaine accessible, temps de réponse: ${pingTime}ms`);
        
        setResults(prev => prev.map(item => 
          item.url === `Test connectivité domaine: ${domainUrl}${useProxy ? ' (via proxy)' : ''}`
            ? {
                url: `${domainUrl}${useProxy ? ' (via proxy)' : ''}`,
                success: true,
                status: response.status,
                time: pingTime,
                details: `Domaine accessible en ${pingTime}ms`,
                isLoading: false
              }
            : item
        ));
      } catch (error: any) {
        console.error('Erreur de connectivité au domaine:', error);
        
        // Analyse de l'erreur
        let errorDetails = `Erreur: ${error.message}`;
        
        if (error.code === 'ECONNABORTED') {
          errorDetails = `Délai d'attente dépassé: Le domaine ne répond pas dans le temps imparti`;
        } else if (error.message.includes('Network Error')) {
          errorDetails = `Erreur réseau: Impossible d'établir une connexion au domaine`;
        } else if (error.message.includes('certificate')) {
          errorDetails = `Erreur de certificat SSL: ${error.message}`;
        }
        
        setResults(prev => prev.map(item => 
          item.url === `Test connectivité domaine: ${domainUrl}${useProxy ? ' (via proxy)' : ''}`
            ? {
                url: `${domainUrl}${useProxy ? ' (via proxy)' : ''}`,
                success: false,
                details: errorDetails,
                code: error.code,
                isLoading: false
              }
            : item
        ));
      }
    } catch (error: any) {
      console.error('Erreur dans le test de connectivité de base:', error);
    }
  };

  // Test de connectivité principal
  const runConnectivityTest = async () => {
    setLoading(true);
    setResults([]);
    try {
      // Tester l'URL de production
      await testProductionApi();
    } catch (error: any) {
      setResults(prev => [...prev, {
        url: 'Erreur générale',
        success: false,
        details: error.message
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  // Test de l'API de production
  const testProductionApi = async () => {
    try {
      // Tester les URLs de l'API en ajoutant des points d'extrémité spécifiques
      const endpoints = ['', '/test', config.api.endpoints.test];
      
      for (const endpoint of endpoints) {
        const testEndpoint = `${PRODUCTION_API_URL}${endpoint}`;
        const urlToTest = useProxy ? `${CORS_PROXY}${encodeURIComponent(testEndpoint)}` : testEndpoint;
        
        setResults(prev => [...prev, {
          url: `Test API Production: ${testEndpoint}${useProxy ? ' (via proxy)' : ''}`,
          success: false,
          details: 'Test en cours...',
          isLoading: true
        }]);
        
        try {
          console.log(`Test d'accès à l'URL de production: ${urlToTest}`);
          
          // Configurations de test avec différentes options
          const configs = [
            // Config standard
            {
              timeout: 30000,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              validateStatus: () => true, // Accepter tous les codes de statut
              description: 'Standard'
            },
            // Config sans vérification SSL (pour test uniquement)
            {
              timeout: 30000,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              validateStatus: () => true,
              description: 'Sans vérification SSL'
            }
          ];
          
          let success = false;
          
          // Essayer chaque configuration
          for (const config of configs) {
            try {
              console.log(`Essai avec config ${config.description}...`);
              const startTime = Date.now();
              const response = await axios.get(urlToTest, config);
              const endTime = Date.now();
              
              console.log(`Réponse reçue (${config.description}):`, response.status);
              
              // Si on a une réponse positive, on s'arrête
              if (response.status < 400) {
                // Mettre à jour le résultat
                setResults(prev => prev.map(item => 
                  item.url === `Test API Production: ${testEndpoint}${useProxy ? ' (via proxy)' : ''}`
                    ? {
                        url: `${testEndpoint}${useProxy ? ' (via proxy)' : ''} (${config.description})`,
                        success: true,
                        status: response.status,
                        time: endTime - startTime,
                        details: `Réponse: ${response.status} ${response.statusText}`,
                        data: response.data,
                        isLoading: false
                      }
                    : item
                ));
                
                success = true;
                setBackendStatus('online');
                setLastError(null);
                break;
              }
            } catch (configError: any) {
              console.error(`Échec avec config ${config.description}:`, configError.message);
            }
          }
          
          // Si aucune config n'a fonctionné
          if (!success) {
            setResults(prev => prev.map(item => 
              item.url === `Test API Production: ${testEndpoint}${useProxy ? ' (via proxy)' : ''}`
                ? {
                    url: `${testEndpoint}${useProxy ? ' (via proxy)' : ''}`,
                    success: false,
                    details: 'Échec de connexion avec toutes les configurations',
                    isLoading: false
                  }
                : item
            ));
            
            setBackendStatus('offline');
          }
        } catch (error: any) {
          console.error('Erreur détaillée:', error);
          
          // Analyse plus approfondie des erreurs
          let errorDetails = `Erreur: ${error.message}`;
          let errorStatus = 'offline';
          
          if (error.code === 'ECONNABORTED') {
            errorDetails = `Erreur de timeout: Le serveur met trop de temps à répondre`;
            errorStatus = 'timeout';
          } else if (error.message.includes('Network Error')) {
            errorDetails = `Erreur réseau: Impossible d'établir une connexion au serveur`;
            errorStatus = 'network_error';
          } else if (error.message.includes('certificate')) {
            errorDetails = `Erreur de certificat SSL: ${error.message}`;
            errorStatus = 'ssl_error';
          }
          
          setResults(prev => prev.map(item => 
            item.url === `Test API Production: ${testEndpoint}${useProxy ? ' (via proxy)' : ''}`
              ? {
                  url: `${testEndpoint}${useProxy ? ' (via proxy)' : ''}`,
                  success: false,
                  details: errorDetails,
                  code: error.code,
                  isLoading: false
                }
              : item
          ));
          
          setBackendStatus(errorStatus as any);
          setLastError(errorDetails);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors du test de l\'API de production:', error);
      setBackendStatus('offline');
      setLastError(`Erreur globale: ${error.message}`);
    }
  };
  
  // Test d'une URL personnalisée saisie par l'utilisateur
  const testCustomUrl = async () => {
    if (!customUrl) return;
    
    setLoading(true);
    try {
      const url = customUrl;
      const urlToTest = useProxy ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
      
      setResults(prev => [...prev, {
        url: `${url}${useProxy ? ' (via proxy)' : ''}`,
        success: false,
        details: 'Test en cours...',
        isLoading: true
      }]);
      
      try {
        console.log(`Test d'accès à l'URL personnalisée: ${urlToTest}`);
        
        const startTime = Date.now();
        const response = await axios.get(urlToTest, {
          timeout: 15000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          validateStatus: () => true // Accepter tous les codes de statut
        });
        const endTime = Date.now();
        
        // Mettre à jour le résultat
        setResults(prev => prev.map(item => 
          item.url === `${url}${useProxy ? ' (via proxy)' : ''}` && item.isLoading
            ? {
                url: `${url}${useProxy ? ' (via proxy)' : ''}`,
                success: response.status < 400,
                status: response.status,
                time: endTime - startTime,
                details: `Réponse: ${response.status} ${response.statusText}`,
                data: response.data,
                isLoading: false
              }
            : item
        ));
      } catch (error: any) {
        setResults(prev => prev.map(item => 
          item.url === `${url}${useProxy ? ' (via proxy)' : ''}` && item.isLoading
            ? {
                url: `${url}${useProxy ? ' (via proxy)' : ''}`,
                success: false,
                details: `Erreur: ${error.message}`,
                code: error.code,
                isLoading: false
              }
            : item
        ));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton slot="start" routerLink="/login" fill="clear">
            <IonIcon icon={arrowBack} />
          </IonButton>
          <IonTitle>Diagnostic API</IonTitle>
          <IonButton slot="end" onClick={runConnectivityTest} fill="clear">
            <IonIcon icon={refreshCircle} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message={'Test de connexion en cours...'} />
        
        {/* Statut du backend */}
        <IonCard className={`backend-status-card ${backendStatus}`}>
          <IonCardContent className="ion-text-center">
            <IonIcon 
              icon={backendStatus === 'online' ? checkmarkCircle : 
                   (backendStatus === 'offline' ? closeCircle : 
                    (backendStatus === 'unknown' ? helpCircleOutline : warningOutline))} 
              color={backendStatus === 'online' ? 'success' : 
                    (backendStatus === 'unknown' ? 'warning' : 'danger')}
              className="status-icon"
            />
            <h2>Status Backend: {
              backendStatus === 'online' ? 'En ligne' : 
              backendStatus === 'offline' ? 'Hors ligne' : 
              backendStatus === 'ssl_error' ? 'Erreur SSL' :
              backendStatus === 'network_error' ? 'Erreur réseau' :
              backendStatus === 'timeout' ? 'Timeout' : 'Indéterminé'
            }</h2>
            <p>
              {backendStatus === 'online' 
                ? 'Le backend est accessible et répond correctement.' 
                : (backendStatus === 'offline' 
                  ? 'Le backend n\'est pas accessible. Vérifiez qu\'il est bien démarré.' 
                  : backendStatus === 'ssl_error'
                    ? 'Problème avec le certificat SSL. Vérifiez que le certificat est valide.'
                    : backendStatus === 'network_error'
                      ? 'Impossible d\'établir une connexion réseau. Vérifiez votre connexion internet.'
                      : backendStatus === 'timeout'
                        ? 'Le serveur ne répond pas dans le temps imparti. Il est peut-être surchargé ou inaccessible.'
                        : 'État du backend inconnu. Lancez un test.')}
            </p>
            {lastError && (
              <div className="last-error">
                <IonText color="danger">
                  <p><strong>Dernière erreur:</strong> {lastError}</p>
                </IonText>
              </div>
            )}
          </IonCardContent>
        </IonCard>
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Configuration actuelle</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="full">
              <IonItem>
                <IonLabel>
                  <h2>URL API backend</h2>
                  <p>{PRODUCTION_API_URL}</p>
                </IonLabel>
              </IonItem>
              
              <IonItem>
                <IonLabel>
                  <h2>Environnement</h2>
                  <p>{config.env.isEmulator ? 'Émulateur' : 'Production'}</p>
                </IonLabel>
                <IonBadge color="success">PRODUCTION</IonBadge>
              </IonItem>
              
              <IonItem>
                <IonLabel>
                  <h2>Hostname détecté</h2>
                  <p>{config.env.hostname}</p>
                </IonLabel>
              </IonItem>
              
              <IonItem>
                <IonLabel>
                  <h2>Mode verbeux</h2>
                  <p>Afficher les détails techniques</p>
                </IonLabel>
                <IonToggle 
                  checked={verboseMode} 
                  onIonChange={e => setVerboseMode(e.detail.checked)}
                />
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h2>Utiliser proxy CORS</h2>
                  <p>Contourner les restrictions CORS (temporaire)</p>
                </IonLabel>
                <IonToggle 
                  checked={useProxy} 
                  onIonChange={e => setUseProxy(e.detail.checked)}
                />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Tester une URL personnalisée</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="8">
                  <IonInput
                    value={customUrl}
                    placeholder="https://mobile.vaca-meet.fr/api/test"
                    onIonChange={e => setCustomUrl(e.detail.value!)}
                  />
                </IonCol>
                <IonCol size="4">
                  <IonButton expand="block" onClick={testCustomUrl} disabled={!customUrl}>
                    Tester
                  </IonButton>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonText color="medium">
                    <p>Testez une URL spécifique pour vérifier sa disponibilité</p>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
        
        {/* Guide de dépannage */}
        <IonAccordionGroup>
          <IonAccordion value="troubleshooting">
            <IonItem slot="header">
              <IonIcon icon={warningOutline} color="warning" slot="start" />
              <IonLabel>Guide de dépannage</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              <h3>Problèmes de connexion courants:</h3>
              <ul>
                <li>
                  <strong>Erreur de timeout:</strong> Le serveur ne répond pas dans le délai imparti.
                  <ul>
                    <li>Vérifiez que votre serveur API est bien démarré</li>
                    <li>Vérifiez que le certificat SSL est valide</li>
                    <li>Vérifiez la latence de votre connexion internet</li>
                  </ul>
                </li>
                <li>
                  <strong>Erreur réseau:</strong> Impossible d'établir une connexion.
                  <ul>
                    <li>Vérifiez votre connexion internet</li>
                    <li>Si vous êtes sur un émulateur: vérifiez que l'émulateur a accès à internet</li>
                    <li>Assurez-vous que le domaine mobile.vaca-meet.fr est accessible</li>
                    <li>Vérifiez que le DNS fonctionne correctement sur votre réseau</li>
                  </ul>
                </li>
                <li>
                  <strong>Erreur CORS:</strong> Le serveur n'autorise pas les requêtes depuis l'origine de l'application.
                  <ul>
                    <li>Ajoutez les en-têtes CORS appropriés à votre API (Access-Control-Allow-Origin)</li>
                    <li>Vérifiez que l'origine de l'application est autorisée par le serveur</li>
                  </ul>
                </li>
                <li>
                  <strong>Erreur SSL/TLS:</strong> Problème avec le certificat du serveur.
                  <ul>
                    <li>Vérifiez que le certificat SSL n'est pas expiré</li>
                    <li>Assurez-vous que le domaine correspond au certificat</li>
                    <li>Sur émulateur Android: vérifiez que les certificats CA racine sont à jour</li>
                  </ul>
                </li>
                <li>
                  <strong>Problèmes spécifiques aux appareils mobiles:</strong>
                  <ul>
                    <li>Vérifiez les autorisations réseau de l'application</li>
                    <li>Essayez de passer du WiFi aux données mobiles ou inversement</li>
                    <li>Si vous utilisez un VPN, essayez de le désactiver</li>
                  </ul>
                </li>
                <li>
                  <strong>Problèmes spécifiques à l'émulateur:</strong>
                  <ul>
                    <li>Redémarrez l'émulateur</li>
                    <li>Vérifiez que l'émulateur a accès au réseau de l'hôte</li>
                    <li>Sur Android: essayez d'utiliser l'option "Use host proxy" dans les paramètres de l'émulateur</li>
                  </ul>
                </li>
              </ul>
              
              <h3>Actions à essayer:</h3>
              <ol>
                <li>Vérifiez d'abord si le domaine est accessible (test de ping)</li>
                <li>Essayez l'URL spécifique dans un navigateur sur votre ordinateur</li>
                <li>Assurez-vous que votre serveur backend est bien démarré</li>
                <li>Vérifiez les journaux du serveur pour détecter des erreurs</li>
                <li>Redémarrez l'application et/ou l'appareil</li>
              </ol>
            </div>
          </IonAccordion>
        </IonAccordionGroup>
        
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Résultats des tests</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {results.length === 0 ? (
              <div className="empty-results">
                <IonIcon icon={serverOutline} />
                <p>Aucun test effectué</p>
              </div>
            ) : (
              <IonList lines="full">
                {results.map((result, index) => (
                  <IonItem key={index} detail={verboseMode && result.data}>
                    <IonIcon
                      icon={result.isLoading ? refreshCircle : (result.success ? checkmarkCircle : closeCircle)}
                      color={result.isLoading ? 'medium' : (result.success ? 'success' : 'danger')}
                      slot="start"
                      className={result.isLoading ? 'spin-icon' : ''}
                    />
                    <IonLabel>
                      <h2>{result.url}</h2>
                      <p>{result.details}</p>
                      {result.status && <p>Status: {result.status}</p>}
                      {result.time && <p>Temps: {result.time}ms</p>}
                      {result.code && <p>Code erreur: {result.code}</p>}
                      
                      {verboseMode && result.data && (
                        <div className="response-data">
                          <IonNote>Réponse:</IonNote>
                          <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        </div>
                      )}
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
        
        {/* Informations système */}
        {verboseMode && networkInfo && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={terminalOutline} /> Informations système
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="full">
                <IonItem>
                  <IonLabel>
                    <h2>User Agent</h2>
                    <p className="wrap-text">{networkInfo.userAgent}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Plateforme</h2>
                    <p>{networkInfo.platform}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>État connexion</h2>
                    <p>{networkInfo.isOnline ? 'Connecté' : 'Déconnecté'}</p>
                  </IonLabel>
                  <IonBadge color={networkInfo.isOnline ? 'success' : 'danger'}>
                    {networkInfo.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </IonBadge>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
        
        <div className="ion-padding-vertical ion-text-center">
          <IonButton routerLink="/login" expand="block" fill="outline">
            Retour à la connexion
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ApiTest; 