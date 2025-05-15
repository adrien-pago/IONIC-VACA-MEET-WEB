/**
 * Configuration globale de l'application
 */

// Détecter automatiquement l'environnement de l'application
const isEmulator = window.location.hostname === 'localhost';
const isProduction = !isEmulator;

// Configuration API principale
const config = {
  // API URLs
  api: {
    // Utiliser uniquement l'URL de production
    baseUrl: 'https://mobile.vaca-meet.fr/api',
    
    // Aucune URL alternative
    fallbackUrls: [],
    
    // Points de terminaison spécifiques
    endpoints: {
      login: '/login_check',
      register: '/register',
      profile: '/user/profile',
      test: '/test'
    }
  },
  
  // Timeout des requêtes en ms (augmenté pour déboguer)
  requestTimeout: 30000, // 30 secondes pour déboguer
  
  // Debug options
  debug: {
    // Activer les logs détaillés
    verbose: true,
    // Afficher les en-têtes des requêtes
    showHeaders: true,
    // Logger le corps des requêtes
    logRequestBody: true,
  },
  
  // Configuration du stockage local
  storage: {
    tokenKey: 'token'
  },
  
  // Environment info (débogage)
  env: {
    isEmulator,
    isProduction,
    hostname: window.location.hostname,
    buildType: process.env.NODE_ENV
  }
};

// Fonction utilitaire pour tester la connectivité à l'API
export const testApiConnectivity = async () => {
  const axios = (await import('axios')).default;
  
  // On essaie l'URL par défaut
  try {
    console.log(`Test de connectivité avec l'URL de production: ${config.api.baseUrl}`);
    
    // Configuration de la requête avec tous les détails
    const requestConfig = {
      timeout: 30000, // 30 secondes pour le test
      validateStatus: () => true, // Accepte tous les codes de statut
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    
    // Pour les URLs https, on désactive la vérification du certificat en développement
    if (config.api.baseUrl.startsWith('https') && !config.env.isProduction) {
      console.log('URL HTTPS détectée, désactivation de la vérification des certificats pour le test');
    }
    
    console.log('Configuration de la requête de test:', requestConfig);
    
    // Exécution de la requête
    const response = await axios.get(`${config.api.baseUrl}/test`, requestConfig);
    
    console.log(`Réponse URL par défaut: status=${response.status}, data=`, response.data);
    
    if (response.status < 500) {
      return { success: true, url: config.api.baseUrl, status: response.status };
    }
  } catch (e: any) {
    console.log(`Échec de connexion à l'URL de production: ${e.message}`);
    console.log('Détails de l\'erreur:', e);
    
    // Si nous avons un objet de réponse dans l'erreur, on affiche plus d'infos
    if (e.response) {
      console.log('Données de réponse d\'erreur:', {
        status: e.response.status,
        headers: e.response.headers,
        data: e.response.data
      });
    }
    
    // Vérifier si l'erreur est liée à CORS
    if (e.message.includes('CORS') || (e.response && e.response.headers && e.response.headers['access-control-allow-origin'] === undefined)) {
      console.log('Possible problème CORS détecté. Vérifiez les en-têtes CORS de votre API');
    }
    
    // Vérifier si l'erreur est liée au timeout
    if (e.code === 'ECONNABORTED' || e.message.includes('timeout')) {
      console.log('Erreur de timeout détectée. Le serveur prend trop de temps à répondre ou est inaccessible');
    }
  }
  
  return { success: false };
};

export default config; 