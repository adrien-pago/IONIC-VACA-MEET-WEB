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
      console.log(`Récupération des informations du camping ${id}...`);
      
      const token = this.authService.getToken();
      
      if (!token) {
        console.error('Pas de token JWT disponible');
        throw new Error('Vous devez être connecté pour accéder à ces informations');
      }
      
      console.log(`Appel API: ${config.api.endpoints.camping}/info/${id}`);
      
      const response = await api.get(`${config.api.endpoints.camping}/info/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Réponse API reçue:', response.data);
      
      // Vérifier que la réponse a le bon format
      if (!response.data || !response.data.camping) {
        console.error('Format de réponse invalide:', response.data);
        throw new Error('Format de réponse invalide de l\'API');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des informations du camping:', error);
      
      // Logs détaillés pour aider au débogage
      if (error.response) {
        console.error('Détails de l\'erreur de réponse:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('Pas de réponse reçue:', error.request);
      }
      
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Impossible de récupérer les informations du camping. Veuillez réessayer plus tard.');
    }
  }
} 