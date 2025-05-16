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
  IonText,
  IonBackButton
} from '@ionic/react';
import { personCircleOutline, saveOutline, lockClosedOutline, checkmarkCircleOutline, colorPaletteOutline, arrowBackOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { ProfileService, ProfileUpdateData, UserProfile } from '../../services/profile.service';
import config from '../../services/config';
import { useTheme, ThemeType } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import BackgroundEffects from '../../components/BackgroundEffects';
import './Account.css';
import axios from 'axios';

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
  const [isEditMode, setIsEditMode] = useState(false);
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
    
    // Stocker la référence à la page d'origine au chargement de la page Account
    // Cela permet de conserver l'origine réelle de navigation même si sessionStorage est modifié ailleurs
    const sourcePageSession = sessionStorage.getItem('lastPage');
    const sourcePageLocal = localStorage.getItem('lastPage');
    const sourcePage = sourcePageSession || sourcePageLocal;
    
    if (sourcePage) {
      // Stocker cette référence dans une variable spécifique à cette page
      sessionStorage.setItem('accountPageSource', sourcePage);
      localStorage.setItem('accountPageSource', sourcePage);
      console.log('Source de navigation Account enregistrée:', sourcePage);
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      setShowLoading(true);
      console.log('Chargement du profil utilisateur...');
      
      // Essayer d'abord avec le service de profil dédié
      try {
        const userData = await profileService.getFullProfile();
        console.log('Données utilisateur reçues:', userData);
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
      } catch (profileError) {
        console.error('Erreur avec getFullProfile, fallback sur getUserProfile:', profileError);
        
        // Fallback sur le service auth si le service de profil échoue
        const userData = await authService.getUserProfile();
        console.log('Données utilisateur reçues du fallback:', userData);
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          username: userData.username || ''
        });
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
    console.log('Événement de changement reçu:', e.detail);
    
    // Vérifier que le nom est bien défini
    if (!e.detail.name) {
      console.error('ERREUR: Nom de champ manquant dans l\'événement!', e);
      return;
    }
    
    const { name, value } = e.detail;
    console.log(`Champ ${name} modifié: "${formData[name as keyof ProfileUpdateData]}" -> "${value}"`);
    
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      console.log('Nouveau formData après mise à jour:', newData);
      return newData;
    });
    
    // Réinitialiser l'erreur pour ce champ
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const handlePasswordChange = (e: CustomEvent) => {
    try {
      console.log('Événement de changement de mot de passe reçu:', e.detail);
      
      // Vérifier que les données nécessaires sont présentes
      if (!e.detail || !e.detail.name) {
        console.error('ERREUR: Événement de changement de mot de passe invalide', e);
        return;
      }
      
      const { name, value } = e.detail;
      console.log(`Champ ${name} modifié, nouvelle longueur: ${value?.length || 0}`);
      
      // Mise à jour explicite pour éviter les problèmes de référence
      const updatedData = { ...passwordData };
      updatedData[name as keyof typeof passwordData] = value || '';
      
      console.log('Nouvelles données de mot de passe:', {
        currentPassword: updatedData.currentPassword ? '****' : '',
        newPassword: updatedData.newPassword ? '****' : '',
        confirmPassword: updatedData.confirmPassword ? '****' : ''
      });
      
      setPasswordData(updatedData);
      
      // Réinitialiser l'erreur pour ce champ
      const updatedErrors = { ...errors };
      updatedErrors[name as keyof typeof errors] = '';
      setErrors(updatedErrors);
    } catch (error) {
      console.error('Erreur lors du traitement du changement de mot de passe:', error);
    }
  };

  const handleThemeChange = (theme: ThemeType) => {
    console.log(`Thème sélectionné: ${selectedTheme} -> ${theme}`);
    setSelectedTheme(theme);
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    
    // Si on quitte le mode édition, réinitialiser le formulaire aux valeurs utilisateur
    if (isEditMode && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || ''
      });
    }
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

    // On ne valide plus le username car il n'est pas modifiable
    newErrors.username = '';

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
      console.log('Données actuelles avant envoi:', formData);
      
      // S'assurer que les données sont bien différentes de celles en base
      if (user) {
        const hasChanges = 
          formData.firstName !== user.firstName || 
          formData.lastName !== user.lastName;
          
        console.log('Détection de changements:', hasChanges, {
          'firstName (form/user)': `${formData.firstName}/${user.firstName}`,
          'lastName (form/user)': `${formData.lastName}/${user.lastName}`
        });
        
        if (!hasChanges) {
          console.warn('Aucun changement détecté dans les données!');
          setShowLoading(false);
          setToastMessage('Aucune modification à enregistrer');
          setShowToast(true);
          return;
        }
      }
      
      // Créer une copie explicite des données à envoyer - IMPORTANT: ne pas inclure username
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName
        // username intentionnellement omis pour respecter les contraintes du backend
      };
      
      console.log('Envoi des données pour mise à jour du profil:', dataToSend);
      // Utiliser la nouvelle méthode pour l'API mobile
      const updatedUser = await profileService.updateMobileProfile(dataToSend);
      console.log('Réponse reçue après mise à jour:', updatedUser);
      
      // Mettre à jour l'état avec les données reçues du serveur
      setUser(updatedUser);
      
      setFormData({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        username: updatedUser.username || '' // Conserver le username inchangé
      });
      
      setToastMessage('Profil mis à jour avec succès');
      setShowToast(true);
      setIsEditMode(false); // Quitter le mode édition après la sauvegarde
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setToastMessage(error.message || 'Impossible de mettre à jour le profil');
      setShowToast(true);
    } finally {
      setShowLoading(false);
    }
  };

  const changePassword = async () => {
    if (!validatePasswordForm()) {
      console.log('Validation du formulaire de mot de passe échouée', errors);
      return;
    }

    try {
      setShowLoading(true);
      console.log('Envoi de la demande de modification du mot de passe avec les longueurs:', {
        currentPassword: passwordData.currentPassword.length,
        newPassword: passwordData.newPassword.length
      });
      
      // Utilisons directement l'API plutôt que de passer par le service
      const token = localStorage.getItem(config.storage.tokenKey);
      if (!token) {
        throw new Error('Non authentifié');
      }
      
      const url = `${config.api.baseUrl}${config.api.endpoints.updatePassword}`;
      console.log('URL complète:', url);
      
      const response = await axios.post(url, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Réponse reçue après mise à jour du mot de passe:', response.data);
      
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
      
      // Afficher des détails plus précis sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        if (error.response.status === 401) {
          setErrors({
            ...errors,
            currentPassword: 'Mot de passe actuel incorrect'
          });
        } else {
          setToastMessage(error.response.data?.message || 'Impossible de mettre à jour le mot de passe');
          setShowToast(true);
        }
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
      
      console.log(`Sauvegarde du thème: ${user?.theme || 'default'} -> ${selectedTheme}`);
      
      // Si le thème n'a pas changé, forcer quand même la mise à jour
      if (user?.theme === selectedTheme) {
        console.warn('Le thème sélectionné est identique au thème actuel, mais on force la mise à jour');
      }
      
      // Mettre à jour le thème dans le contexte React
      changeTheme(selectedTheme);
      console.log('Envoi du thème pour mise à jour dans la BD:', selectedTheme);
      
      // Enregistrer le thème dans la base de données
      const updatedUser = await profileService.updateTheme(selectedTheme);
      console.log('Réponse du serveur après mise à jour du thème:', updatedUser);
      
      // Mettre à jour l'utilisateur local avec les données du serveur
      setUser(prev => ({
        ...(prev || {}),
        theme: updatedUser.theme || selectedTheme
      }) as UserProfile);
      
      // Application silencieuse du thème sans message toast
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du thème:', error);
      // On garde le thème mis à jour localement même si l'API échoue
    } finally {
      setShowLoading(false);
    }
  };

  const handleSegmentChange = (e: CustomEvent) => {
    setActiveSegment(e.detail.value);
    // Réinitialiser le mode d'édition si on change de section
    setIsEditMode(false);
  };
  
  const navigateBack = () => {
    // Utiliser la source de navigation spécifique enregistrée au chargement de la page
    const sourcePageSession = sessionStorage.getItem('accountPageSource');
    const sourcePageLocal = localStorage.getItem('accountPageSource');
    const sourcePage = sourcePageSession || sourcePageLocal;
    
    console.log('Navigation retour Account, source =', sourcePage);
    
    // Vérifier si sourcePage existe et contient bien une valeur
    if (sourcePage && sourcePage.trim() !== '') {
      if (sourcePage.startsWith('camping:')) {
        // Si on vient d'une page camping, extraire l'ID et y retourner
        const campingId = sourcePage.split(':')[1];
        console.log('Détecté ID camping (source):', campingId);
        if (campingId) {
          console.log('Navigation vers camping/' + campingId);
          
          // On garde la navigation directe pour éviter les problèmes
          router.push(`/camping/${campingId}`);
          return;
        }
      } else if (sourcePage === 'home') {
        // Si la dernière page est explicitement 'home'
        console.log('Navigation vers home (source)');
        router.push('/home');
        return;
      }
    }
    
    // Si aucune condition n'est remplie ou si sourcePage est vide, retourner à l'accueil par défaut
    console.log('Navigation par défaut vers home');
    router.push('/home');
  };

  // Rendu des informations utilisateur en mode lecture
  const renderUserInfoReadOnly = () => (
    <div className="user-info-readonly">
      <div className="info-card">
        <div className="info-item">
          <div className="info-label">Prénom</div>
          <div className="info-value">{formData.firstName || '-'}</div>
        </div>
        
        <div className="info-item">
          <div className="info-label">Nom</div>
          <div className="info-value">{formData.lastName || '-'}</div>
        </div>
        
        <div className="info-item">
          <div className="info-label">Email</div>
          <div className="info-value">{formData.username || '-'}</div>
        </div>
      </div>
      
      <div className="form-actions">
        <IonButton expand="block" onClick={toggleEditMode} className="edit-button">
          <IonIcon slot="start" icon={personCircleOutline} />
          Modifier mes informations
        </IonButton>
      </div>
    </div>
  );

  // Rendu du formulaire de modification
  const renderUserInfoEditForm = () => (
    <div className="form-container modern-form">
      <div className="edit-form-item">
        <div className="edit-label">Prénom</div>
        <IonInput
          name="firstName"
          value={formData.firstName}
          onIonChange={(e) => {
            console.log('Changement de prénom:', e.detail);
            if (e.detail.value !== undefined) {
              setFormData({
                ...formData,
                firstName: e.detail.value || ''
              });
            }
          }}
          className="edit-input"
        />
        {errors.firstName && (
          <IonText color="danger" className="error-message">{errors.firstName}</IonText>
        )}
      </div>
      
      <div className="edit-form-item">
        <div className="edit-label">Nom</div>
        <IonInput
          name="lastName"
          value={formData.lastName}
          onIonChange={(e) => {
            console.log('Changement de nom:', e.detail);
            if (e.detail.value !== undefined) {
              setFormData({
                ...formData,
                lastName: e.detail.value || ''
              });
            }
          }}
          className="edit-input"
        />
        {errors.lastName && (
          <IonText color="danger" className="error-message">{errors.lastName}</IonText>
        )}
      </div>
      
      <div className="edit-form-item">
        <div className="edit-label">Email</div>
        <div className="email-field-container">
          <IonInput
            name="username"
            value={formData.username}
            disabled={true}
            readonly={true}
            className="edit-input disabled-input"
          />
          <div className="email-info-badge">
            <IonIcon icon={lockClosedOutline} className="lock-icon" />
            <span className="tooltip-text">L'adresse email ne peut pas être modifiée</span>
          </div>
        </div>
        <IonText color="medium" className="email-help-text">
          L'adresse email ne peut pas être modifiée pour des raisons de sécurité.
        </IonText>
      </div>
      
      <div className="form-actions">
        <IonButton expand="block" onClick={saveProfile} color="primary" className="save-button">
          <IonIcon slot="start" icon={saveOutline} />
          Enregistrer
        </IonButton>
        <IonButton expand="block" onClick={toggleEditMode} fill="outline" color="medium" className="cancel-button">
          Annuler
        </IonButton>
      </div>
    </div>
  );

  return (
    <IonPage>
      <BackgroundEffects variant="gradient" density="high" animate={false} />
      
      <IonHeader className="ion-no-border transparent-header">
        <IonToolbar className="aligned-toolbar">
          <IonButtons slot="start" className="aligned-buttons">
            <IonButton className="custom-back-button" onClick={navigateBack}>
              <IonIcon slot="start" icon={arrowBackOutline} />
              Retour
            </IonButton>
          </IonButtons>
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
                  {formData.firstName} {formData.lastName}
                </h1>
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
                  
                  {isEditMode ? renderUserInfoEditForm() : renderUserInfoReadOnly()}
                </GlassCard>
              )}
              
              {/* Section pour le thème */}
              {activeSegment === 'theme' && (
                <GlassCard className={`theme-card ${animation}`} animated={false}>
                  <h2 className="section-title">
                    <IonIcon icon={colorPaletteOutline} /> Personnalisation du thème
                  </h2>
                  
                  <div className="theme-selector">
                    <IonRadioGroup 
                      value={selectedTheme} 
                      onIonChange={e => {
                        console.log('Changement de thème détecté:', e.detail.value);
                        
                        // S'assurer que la valeur est valide
                        if (e.detail.value) {
                          handleThemeChange(e.detail.value);
                        }
                      }}
                    >
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
                      <IonButton expand="block" onClick={() => {
                        console.log('Bouton de sauvegarde du thème cliqué, valeur: ', selectedTheme);
                        saveTheme();
                      }}>
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
                  
                  <div className="form-container modern-form">
                    <div className="edit-form-item">
                      <div className="edit-label">Mot de passe actuel</div>
                      <IonInput
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onIonInput={(e: any) => {
                          const value = e.target.value || '';
                          setPasswordData({
                            ...passwordData,
                            currentPassword: value
                          });
                          if (errors.currentPassword) {
                            setErrors({
                              ...errors,
                              currentPassword: ''
                            });
                          }
                        }}
                        className="edit-input"
                      />
                      {errors.currentPassword && (
                        <IonText color="danger" className="error-message">{errors.currentPassword}</IonText>
                      )}
                    </div>
                    
                    <div className="edit-form-item">
                      <div className="edit-label">Nouveau mot de passe</div>
                      <IonInput
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onIonInput={(e: any) => {
                          const value = e.target.value || '';
                          setPasswordData({
                            ...passwordData,
                            newPassword: value
                          });
                          if (errors.newPassword) {
                            setErrors({
                              ...errors,
                              newPassword: ''
                            });
                          }
                        }}
                        className="edit-input"
                      />
                      {errors.newPassword && (
                        <IonText color="danger" className="error-message">{errors.newPassword}</IonText>
                      )}
                    </div>
                    
                    <div className="edit-form-item">
                      <div className="edit-label">Confirmer le nouveau mot de passe</div>
                      <IonInput
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onIonInput={(e: any) => {
                          const value = e.target.value || '';
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: value
                          });
                          if (errors.confirmPassword) {
                            setErrors({
                              ...errors,
                              confirmPassword: ''
                            });
                          }
                        }}
                        className="edit-input"
                      />
                      {errors.confirmPassword && (
                        <IonText color="danger" className="error-message">{errors.confirmPassword}</IonText>
                      )}
                    </div>
                    
                    <div className="form-actions">
                      <IonButton expand="block" onClick={changePassword} color="primary" className="save-button">
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
        
    
      </IonContent>
    </IonPage>
  );
};

export default Account; 