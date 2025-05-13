# Vaca Meet - Application Mobile

## Architecture du Projet

L'application Vaca Meet est une application mobile hybride développée avec Ionic et React. Elle est conçue pour communiquer avec une API backend développée avec Symfony.

### Structure du Projet

```
vaca-meet-app/
├── public/                 # Ressources statiques
├── src/                    # Code source de l'application
│   ├── components/         # Composants React réutilisables
│   ├── pages/              # Pages de l'application
│   │   ├── Home/           # Organisation par dossiers pour chaque page
│   │   │   ├── Home.tsx    # Logique et structure de la page
│   │   │   ├── Home.css    # Styles spécifiques à la page
│   │   │   └── HomeEvents.ts # Gestionnaires d'événements pour la page
│   │   ├── Login/          
│   │   │   ├── Login.tsx
│   │   │   ├── Login.css
│   │   │   └── LoginEvents.ts
│   │   └── Register/
│   │       ├── Register.tsx
│   │       ├── Register.css
│   │       └── RegisterEvents.ts
│   ├── services/           # Services pour la communication avec l'API
│   │   ├── api.ts          # Configuration de base pour les requêtes API
│   │   └── authService.ts  # Service pour l'authentification
│   ├── hooks/              # Hooks React personnalisés
│   │   ├── useForm.ts      # Hook pour gérer les formulaires
│   │   └── useAuth.ts      # Hook pour gérer l'authentification
│   ├── styles/             # Styles globaux et variables CSS
│   │   ├── global.css      # Styles appliqués globalement
│   │   └── variables.css   # Variables CSS pour les couleurs, polices, etc.
│   ├── utils/              # Fonctions utilitaires
│   │   ├── validators.ts   # Validateurs de formulaires
│   │   └── formatters.ts   # Fonctions de formatage (dates, devises...)
│   ├── theme/              # Configuration des thèmes Ionic
│   ├── App.tsx             # Point d'entrée de l'application React
│   └── main.tsx            # Point d'entrée pour le rendu de l'application
├── capacitor.config.ts     # Configuration Capacitor pour le déploiement natif
├── ionic.config.json       # Configuration Ionic
├── package.json            # Dépendances et scripts npm
└── tsconfig.json           # Configuration TypeScript
```

### Technologies Utilisées

- **Ionic Framework**: Framework UI pour le développement d'applications mobiles hybrides
- **React**: Bibliothèque JavaScript pour construire l'interface utilisateur
- **TypeScript**: Langage de programmation typé, superset de JavaScript
- **Axios**: Client HTTP pour les requêtes API
- **Capacitor**: Pour transformer l'application web en application mobile native

### Flux de Données

1. **Services API**: Les services (`api.ts` et `authService.ts`) gèrent la communication avec le backend Symfony
2. **Pages**: Les composants React qui représentent les différentes vues de l'application
3. **État de l'application**: Géré localement dans les composants React avec useState et useEffect

### Gestion des Styles CSS

Pour une meilleure organisation, les styles sont structurés de la manière suivante:

1. **Styles globaux**: Dans le dossier `src/styles/`, pour les styles communs à toute l'application
2. **Styles par composant**: Chaque page ou composant a son propre fichier CSS dans le même dossier que le composant
3. **Variables CSS**: Définies dans `src/styles/variables.css` pour maintenir la cohérence du design

Exemple d'utilisation:
```css
/* Dans src/styles/variables.css */
:root {
  --primary-color: #3880ff;
  --secondary-color: #3dc2ff;
  --text-color: #333333;
}

/* Dans src/pages/Home/Home.css */
.home-container {
  background-color: var(--primary-color);
  color: var(--text-color);
}
```

### Gestion des Événements avec React

Dans React, les événements sont gérés de manière déclarative. Pour une meilleure organisation, vous pouvez:

1. **Définir les gestionnaires d'événements** dans des fichiers séparés par page (ex: `HomeEvents.ts`)
2. **Utiliser des hooks personnalisés** pour la logique réutilisable
3. **Passer les événements via les props** des composants

Exemple d'implémentation:

```typescript
// src/pages/Login/LoginEvents.ts
import { FormEvent } from 'react';
import AuthService from '../../services/authService';

export const handleSubmit = async (
  event: FormEvent, 
  credentials: { email: string; password: string },
  onSuccess: () => void,
  onError: (message: string) => void
) => {
  event.preventDefault();
  
  try {
    await AuthService.login(credentials);
    onSuccess();
  } catch (error) {
    onError('Échec de la connexion');
  }
};

// Dans src/pages/Login/Login.tsx
import { handleSubmit } from './LoginEvents';

const Login: React.FC = () => {
  // ...
  
  const onLoginSuccess = () => {
    router.push('/home');
  };
  
  const onLoginError = (message: string) => {
    setErrorMessage(message);
    setShowAlert(true);
  };
  
  return (
    <form onSubmit={(e) => handleSubmit(e, credentials, onLoginSuccess, onLoginError)}>
      {/* Contenu du formulaire */}
    </form>
  );
};
```

### Authentification

Le système d'authentification utilise un flux classique basé sur les tokens JWT :

1. L'utilisateur s'authentifie via la page de connexion ou s'inscrit via la page d'inscription
2. Le serveur renvoie un token JWT en cas de succès
3. Le token est stocké dans le localStorage du navigateur
4. Toutes les requêtes ultérieures incluent ce token dans les en-têtes HTTP
5. Le service `api.ts` utilise un intercepteur Axios pour ajouter automatiquement le token

### Routes Principales

- `/home` : Page d'accueil affichant un message de bienvenue ou les informations de l'utilisateur connecté
- `/login` : Page de connexion utilisateur
- `/register` : Page d'inscription utilisateur

### Communication avec l'API Symfony

L'application communique avec le backend Symfony via les endpoints suivants :

- `/api/login_check` : Authentification (POST)
- `/api/register` : Inscription (POST)
- `/api/user/profile` : Récupération du profil utilisateur (GET)

### Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
ionic serve

# Construction pour la production
ionic build

# Ajout des plateformes natives
ionic capacitor add android
ionic capacitor add ios

# Construction et copie des assets pour mobile
ionic capacitor copy

# Ouverture des projets natifs
ionic capacitor open android
ionic capacitor open ios
```

## Personnalisation et Extension

Pour étendre l'application :

1. Créez de nouveaux services dans le dossier `services/` pour communiquer avec différentes parties de votre API
2. Ajoutez de nouvelles pages dans le dossier `pages/` en suivant la structure dossier/composant/CSS/événements
3. Créez des composants réutilisables dans le dossier `components/`
4. Mettez à jour les routes dans `App.tsx`

## Configuration de l'API Backend

Assurez-vous de configurer correctement l'URL de base de votre API Symfony dans le fichier `src/services/api.ts`. 