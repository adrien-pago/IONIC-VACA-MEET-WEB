import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonToast,
  IonLoading,
  IonRadioGroup,
  IonRadio,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  useIonRouter,
  IonChip,
  IonAvatar,
  IonAlert,
  IonText
} from '@ionic/react';
import { personCircleOutline, saveOutline, lockClosedOutline, checkmarkCircleOutline, colorPaletteOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ProfileService, ProfileUpdateData, UserProfile } from '../../services/profile.service';
import { useTheme, ThemeType } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import BackgroundEffects from '../../components/BackgroundEffects';
import './Account.css';

const Account: React.FC = () => {
  const { currentTheme, changeTheme } = useTheme();
  const router = useIonRouter();
  const authService = new AuthService();
  const profileService = new ProfileService();

  const [activeSegment, setActiveSegment] = useState<'info' | 'theme' | 'password'>('info');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileUpdateData>({
    firstName: '',
    lastName: '',
    username: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(currentTheme);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [animation, setAnimation] = useState('');
  
  // Erreurs de validation
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserProfile();
    
    // Ajouter l'animation après un court délai
    setTimeout(() => {
      setAnimation('animate-slide-up');
    }, 100);
  }, []);

  const loadUserProfile = async () => {
    try {
      setShowLoading(true);
      const userData = await profileService.getFullProfile();
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || ''
      });
      
      // Si l'utilisateur a un thème enregistré, on l'utilise
      if (userData.theme) {
        setSelectedTheme(userData.theme);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement du profil:', error);
      setToastMessage(error.message || 'Impossible de charger le profil');
      setShowToast(true);
    } finally {
      setShowLoading(false);
    }
  };

  const handleInputChange = (e: CustomEvent) => {
    const { name, value } = e.detail;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Réinitialiser l'erreur pour ce champ
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const handlePasswordChange = (e: CustomEvent) => {
    const { name, value } = e.detail;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Réinitialiser l'erreur pour ce champ
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const handleThemeChange = (theme: ThemeType) => {
    setSelectedTheme(theme);
  };

  const validateProfileForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'Le prénom est requis';
      isValid = false;
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Le nom est requis';
      isValid = false;
    }

    if (!formData.username?.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePasswordForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    if (!passwordData.currentPassword?.trim()) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
      isValid = false;
    }

    if (!passwordData.newPassword?.trim()) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
      isValid = false;
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const saveProfile = async () => {
    if (!validateProfileForm()) return;

    try {
      setShowLoading(true);
      const updatedUser = await profileService.updateProfile(formData);
      setUser(updatedUser);
      setToastMessage('Profil mis à jour avec succès');
      setShowToast(true);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setToastMessage(error.message || 'Impossible de mettre à jour le profil');
      setShowToast(true);
    } finally {
      setShowLoading(false);
    }
  };

  const changePassword = async () => {
    if (!validatePasswordForm()) return;

    try {
      setShowLoading(true);
      const result = await profileService.updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setToastMessage('Mot de passe mis à jour avec succès');
      setShowToast(true);
      
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      
      if (error.response && error.response.status === 401) {
        setErrors({
          ...errors,
          currentPassword: 'Mot de passe actuel incorrect'
        });
      } else {
        setToastMessage(error.message || 'Impossible de mettre à jour le mot de passe');
        setShowToast(true);
      }
    } finally {
      setShowLoading(false);
    }
  };

  const saveTheme = async () => {
    try {
      setShowLoading(true);
      
      // Mettre à jour le thème dans le contexte React
      changeTheme(selectedTheme);
      
      // Enregistrer le thème dans la base de données
      await profileService.updateTheme(selectedTheme);
      
      setToastMessage('Thème mis à jour avec succès');
      setShowToast(true);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du thème:', error);
      setToastMessage(error.message || 'Impossible de mettre à jour le thème');
      setShowToast(true);
    } finally {
      setShowLoading(false);
    }
  };

  const handleSegmentChange = (e: CustomEvent) => {
    setActiveSegment(e.detail.value);
  };

  return (
    <IonPage>
      <BackgroundEffects variant="gradient" density="high" animate={false} />
      
      <IonHeader className="ion-no-border transparent-header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton menu="account-menu"></IonMenuButton>
          </IonButtons>
          <IonTitle className="account-title">Mon Compte</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="ion-padding account-content">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="10" sizeLg="8" sizeXl="6">
              <div className={`welcome-container ${animation}`}>
                <div className="avatar-container">
                  <IonAvatar className="account-avatar">
                    <IonIcon icon={personCircleOutline} />
                  </IonAvatar>
                </div>
                <h1 className="account-welcome-title">
                  {user?.firstName} {user?.lastName}
                </h1>
                <IonChip color="primary" className="username-chip">
                  @{user?.username}
                </IonChip>
              </div>
              
              <div className={`segment-container ${animation}`}>
                <IonSegment value={activeSegment} onIonChange={handleSegmentChange}>
                  <IonSegmentButton value="info">
                    <IonLabel>Infos</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="theme">
                    <IonLabel>Thème</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="password">
                    <IonLabel>Mot de passe</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </div>
              
              {/* Section pour les informations du profil */}
              {activeSegment === 'info' && (
                <GlassCard className={`profile-form-card ${animation}`} animated={false}>
                  <h2 className="section-title">
                    <IonIcon icon={personCircleOutline} /> Informations personnelles
                  </h2>
                  
                  <div className="form-container">
                    <IonItem className="form-item">
                      <IonLabel position="floating">Prénom</IonLabel>
                      <IonInput
                        name="firstName"
                        value={formData.firstName}
                        onIonChange={handleInputChange}
                      />
                      {errors.firstName && (
                        <IonText color="danger" className="error-message">{errors.firstName}</IonText>
                      )}
                    </IonItem>
                    
                    <IonItem className="form-item">
                      <IonLabel position="floating">Nom</IonLabel>
                      <IonInput
                        name="lastName"
                        value={formData.lastName}
                        onIonChange={handleInputChange}
                      />
                      {errors.lastName && (
                        <IonText color="danger" className="error-message">{errors.lastName}</IonText>
                      )}
                    </IonItem>
                    
                    <IonItem className="form-item">
                      <IonLabel position="floating">Nom d'utilisateur</IonLabel>
                      <IonInput
                        name="username"
                        value={formData.username}
                        onIonChange={handleInputChange}
                      />
                      {errors.username && (
                        <IonText color="danger" className="error-message">{errors.username}</IonText>
                      )}
                    </IonItem>
                    
                    <div className="form-actions">
                      <IonButton expand="block" onClick={saveProfile}>
                        <IonIcon slot="start" icon={saveOutline} />
                        Enregistrer
                      </IonButton>
                    </div>
                  </div>
                </GlassCard>
              )}
              
              {/* Section pour le thème */}
              {activeSegment === 'theme' && (
                <GlassCard className={`theme-card ${animation}`} animated={false}>
                  <h2 className="section-title">
                    <IonIcon icon={colorPaletteOutline} /> Personnalisation du thème
                  </h2>
                  
                  <div className="theme-selector">
                    <IonRadioGroup value={selectedTheme} onIonChange={e => handleThemeChange(e.detail.value)}>
                      <IonItem className="theme-option">
                        <IonLabel>
                          <h2>Thème par défaut</h2>
                          <p>Violet et rose, le thème signature de Vaca Meet</p>
                        </IonLabel>
                        <div className="theme-preview theme-preview-default"></div>
                        <IonRadio slot="end" value="default" />
                      </IonItem>
                      
                      <IonItem className="theme-option">
                        <IonLabel>
                          <h2>Bleu Ciel</h2>
                          <p>Un thème bleu rafraîchissant et apaisant</p>
                        </IonLabel>
                        <div className="theme-preview theme-preview-blue"></div>
                        <IonRadio slot="end" value="blue" />
                      </IonItem>
                      
                      <IonItem className="theme-option">
                        <IonLabel>
                          <h2>Vert Nature</h2>
                          <p>Des tons verts inspirés par la nature</p>
                        </IonLabel>
                        <div className="theme-preview theme-preview-green"></div>
                        <IonRadio slot="end" value="green" />
                      </IonItem>
                      
                      <IonItem className="theme-option">
                        <IonLabel>
                          <h2>Minimaliste</h2>
                          <p>Design épuré avec des tons blancs et gris</p>
                        </IonLabel>
                        <div className="theme-preview theme-preview-minimal"></div>
                        <IonRadio slot="end" value="minimal" />
                      </IonItem>
                    </IonRadioGroup>
                    
                    <div className="form-actions">
                      <IonButton expand="block" onClick={saveTheme}>
                        <IonIcon slot="start" icon={saveOutline} />
                        Appliquer ce thème
                      </IonButton>
                    </div>
                  </div>
                </GlassCard>
              )}
              
              {/* Section pour le mot de passe */}
              {activeSegment === 'password' && (
                <GlassCard className={`password-card ${animation}`} animated={false}>
                  <h2 className="section-title">
                    <IonIcon icon={lockClosedOutline} /> Changer de mot de passe
                  </h2>
                  
                  <div className="form-container">
                    <IonItem className="form-item">
                      <IonLabel position="floating">Mot de passe actuel</IonLabel>
                      <IonInput
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onIonChange={handlePasswordChange}
                      />
                      {errors.currentPassword && (
                        <IonText color="danger" className="error-message">{errors.currentPassword}</IonText>
                      )}
                    </IonItem>
                    
                    <IonItem className="form-item">
                      <IonLabel position="floating">Nouveau mot de passe</IonLabel>
                      <IonInput
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onIonChange={handlePasswordChange}
                      />
                      {errors.newPassword && (
                        <IonText color="danger" className="error-message">{errors.newPassword}</IonText>
                      )}
                    </IonItem>
                    
                    <IonItem className="form-item">
                      <IonLabel position="floating">Confirmer le nouveau mot de passe</IonLabel>
                      <IonInput
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onIonChange={handlePasswordChange}
                      />
                      {errors.confirmPassword && (
                        <IonText color="danger" className="error-message">{errors.confirmPassword}</IonText>
                      )}
                    </IonItem>
                    
                    <div className="form-actions">
                      <IonButton expand="block" onClick={changePassword}>
                        <IonIcon slot="start" icon={lockClosedOutline} />
                        Mettre à jour le mot de passe
                      </IonButton>
                    </div>
                  </div>
                </GlassCard>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
        
        <IonLoading
          isOpen={showLoading}
          message="Veuillez patienter..."
        />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="top"
        />
        
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Information"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Account; 