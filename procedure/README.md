# Procédures Vaca Meet

Ce dossier contient toutes les procédures et documentations nécessaires pour le développement, le déploiement et la maintenance de l'application Vaca Meet.

## 📋 Sommaire

1. [Installation et Configuration](#installation-et-configuration)
2. [Procédures de Développement](#procédures-de-développement)
3. [Procédures de Déploiement](#procédures-de-déploiement)
4. [Maintenance](#maintenance)
5. [Résolution de Problèmes](#résolution-de-problèmes)

## 📥 Installation et Configuration

### Configuration de l'Environnement de Développement

#### Prérequis Frontend

- Node.js (v14+)
- npm (v6+) ou yarn (v1.22+)
- Ionic CLI (`npm install -g @ionic/cli`)
- Android Studio (pour le développement Android)
- Xcode (pour le développement iOS, Mac uniquement)

```bash
# Installation des outils globaux
npm install -g @ionic/cli native-run cordova-res

# Vérification de l'installation
ionic --version
```

#### Prérequis Backend

- PHP 8.1+
- Composer
- MySQL ou MariaDB
- Symfony CLI
- OpenSSL (pour la génération des clés JWT)

```bash
# Installation de Symfony CLI (Linux/macOS)
curl -sS https://get.symfony.com/cli/installer | bash

# Vérification de l'installation
symfony check:requirements
```

### Installation du Projet

#### Frontend (Ionic React)

```bash
# Cloner le dépôt
git clone https://github.com/votre-repo/IONIC-VACA-MEET-WEB.git
cd IONIC-VACA-MEET-WEB/vaca-meet-app

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local pour définir l'URL de l'API

# Démarrer l'application en mode développement
ionic serve
```

#### Backend (Symfony)

```bash
# Accéder au dossier backend
cd ../vaca-meet-api

# Installer les dépendances
composer install

# Configurer l'environnement
cp .env .env.local
# Éditer .env.local pour configurer la base de données et les clés JWT

# Créer la base de données
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Générer les clés JWT
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
# Choisir une passphrase et la noter
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

# Configurer la passphrase dans .env.local
# JWT_PASSPHRASE=votre_passphrase

# Démarrer le serveur de développement
symfony server:start
```

## 💻 Procédures de Développement

### Workflow de Développement Frontend

1. **Création de Composants React**

```bash
# Créer un nouveau composant
touch src/components/MyComponent.tsx
touch src/components/MyComponent.css
```

Structure recommandée pour les composants:

```typescript
import React from 'react';
import './MyComponent.css';

interface MyComponentProps {
  // Props du composant
}

const MyComponent: React.FC<MyComponentProps> = (props) => {
  // Logique du composant
  
  return (
    <div className="my-component">
      {/* Contenu du composant */}
    </div>
  );
};

export default MyComponent;
```

2. **Création de Pages**

```bash
# Créer une nouvelle page
mkdir -p src/pages/NewPage
touch src/pages/NewPage/NewPage.tsx
touch src/pages/NewPage/NewPage.css
```

3. **Intégration des Routes**

Éditer `src/App.tsx` pour ajouter la nouvelle page:

```typescript
import NewPage from './pages/NewPage/NewPage';

// Dans les routes
<Route path="/new-page" component={NewPage} exact />
```

### Workflow de Développement Backend

1. **Création d'Entités**

```bash
# Générer une nouvelle entité
php bin/console make:entity

# Générer une migration
php bin/console make:migration

# Appliquer la migration
php bin/console doctrine:migrations:migrate
```

2. **Création de Contrôleurs**

```bash
# Générer un nouveau contrôleur
php bin/console make:controller ApiController
```

Structure recommandée pour les contrôleurs API:

```php
<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ApiController extends AbstractController
{
    /**
     * @Route("/api/endpoint", name="api_endpoint", methods={"GET"})
     */
    public function endpoint(Request $request): JsonResponse
    {
        // Logique du contrôleur
        
        return $this->json([
            'message' => 'Success',
            'data' => $data,
        ]);
    }
}
```

3. **Tests API**

Utiliser Postman ou curl pour tester l'API:

```bash
# Exemple de requête d'authentification
curl -X POST -H "Content-Type: application/json" -d '{"username":"user@example.com","password":"password123"}' http://localhost:8000/api/login
```

## 🚀 Procédures de Déploiement

### Déploiement Frontend

#### Build pour le Web

```bash
# Générer le build de production
cd vaca-meet-app
npm run build

# Le résultat se trouve dans le dossier dist/
```

#### Build pour Android

```bash
# Générer le build de production
ionic build --prod

# Ajouter la plateforme Android (première fois uniquement)
npx cap add android

# Copier les fichiers build vers Android
npx cap copy android
npx cap sync android

# Mettre à jour les plugins natifs
npx cap update android

# Ouvrir Android Studio
npx cap open android

# Dans Android Studio:
# - Build > Build Bundle(s) / APK(s) > Build APK(s)
# - L'APK se trouve dans app/build/outputs/apk/debug/
```

### Déploiement Backend sur VPS

#### Prérequis sur le Serveur

- Nginx ou Apache
- PHP 8.1+
- MySQL ou MariaDB
- Composer
- Certificat SSL (Let's Encrypt recommandé)

#### Procédure de Déploiement

1. **Préparation du Serveur**

```bash
# Connexion SSH
ssh user@your-server

# Installation des dépendances
sudo apt update
sudo apt install nginx php8.1-fpm php8.1-cli php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip mysql-server

# Configuration de Nginx
sudo nano /etc/nginx/sites-available/vaca-meet-api
```

Contenu du fichier de configuration Nginx:

```nginx
server {
    listen 80;
    server_name api.vaca-meet.fr;
    root /var/www/vaca-meet-api/public;

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        internal;
    }

    location ~ \.php$ {
        return 404;
    }

    error_log /var/log/nginx/vaca-meet-api_error.log;
    access_log /var/log/nginx/vaca-meet-api_access.log;
}
```

```bash
# Activer la configuration
sudo ln -s /etc/nginx/sites-available/vaca-meet-api /etc/nginx/sites-enabled/
sudo systemctl reload nginx

# Configurer HTTPS avec Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.vaca-meet.fr
```

2. **Déploiement du Code**

```bash
# Créer le dossier du projet
sudo mkdir -p /var/www/vaca-meet-api
sudo chown -R $USER:$USER /var/www/vaca-meet-api

# Cloner le dépôt
git clone https://github.com/votre-repo/IONIC-VACA-MEET-WEB.git /tmp/vaca-meet
cp -r /tmp/vaca-meet/vaca-meet-api/* /var/www/vaca-meet-api/
cd /var/www/vaca-meet-api

# Installer les dépendances
composer install --no-dev --optimize-autoloader

# Configurer l'environnement
cp .env .env.local
nano .env.local  # Configurer les variables d'environnement

# Configurer la base de données
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate

# Générer les clés JWT
mkdir -p config/jwt
openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

# Configurer les permissions
sudo setfacl -R -m u:www-data:rwX -m u:$(whoami):rwX var
sudo setfacl -dR -m u:www-data:rwX -m u:$(whoami):rwX var
sudo chmod -R 777 config/jwt/
```

3. **Mise en Production**

```bash
# Vider le cache
APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear

# Vérifier la configuration
php bin/console doctrine:schema:validate
```

## 🔧 Maintenance

### Mises à Jour Frontend

```bash
# Mise à jour des dépendances
cd vaca-meet-app
npm update

# Vérification des vulnérabilités
npm audit fix

# Régénération des builds
npm run build
```

### Mises à Jour Backend

```bash
# Mise à jour des dépendances
cd vaca-meet-api
composer update

# Exécution des migrations
php bin/console doctrine:migrations:migrate

# Vider le cache
php bin/console cache:clear
```

### Sauvegardes Base de Données

```bash
# Sauvegarde de la base de données
mysqldump -u user -p vaca_meet_db > backup_$(date +%Y%m%d).sql

# Restauration de la base de données
mysql -u user -p vaca_meet_db < backup_file.sql
```

## 🔍 Résolution de Problèmes

### Problèmes Courants Frontend

1. **Erreurs CORS**
   
   Vérifier que le backend a les bons en-têtes CORS configurés:
   
   ```php
   // Dans le fichier cors-handler.php
   if ($request->getMethod() === 'OPTIONS') {
       header('Access-Control-Allow-Origin: *');
       header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
       header('Access-Control-Allow-Headers: Content-Type, Authorization');
       exit(0);
   }
   ```

2. **Problèmes d'Authentification JWT**
   
   - Vérifier que le token est correctement stocké
   - Vérifier que le token est envoyé dans l'en-tête Authorization
   - Vérifier la validité du token (expiration)

### Problèmes Courants Backend

1. **Erreurs de Permission JWT**
   
   Vérifier les permissions des fichiers JWT:
   
   ```bash
   sudo chmod -R 777 config/jwt/
   ```

2. **Erreurs de Base de Données**
   
   Vérifier la connexion à la base de données:
   
   ```bash
   php bin/console doctrine:schema:validate
   ```

### Logs et Monitoring

- **Logs Frontend**: Disponibles dans la console du navigateur
- **Logs Backend**: `/var/log/nginx/vaca-meet-api_error.log` et `var/log/dev.log` ou `var/log/prod.log`

## 📞 Support

Pour toute question ou problème, contacter l'équipe de développement à l'adresse: support@vaca-meet.fr
