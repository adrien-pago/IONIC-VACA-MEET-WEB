# Procédure de Déploiement sur Émulateurs Mobile

Ce document détaille les étapes nécessaires pour lancer l'application Vaca Meet sur des émulateurs Android et iOS.

## Partie 1: Déploiement sur Émulateur Android

### Prérequis

- Android Studio installé
- Node.js et npm installés
- Ionic CLI installé (`npm install -g @ionic/cli`)
- JDK 11 ou supérieur installé
- Variables d'environnement correctement configurées (JAVA_HOME, ANDROID_HOME)

### Préparation de l'environnement Android

1. **Ouvrir Android Studio**

2. **Préparation de l'application Ionic pour Android** :
   ```bash
   # Se positionner dans le dossier de l'application frontend
   cd vaca-meet-app

   # Ajouter la plateforme Android au projet Ionic
   ionic capacitor add android

   # Compiler l'application pour Android
   ionic capacitor build android
   ```
   Cette dernière commande construit l'application et synchronise les fichiers avec le projet Android.

### Résolution de l'erreur de compatibilité Android Gradle Plugin

Si vous rencontrez cette erreur dans Android Studio :
```
The project is using an incompatible version (AGP 8.7.2) of the Android Gradle plugin. Latest supported version is AGP 8.6.0
```

Suivez ces étapes pour résoudre le problème :

1. **Ouvrir le fichier `android/build.gradle`** dans votre projet

2. **Localiser la ligne qui définit la version du plugin Gradle** :
   ```gradle
   classpath 'com.android.tools.build:gradle:8.7.2'  // Remplacer par la version compatible
   ```

3. **Modifier la version pour utiliser celle compatible avec votre Android Studio** :
   ```gradle
   classpath 'com.android.tools.build:gradle:8.6.0'  // Version compatible avec votre Android Studio
   ```

4. **Synchroniser le projet** :
   - Cliquer sur "Sync Now" dans la notification qui apparaît, ou
   - Dans le menu, sélectionner "File > Sync Project with Gradle Files"

5. **Alternative** : Si vous préférez mettre à jour Android Studio plutôt que de rétrograder la version du plugin, vous pouvez télécharger la dernière version d'Android Studio depuis le site officiel.

### Configuration de l'émulateur Android

1. **Dans Android Studio, configurer un émulateur** :
   - Ouvrir le projet Android généré (le dossier `android` dans le projet Ionic)
   - Cliquer sur "AVD Manager" (Android Virtual Device Manager) dans la barre d'outils ou via le menu "Tools > AVD Manager"
   - Cliquer sur "Create Virtual Device"
   - Choisir un téléphone (par exemple "Pixel 5")
   - Choisir une image système Android (de préférence API 30 ou plus récent)
   - Personnaliser les autres options si nécessaire, puis cliquer sur "Finish"

### Exécution de l'application sur l'émulateur Android

1. **Lancer l'émulateur** :
   - Dans l'AVD Manager, cliquer sur le bouton "Play" à côté de l'émulateur créé
   - Attendre que l'émulateur démarre complètement

2. **Déployer l'application sur l'émulateur** :

   **Option 1 - Via Android Studio** :
   - Une fois l'émulateur ouvert, cliquer sur le bouton "Run" (triangle vert) dans Android Studio
   - Sélectionner l'émulateur en cours d'exécution
   - L'application sera compilée et installée sur l'émulateur

   **Option 2 - Via la ligne de commande** :
   ```bash
   ionic capacitor run android
   ```
   Cette commande construira l'application, la synchronisera avec le projet Android et l'exécutera sur l'émulateur actif.

### Configuration de l'API pour l'émulateur Android

Pour que l'application puisse communiquer avec l'API backend, il faut adapter l'URL de l'API :

1. **Éditer le fichier `src/services/authService.ts`** :
   ```typescript
   // Pour un émulateur Android, remplacer localhost par 10.0.2.2
   const API_URL = 'http://10.0.2.2:8000/api';
   ```

   Note : 10.0.2.2 est l'adresse spéciale qui permet à l'émulateur Android d'accéder à localhost de la machine hôte.

2. **Reconstruire et redéployer l'application** :
   ```bash
   ionic capacitor copy android
   ionic capacitor run android
   ```

## Partie 2: Déploiement sur Émulateur iOS

### Prérequis (macOS uniquement)

- Un Mac avec macOS (obligatoire pour le développement iOS)
- Xcode installé (disponible sur l'App Store)
- Xcode Command Line Tools installés (`xcode-select --install`)
- CocoaPods installé (`sudo gem install cocoapods`)
- Node.js et npm installés
- Ionic CLI installé (`npm install -g @ionic/cli`)

### Préparation de l'environnement iOS

1. **Ouvrir Terminal**

2. **Préparation de l'application Ionic pour iOS** :
   ```bash
   # Se positionner dans le dossier de l'application frontend
   cd vaca-meet-app

   # Ajouter la plateforme iOS au projet Ionic
   ionic capacitor add ios

   # Compiler l'application pour iOS
   ionic capacitor build ios
   ```
   Cette dernière commande construit l'application et ouvre automatiquement le projet dans Xcode.

### Configuration dans Xcode

1. **Dans Xcode** :
   - S'assurer que le projet est correctement configuré (identifiant de bundle, équipe de développement)
   - Cliquer sur le projet dans le navigateur de projet
   - Sous l'onglet "Signing & Capabilities", sélectionner votre équipe de développement
   - Si vous n'avez pas de compte développeur Apple, vous pouvez utiliser votre Apple ID personnel pour le développement local

2. **Configurer un simulateur iOS** :
   - Dans le menu supérieur, cliquer sur le menu déroulant à côté du bouton de lecture
   - Sélectionner "Simulator" puis choisir un appareil iOS (iPhone ou iPad)
   - Si aucun simulateur n'est disponible, cliquer sur "Add Additional Simulators..." et créer un nouveau simulateur

### Exécution de l'application sur le simulateur iOS

1. **Lancer l'application sur le simulateur** :
   - Cliquer sur le bouton de lecture (triangle) en haut à gauche dans Xcode
   - Attendre que l'application soit compilée et installée sur le simulateur

   **Alternative via ligne de commande** :
   ```bash
   ionic capacitor run ios
   ```
   Cette commande construira l'application, la synchronisera avec le projet iOS et ouvrira Xcode.

### Configuration de l'API pour le simulateur iOS

Pour que l'application puisse communiquer avec l'API backend, il faut adapter l'URL de l'API :

1. **Éditer le fichier `src/services/authService.ts`** :
   ```typescript
   // Pour un simulateur iOS, localhost fonctionne directement
   const API_URL = 'http://localhost:8000/api';
   ```

   Note : Contrairement à Android, le simulateur iOS peut accéder directement à localhost de la machine hôte.

2. **Reconstruire et redéployer l'application** :
   ```bash
   ionic capacitor copy ios
   ionic capacitor run ios
   ```

### Résolution des problèmes courants pour iOS

- **Erreurs de certificat** :
  - S'assurer que votre Apple ID est correctement configuré dans Xcode
  - Aller dans Xcode > Preferences > Accounts et vérifier que votre Apple ID est ajouté

- **Problèmes avec CocoaPods** :
  ```bash
  cd ios/App
  pod install
  ```

- **Erreurs de compilation** :
  - Vérifier que Xcode est à jour
  - Nettoyer le projet (Product > Clean Build Folder)
  - Redémarrer Xcode

## Résolution des problèmes courants (général)

- **L'application ne se lance pas** : 
  - Vérifier les erreurs dans la console de l'IDE ou dans le terminal
  - S'assurer que toutes les dépendances sont installées

- **Problèmes de connexion à l'API** : 
  - Vérifier que l'URL de l'API est correctement configurée pour l'émulateur
  - S'assurer que le serveur backend est en cours d'exécution
  - Vérifier que le pare-feu ne bloque pas les connexions

- **L'application se bloque** : 
  - Vérifier les logs dans les outils de débogage
  - Analyser les erreurs JavaScript dans la console

## Mise à jour de l'application

Pour mettre à jour l'application lors du développement :

1. Apporter les modifications au code source
2. Exécuter les commandes suivantes :

   **Pour Android** :
   ```bash
   ionic capacitor copy android
   ionic capacitor run android
   ```

   **Pour iOS** :
   ```bash
   ionic capacitor copy ios
   ionic capacitor run ios
   ```

## Conseils pour le développement

- **Pour Android** : Utiliser Chrome DevTools pour déboguer l'application
  - Ouvrir Chrome et aller à `chrome://inspect`
  - Sélectionner l'application sous "Remote Target"

- **Pour iOS** : Utiliser Safari Developer Tools pour déboguer l'application
  - Activer le menu Développement dans Safari (Préférences > Avancées > Afficher le menu Développement)
  - Lancer l'application sur le simulateur
  - Dans Safari, aller à Développement > Simulator > [Votre App]

- **Live Reload** pour le développement plus rapide :
  ```bash
  # Pour Android
  ionic capacitor run android -l --external
  
  # Pour iOS
  ionic capacitor run ios -l --external
  ```
  Cette option permettra de recharger automatiquement l'application lorsque des modifications sont apportées au code.

## Notes importantes

- Assurez-vous que le backend Symfony est en cours d'exécution avant de lancer l'application
- Le développement iOS nécessite un Mac; il n'est pas possible de développer pour iOS sur Windows ou Linux
- Pour déployer sur des appareils physiques, des configurations supplémentaires sont nécessaires 