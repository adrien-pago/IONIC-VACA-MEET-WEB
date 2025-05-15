# Vaca Meet - Application Mobile avec API Backend

## Architecture du Projet

L'application Vaca Meet est une application mobile hybride développée avec Ionic et React, connectée à une API backend développée avec Symfony 6.4.

### Structure du Projet

Le projet est divisé en deux parties principales :

1. **Frontend (vaca-meet-app)** : Application mobile Ionic/React
2. **Backend (vaca-meet-api)** : API REST développée avec Symfony

#### Structure du Frontend (vaca-meet-app)

```
vaca-meet-app/
├── public/                 # Ressources statiques
├── src/                    # Code source de l'application
│   ├── components/         # Composants React réutilisables
│   │   └── PrivateRoute.tsx # Composant pour la protection des routes
│   ├── pages/              # Pages de l'application
│   │   ├── Home/           # Organisation par dossiers pour chaque page
│   │   │   ├── Home.tsx    # Logique et structure de la page
│   │   │   └── Home.css    # Styles spécifiques à la page
│   │   ├── Login/          
│   │   │   ├── Login.tsx
│   │   │   └── Login.css
│   │   └── Register/
│   │       ├── Register.tsx
│   │       └── Register.css
│   ├── services/           # Services pour la communication avec l'API
│   │   └── authService.ts  # Service pour l'authentification
│   ├── styles/             # Styles globaux et variables CSS
│   │   ├── global.css      # Styles appliqués globalement
│   │   └── variables.css   # Variables CSS pour les couleurs, polices, etc.
│   ├── theme/              # Configuration des thèmes Ionic
│   ├── App.tsx             # Point d'entrée de l'application React
│   └── main.tsx            # Point d'entrée pour le rendu de l'application
├── capacitor.config.ts     # Configuration Capacitor pour le déploiement natif
├── ionic.config.json       # Configuration Ionic
├── package.json            # Dépendances et scripts npm
└── tsconfig.json           # Configuration TypeScript
```

#### Structure du Backend (vaca-meet-api)

```
vaca-meet-api/
├── bin/                    # Fichiers binaires, dont la console Symfony
├── config/                 # Configuration de l'application
│   ├── packages/           # Configuration des bundles
│   │   ├── security.yaml   # Configuration de la sécurité
│   │   └── lexik_jwt_authentication.yaml # Configuration JWT
│   ├── routes/             # Configuration des routes
│   └── jwt/                # Clés JWT (private.pem, public.pem)
├── migrations/             # Migrations de base de données
├── src/                    # Code source de l'API
│   ├── Controller/         # Contrôleurs
│   │   ├── AuthController.php # Gestion de l'authentification
│   │   └── UserController.php # Gestion des utilisateurs
│   ├── Entity/             # Entités (modèles de données)
│   │   └── User.php        # Entité utilisateur
│   └── Repository/         # Repositories pour accéder aux données
│       └── UserRepository.php # Repository pour l'entité User
├── .env                    # Variables d'environnement par défaut
├── .env.local              # Variables d'environnement locales (non commité)
├── composer.json           # Dépendances PHP
└── symfony.lock            # Verrouillage des versions des dépendances
```

### Technologies Utilisées

#### Frontend
- **Ionic Framework** : Framework UI pour le développement d'applications mobiles hybrides
- **React** : Bibliothèque JavaScript pour construire l'interface utilisateur
- **TypeScript** : Langage de programmation typé, superset de JavaScript
- **Axios** : Client HTTP pour les requêtes API
- **Capacitor** : Pour transformer l'application web en application mobile native

#### Backend
- **Symfony 6.4** : Framework PHP pour le développement d'API
- **Doctrine ORM** : ORM pour la gestion des données
- **Lexik JWT Authentication Bundle** : Pour l'authentification par token JWT
- **MySQL** : Base de données relationnelle

### Flux d'Authentification

1. **Inscription** : L'utilisateur s'inscrit via la page Register
2. **Connexion** : L'utilisateur se connecte via la page Login
3. **Token JWT** : Le serveur renvoie un token JWT en cas de connexion réussie
4. **Stockage** : Le token est stocké dans le localStorage du navigateur
5. **Autorisation** : Toutes les requêtes API incluent ce token dans les en-têtes HTTP
6. **Protection** : Les routes sensibles sont protégées côté frontend (PrivateRoute) et backend (security.yaml)

### Endpoints API

#### Authentification
- **POST /api/register** : Inscription d'un nouvel utilisateur
  - Corps : `{ email, password, firstName, lastName }`
  - Réponse : `{ user, message }`

- **POST /api/login** : Authentification
  - Corps : `{ email, password }`
  - Réponse : `{ user, token }`

#### Utilisateur
- **GET /api/user/profile** : Récupération du profil utilisateur
  - En-tête : `Authorization: Bearer {token}`
  - Réponse : `{ user }`

### Installation et Démarrage

#### Frontend (Ionic/React)

```bash
# Se positionner dans le dossier du frontend
cd vaca-meet-app

# Installation des dépendances
npm install

# Démarrage du serveur de développement
ionic serve

# Construction pour la production
ionic build

# Ajout des plateformes natives (optionnel)
ionic capacitor add android
ionic capacitor add ios

# Reconstruire et redéployer l'application :
npm run build
npx cap copy android
npx cap open android

```

#### Backend (Symfony API)

```bash
# Se positionner dans le dossier du backend
cd /var/www/vhosts/vaca-meet.fr/mobile.vaca-meet.fr/vaca-meet-api
cd vaca-meet-api

# Installation des dépendances
composer install

# Configuration de la base de données dans .env.local
# DATABASE_URL="mysql://user:password@127.0.0.1:3306/vaca_meet"

# Création de la base de données
php bin/console doctrine:database:create

# Exécution des migrations
php bin/console doctrine:migrations:migrate

# Génération des clés JWT
php bin/console lexik:jwt:generate-keypair

# Démarrage du serveur de développement
symfony server:start

cd vaca-meet-api
symfony server:start --port=8000 --no-tls --allow-all-ip
```

## Personnalisation et Extension

### Ajout de fonctionnalités côté Frontend

1. Créez de nouveaux services dans le dossier `services/`
2. Ajoutez de nouvelles pages dans le dossier `pages/`
3. Créez des composants réutilisables dans le dossier `components/`
4. Mettez à jour les routes dans `App.tsx`

### Ajout de fonctionnalités côté Backend

1. Créez de nouvelles entités avec `php bin/console make:entity`
2. Créez des contrôleurs avec `php bin/console make:controller`
3. Générez des migrations avec `php bin/console make:migration`
4. Appliquez les migrations avec `php bin/console doctrine:migrations:migrate`

## Configuration

### Configuration Frontend

Assurez-vous de configurer correctement l'URL de base de votre API Symfony dans le fichier `src/services/authService.ts`.

```typescript
// URL de base de l'API
const API_URL = 'http://localhost:8000/api';
```

### Configuration Backend

Les principales configurations se trouvent dans :

1. `.env.local` : Configuration de la base de données et clés JWT
2. `config/packages/security.yaml` : Configuration de sécurité
3. `config/packages/lexik_jwt_authentication.yaml` : Configuration JWT 