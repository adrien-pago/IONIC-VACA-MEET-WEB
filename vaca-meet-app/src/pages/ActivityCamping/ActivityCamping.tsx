import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  useIonRouter,
  IonCard
} from '@ionic/react';
import { chevronBack, chevronForward, arrowBack } from 'ionicons/icons';
import './ActivityCamping.css';
import BackgroundEffects from '../../components/BackgroundEffects';
import { useParams } from 'react-router';

interface RouteParams {
  id: string;
}

// Jours de la semaine pour le planning
const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Plages horaires pour le planning
const TIME_SLOTS = [
  '8h - 9h',
  '9h - 10h',
  '10h - 11h',
  '11h - 12h',
  '12h - 13h',
  '13h - 14h',
  '14h - 15h',
  '15h - 16h',
  '16h - 17h',
  '17h - 18h',
  '18h - 19h',
  'Soirée'
];

// Interface pour les activités
interface Activity {
  id: number;
  title: string;
  day: number; // 0 = Lundi, 1 = Mardi, etc.
  timeSlot: number; // 0 = 8h-9h, 1 = 9h-10h, etc.
  type: string; // fitness, yoga, water, sport, etc.
}

// Exemple d'activités pour la semaine
const SAMPLE_ACTIVITIES: Activity[] = [
  { id: 1, title: 'Réveil musculaire', day: 0, timeSlot: 0, type: 'fitness' },
  { id: 2, title: 'Yoga matinal', day: 1, timeSlot: 1, type: 'yoga' },
  { id: 3, title: 'Footing matinal', day: 2, timeSlot: 0, type: 'fitness' },
  { id: 4, title: 'Méditation guidée', day: 4, timeSlot: 0, type: 'meditation' },
  { id: 5, title: 'Pilates', day: 3, timeSlot: 1, type: 'yoga' },
  { id: 6, title: 'Gym tonique', day: 5, timeSlot: 1, type: 'fitness' },
  { id: 7, title: 'Stretching doux', day: 6, timeSlot: 1, type: 'yoga' },
  { id: 8, title: 'Aquagym', day: 0, timeSlot: 2, type: 'water' },
  { id: 9, title: 'Atelier poterie', day: 2, timeSlot: 2, type: 'workshop' },
  { id: 10, title: 'Water-polo', day: 4, timeSlot: 2, type: 'water' },
  { id: 11, title: 'Tournoi de volleyball', day: 1, timeSlot: 3, type: 'sport' },
  { id: 12, title: 'Tournoi de tennis de table', day: 3, timeSlot: 3, type: 'sport' },
  { id: 13, title: 'Baptême de plongée', day: 5, timeSlot: 3, type: 'water' },
  { id: 14, title: 'Concours de châteaux de sable', day: 6, timeSlot: 3, type: 'kids' },
  { id: 15, title: 'Atelier créatif enfants', day: 0, timeSlot: 6, type: 'kids' },
  { id: 16, title: 'Initiation paddle', day: 1, timeSlot: 6, type: 'water' },
  { id: 17, title: 'Olympiades enfants', day: 2, timeSlot: 6, type: 'kids' },
  { id: 18, title: 'Initiation au kayak', day: 3, timeSlot: 6, type: 'water' },
  { id: 19, title: 'Atelier fabrication de cerfs-volants', day: 4, timeSlot: 6, type: 'workshop' },
  { id: 20, title: 'Grand jeu familial', day: 5, timeSlot: 6, type: 'leisure' },
  { id: 21, title: 'Tournoi de football', day: 6, timeSlot: 6, type: 'sport' },
  { id: 22, title: 'Excursion nature', day: 2, timeSlot: 7, type: 'leisure' },
  { id: 23, title: 'Balade à vélo', day: 6, timeSlot: 7, type: 'leisure' },
  { id: 24, title: 'Tournoi de pétanque', day: 0, timeSlot: 8, type: 'sport' },
  { id: 25, title: 'Chasse au trésor', day: 1, timeSlot: 8, type: 'kids' },
  { id: 26, title: 'Atelier maquillage enfants', day: 3, timeSlot: 8, type: 'kids' },
  { id: 27, title: 'Tournoi de beach-volley', day: 4, timeSlot: 8, type: 'sport' },
  { id: 28, title: 'Atelier pâtisserie', day: 4, timeSlot: 9, type: 'food' },
  { id: 29, title: 'Marché artisanal', day: 5, timeSlot: 9, type: 'culture' },
  { id: 30, title: 'Atelier cuisine locale', day: 1, timeSlot: 10, type: 'food' },
  { id: 31, title: 'Dégustation de vins', day: 2, timeSlot: 10, type: 'food' },
  { id: 32, title: 'Cours de cocktails', day: 3, timeSlot: 10, type: 'food' },
  { id: 33, title: 'Barbecue géant', day: 6, timeSlot: 10, type: 'food' }
];

const ActivityCamping: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const router = useIonRouter();
  
  // Fonction pour obtenir la semaine actuelle (lundi au dimanche)
  const getCurrentWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 pour dimanche, 1 pour lundi, etc.
    
    // Calculer le lundi de la semaine
    const monday = new Date(now);
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si aujourd'hui est dimanche, on recule de 6 jours
    monday.setDate(now.getDate() + mondayOffset);
    
    // Calculer le dimanche de la semaine
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    // Format complet de la date (dd/MM/YYYY)
    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    return {
      monday: monday,
      sunday: sunday,
      display: `${formatDate(monday)} - ${formatDate(sunday)}`
    };
  };

  // État pour la semaine actuelle
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());

  // Fonction pour passer à la semaine précédente
  const goToPreviousWeek = () => {
    const prevMonday = new Date(currentWeek.monday);
    prevMonday.setDate(prevMonday.getDate() - 7);
    
    const prevSunday = new Date(prevMonday);
    prevSunday.setDate(prevMonday.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    setCurrentWeek({
      monday: prevMonday,
      sunday: prevSunday,
      display: `${formatDate(prevMonday)} - ${formatDate(prevSunday)}`
    });
  };

  // Fonction pour passer à la semaine suivante
  const goToNextWeek = () => {
    const nextMonday = new Date(currentWeek.monday);
    nextMonday.setDate(nextMonday.getDate() + 7);
    
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    setCurrentWeek({
      monday: nextMonday,
      sunday: nextSunday,
      display: `${formatDate(nextMonday)} - ${formatDate(nextSunday)}`
    });
  };
  
  // Fonction pour retourner à la page précédente
  const handleBack = () => {
    router.push(`/camping/${id}`);
  };
  
  // Générer les en-têtes des jours avec la date du jour
  const generateDayHeaders = () => {
    const startDate = new Date(currentWeek.monday);
    const today = new Date();
    
    return DAYS_OF_WEEK.map((day, index) => {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + index);
      
      // Vérifier si c'est le jour actuel
      const isToday = (
        today.getDate() === currentDate.getDate() &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear()
      );
      
      return (
        <div key={day} className={`schedule-day-header ${isToday ? 'current-day' : ''}`}>
          <div className="day-name">{day}</div>
        </div>
      );
    });
  };

  // Fonction pour récupérer une activité pour une cellule spécifique
  const getActivityForCell = (dayIndex: number, timeSlotIndex: number) => {
    return SAMPLE_ACTIVITIES.find(activity => 
      activity.day === dayIndex && activity.timeSlot === timeSlotIndex
    );
  };

  // Fonction pour afficher une activité
  const renderActivity = (activity: Activity) => {
    return (
      <div className={`activity-item activity-${activity.type}`}>
        {activity.title}
      </div>
    );
  };

  // Fonction pour gérer le clic sur une activité
  const handleActivityClick = (activity: Activity) => {
    console.log('Activité cliquée:', activity);
    // Ici vous pourriez afficher un modal avec les détails de l'activité
  };

  return (
    <IonPage>
      <BackgroundEffects variant="gradient" density="high" animate={false} useThemeColors={true} />
      
      <IonHeader className="ion-no-border">
        <IonToolbar className="aligned-toolbar">
          <IonButtons slot="start" className="aligned-buttons">
            <IonButton className="custom-back-button" onClick={handleBack}>
              <IonIcon slot="start" icon={arrowBack} />
              Retour
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="10" sizeLg="8" sizeXl="6">
              <div className="week-selector">
                <h2 className="week-title">Semaine du</h2>
                
                <div className="date-navigation">
                  <IonButton 
                    fill="clear" 
                    className="week-arrow-button"
                    onClick={goToPreviousWeek}
                  >
                    <IonIcon icon={chevronBack} />
                  </IonButton>
                  
                  <div className="week-date">{currentWeek.display}</div>
                  
                  <IonButton 
                    fill="clear" 
                    className="week-arrow-button"
                    onClick={goToNextWeek}
                  >
                    <IonIcon icon={chevronForward} />
                  </IonButton>
                </div>
              </div>
              
              {/* Planning hebdomadaire */}
              <IonCard className="schedule-card">
                <div className="schedule-scroll-wrapper">
                  <div className="schedule-container">
                    {/* En-tête des jours */}
                    <div className="schedule-header">
                      <div className="time-column-header">Horaire</div>
                      <div className="days-header">
                        {generateDayHeaders()}
                      </div>
                    </div>
                    
                    {/* Corps du planning avec les heures et cellules */}
                    <div className="schedule-body">
                      {TIME_SLOTS.map((timeSlot, timeIndex) => (
                        <div key={timeSlot} className={`schedule-row ${timeSlot === 'Soirée' ? 'evening-row' : ''}`}>
                          <div className="time-slot">{timeSlot}</div>
                          <div className="day-cells">
                            {DAYS_OF_WEEK.map((day, dayIndex) => {
                              const activity = getActivityForCell(dayIndex, timeIndex);
                              return (
                                <div 
                                  key={`${timeSlot}-${day}`} 
                                  className={`schedule-cell ${timeSlot === 'Soirée' ? 'evening-cell' : ''}`}
                                >
                                  {activity && renderActivity(activity)}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ActivityCamping; 