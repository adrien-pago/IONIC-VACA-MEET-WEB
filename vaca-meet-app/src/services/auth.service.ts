import axios from 'axios';

// Mode développement - true = utiliser des données simulées, false = appels API réels
const DEV_MODE = true;

export class AuthService {
  // Dans un émulateur Android, 10.0.2.2 correspond à l'adresse IP de la machine hôte (localhost)
  private apiUrl = 'https://mobile.vaca-meet.fr/api/mobile';
  // Uncomment cette ligne si vous testez avec un émulateur
  // private apiUrl = 'http://10.0.2.2:8000/api/mobile'; 
  private token: string | null = null;

  constructor() {
    // Récupérer le token du localStorage lors de l'initialisation
    this.token = localStorage.getItem('token');
    console.log('Mode développement:', DEV_MODE ? 'ACTIF (données simulées)' : 'INACTIF (appels API réels)');
    console.log('URL API:', this.apiUrl);
  }

  async register(userData: { username: string; password: string; firstName?: string; lastName?: string }) {
    try {
      console.log('Tentative d\'inscription avec:', userData);
      
      if (DEV_MODE) {
        // Simuler une réponse d'inscription en mode développement
        await new Promise(resolve => setTimeout(resolve, 800)); // Simuler un délai réseau
        
        const mockResponse = {
          message: 'Utilisateur mobile créé avec succès',
          user: {
            id: 1,
            username: userData.username,
            firstName: userData.firstName || '',
            lastName: userData.lastName || ''
          },
          token: 'mock_token_' + Math.random().toString(36).substring(2)
        };
        
        this.storeToken(mockResponse.token);
        console.log('Réponse simulée (inscription):', mockResponse);
        return mockResponse;
      }
      
      // Mode production: appel réel à l'API
      const response = await axios.post(`${this.apiUrl}/register`, userData);
      if (response.data && response.data.token) {
        this.storeToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  }

  async login(credentials: { username: string; password: string }) {
    try {
      console.log('Tentative de connexion avec:', credentials);
      
      if (DEV_MODE) {
        // Simuler une réponse de connexion en mode développement
        await new Promise(resolve => setTimeout(resolve, 800)); // Simuler un délai réseau
        
        const mockToken = 'mock_token_' + Math.random().toString(36).substring(2);
        const mockResponse = {
          user: {
            id: 1,
            username: credentials.username,
            firstName: 'Prénom Test',
            lastName: 'Nom Test'
          },
          token: mockToken
        };
        
        this.storeToken(mockToken);
        console.log('Réponse simulée (connexion):', mockResponse);
        return mockResponse;
      }
      
      // Mode production: appel réel à l'API
      const response = await axios.post(`${this.apiUrl}/login_check`, credentials);
      if (response.data && response.data.token) {
        this.storeToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  storeToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async test() {
    try {
      if (DEV_MODE) {
        // Simuler une réponse de test en mode développement
        await new Promise(resolve => setTimeout(resolve, 500)); // Simuler un délai réseau
        
        const mockResponse = {
          message: 'API mobile fonctionne correctement (données simulées)',
          status: 'ok',
          timestamp: new Date().toISOString()
        };
        
        console.log('Réponse simulée (test):', mockResponse);
        return mockResponse;
      }
      
      // Mode production: appel réel à l'API
      const response = await axios.get(`${this.apiUrl}/test`);
      return response.data;
    } catch (error) {
      console.error('Erreur test API:', error);
      throw error;
    }
  }
} 