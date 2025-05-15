import api from './api';
import config from './config';
import { AuthService } from './auth.service';

export interface CampingInfo {
  camping: {
    id: number;
    name: string;
    username: string;
  };
  animations: Array<{
    id: number;
    title: string;
    description: string;
    day: string;
    time: string;
  }>;
  services: Array<{
    id: number;
    name: string;
    description: string;
    hours: string;
  }>;
  activities: Array<{
    id: number;
    title: string;
    description: string;
    day: string;
    time: string;
    location: string;
    participants: number;
  }>;
}

export class CampingService {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Récupère les informations du camping
   * @param {number} id - L'identifiant du camping
   * @returns {Promise<CampingInfo>} - Les informations du camping
   */
  async getCampingInfo(id: number): Promise<CampingInfo> {
    try {
      const token = this.authService.getToken();
      
      if (!token) {
        throw new Error('Vous devez être connecté pour accéder à ces informations');
      }
      
      const response = await api.get(`${config.api.endpoints.camping}/info/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des informations du camping:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Impossible de récupérer les informations du camping. Veuillez réessayer plus tard.');
    }
  }
} 