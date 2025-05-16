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
    baseUrl: 'https://mobile.vaca-meet.fr',
    
    // Aucune URL alternative
    fallbackUrls: [],
    
    // Points de terminaison spécifiques
    endpoints: {
      login: '/api/login',
      register: '/api/register',
      profile: '/api/mobile/user',
      userProfile: '/api/mobile/user/profile',
      updateProfile: '/api/mobile/user/profile/direct',
      updateMobileProfile: '/api/mobile/user/update',
      updateTheme: '/api/mobile/user/update-theme',
      updatePassword: '/api/mobile/user/password',
      destinations: '/api/mobile/destinations',
      verifyPassword: '/api/mobile/verify-password',
      camping: '/api/mobile/camping'
    }
  },
  
  // Timeout des requêtes en ms (augmenté pour déboguer)
  requestTimeout: 30000, // 30 secondes pour déboguer
  
  // Options de débogage
  debug: {
    verbose: isEmulator // Activer les logs verbeux en mode développement
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


export default config; 