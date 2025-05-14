import axios from 'axios';

export class AuthService {
  private apiUrl = 'https://mobile.vaca-meet.fr/api/mobile';
  private token: string | null = null;

  constructor() {
    // Récupérer le token du localStorage lors de l'initialisation
    this.token = localStorage.getItem('token');
  }

  async register(userData: { username: string; password: string; firstName?: string; lastName?: string }) {
    try {
      const response = await axios.post(`${this.apiUrl}/register`, userData);
      if (response.data && response.data.token) {
        this.storeToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async login(credentials: { username: string; password: string }) {
    try {
      const response = await axios.post(`${this.apiUrl}/login_check`, credentials);
      if (response.data && response.data.token) {
        this.storeToken(response.data.token);
      }
      return response.data;
    } catch (error) {
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
      const response = await axios.get(`${this.apiUrl}/test`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
} 