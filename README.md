# Vaca Meet

Application mobile moderne développée avec Ionic React en frontend et Symfony en backend pour les API.

## 📱 Présentation du Projet

Vaca Meet est une application mobile hybride permettant aux utilisateurs de se connecter et d'avoir connaissance de toutes les activité et plus du camping. Elle utilise une architecture moderne avec un frontend mobile Ionic/React et un backend API RESTful Symfony.

![Vaca Meet Screenshot](https://via.placeholder.com/600x300.png?text=Vaca+Meet+App)

## 🏗️ Architecture Technique

Le projet est divisé en deux parties principales:

### Frontend (vaca-meet-app)

Application mobile hybride développée avec Ionic et React, offrant une expérience utilisateur moderne et fluide.

### Backend (vaca-meet-api)

API RESTful développée avec Symfony 6.4, gérant l'authentification JWT, la persistance des données et la logique métier.

## 🗂️ Structure du Projet

```
IONIC-VACA-MEET-WEB/
├── vaca-meet-app/         # Frontend Ionic React
├── vaca-meet-api/         # Backend Symfony
└── procedure/             # Documentation et procédures
```

## 📲 Frontend (vaca-meet-app)

### Technologies utilisées

- **Ionic Framework**: UI components, animations et navigation
- **React**: Bibliothèque UI pour le développement des composants
- **TypeScript**: Typage statique pour JavaScript
- **Capacitor**: Accès aux fonctionnalités natives
- **Axios**: Client HTTP pour les appels API

### Structure du Frontend

```
vaca-meet-app/
├── public/                # Ressources statiques
├── src/
│   ├── assets/            # Images, fonts et ressources
│   │   ├── AnimatedButton.tsx    # Bouton avec animations
│   │   ├── AnimatedInput.tsx     # Champ de saisie moderne
│   │   ├── BackgroundEffects.tsx # Effets visuels d'arrière-plan
│   │   └── GlassCard.tsx         # Carte avec effet glassmorphism
│   ├── context/           # Contextes React (authentification, etc.)
│   ├── hooks/             # Hooks personnalisés
│   ├── pages/             # Pages de l'application
│   │   ├── Home/          # Page d'accueil
│   │   ├── Login/         # Authentification
│   │   └── Register/      # Création de compte
│   ├── services/          # Services (API, authentification)
│   ├── styles/            # Styles globaux
│   ├── theme/             # Thèmes Ionic
│   └── utils/             # Utilitaires
├── capacitor.config.ts    # Configuration Capacitor
├── ionic.config.json      # Configuration Ionic
├── package.json           # Dépendances NPM
└── tsconfig.json          # Configuration TypeScript
```

### Fonctionnalités Frontend

- **Design System**: Interface utilisateur moderne et cohérente
- **Animations fluides**: Transitions et effets visuels
- **Mode sombre**: Support automatique du thème clair/sombre
- **Responsive Design**: S'adapte à toutes les tailles d'écran
- **Sécurité**: Authentification JWT avec stockage sécurisé
- **Glassmorphism**: Effets visuels modernes

## 🖥️ Backend (vaca-meet-api)

### Technologies utilisées

- **Symfony 6.4**: Framework PHP moderne
- **Doctrine ORM**: Mapping objet-relationnel
- **Lexik JWT**: Authentification par token JWT
- **API Platform**: Simplification du développement d'API REST

### Structure du Backend

```
vaca-meet-api/
├── bin/                   # Binaires Symfony (console)
├── config/                # Configuration de l'application
│   ├── jwt/               # Clés JWT (private.pem, public.pem)
│   ├── packages/          # Configuration des bundles
│   └── routes/            # Configuration des routes
├── migrations/            # Migrations de base de données
├── public/                # Point d'entrée de l'application
├── src/
│   ├── Command/           # Commandes console
│   ├── Controller/        # Contrôleurs API
│   │   └── MobileAuthController.php   # Auth pour l'app mobile
│   ├── Entity/            # Entités (modèles de données)
│   │   └── UserMobile.php # Entité utilisateur mobile
│   └── Repository/        # Repositories pour l'accès aux données
├── vendor/                # Dépendances PHP
├── .env                   # Configuration par défaut
└── composer.json          # Dépendances Composer
```

### Points d'API

#### Authentification

- **POST /api/register**: Inscription d'un nouvel utilisateur
  - Corps de la requête: `{ username, password, firstName, lastName }`
  - Réponse: `{ user, message }`

- **POST /api/login**: Authentification
  - Corps de la requête: `{ username, password }`
  - Réponse: `{ token, user }`

#### Utilisateur

- **GET /api/mobile/user**: Récupération du profil utilisateur
  - Entête: `Authorization: Bearer {token}`
  - Réponse: `{ id, username, firstName, lastName, email }`

#### API Test

- **GET /api/mobile/test**: Test de la connexion API
  - Réponse: `{ message, timestamp }`

## 📋 Procédures (procedure/)

Les procédures détaillées se trouvent dans le dossier `procedure/`, incluant:

- Installation des environnements de développement
- Lancement du projet en développement
- Compilation et build
- Déploiement sur VPS
- Maintenance et mises à jour

Pour accéder à ces procédures, consultez le [README du dossier Procédure](./procedure/README.md).

## 🚀 Démarrage Rapide

### Frontend (Ionic React)

```bash
# Installation des dépendances
cd vaca-meet-app
npm install

# Démarrage en développement
npm start

# Build pour production
npm run build

# Build Android
npx cap add android
npx cap copy android
npx cap open android
```

### Backend (Symfony)

```bash
# Installation des dépendances
cd vaca-meet-api
composer install

# Configuration de la base de données dans .env.local
# DATABASE_URL="mysql://user:password@127.0.0.1:3306/vaca_meet"

# Migrations de base de données
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Génération des clés JWT
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

# Démarrage du serveur de développement
symfony server:start
```

## 📝 Documentation Supplémentaire

Pour plus d'informations sur les composants et leur utilisation, consultez la documentation dans le dossier `procedure/`.

## 🔒 Sécurité

- Authentification JWT
- Validation des données côté serveur
- Protection CSRF
- Stockage sécurisé des tokens

## 👥 Contribuer

1. Fork le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add some amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence.
