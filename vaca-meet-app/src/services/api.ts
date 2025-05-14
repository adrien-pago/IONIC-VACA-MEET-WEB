import axios from 'axios';

// L'URL de base de l'API sera configurée lors du test (pour l'instant on ne la définit pas)
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes par défaut
});

// Méthode pour tester la connexion API
export const testApiConnection = async (url: string): Promise<any> => {
  try {
    const startTime = Date.now();
    const response = await axios.get(url, { timeout: 10000 });
    const endTime = Date.now();
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      time: endTime - startTime,
      success: true
    };
  } catch (error: any) {
    // Formater l'erreur de manière cohérente
    return {
      error: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      time: null,
      success: false
    };
  }
};

export default api; 