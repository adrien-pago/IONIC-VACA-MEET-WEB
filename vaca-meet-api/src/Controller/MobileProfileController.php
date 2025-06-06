<?php

namespace App\Controller;

use App\Entity\UserMobile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Psr\Log\LoggerInterface;

/**
 * Contrôleur pour gérer le profil utilisateur mobile
 * Permet la mise à jour des informations personnelles (prénom et nom)
 */
class MobileProfileController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger,
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    /**
     * Endpoint pour mettre à jour le profil utilisateur (prénom et nom uniquement)
     * Le username n'est pas modifiable via cet endpoint
     */
    #[Route('/api/mobile/user/update', name: 'api_mobile_user_update', methods: ['POST'])]
    public function updateUserProfile(Request $request): JsonResponse
    {
        $this->logger->info('Mise à jour du profil utilisateur mobile');
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Récupérer les données de la requête
            $data = json_decode($request->getContent(), true);
            
            // Ajouter des logs détaillés pour le debugging
            $this->logger->info('Contenu brut de la requête: ' . $request->getContent());
            
            // IMPORTANT: Si le username est présent dans les données, on l'ignore intentionnellement
            if (isset($data['username'])) {
                $this->logger->info('Le champ username est présent mais sera ignoré: ' . $data['username']);
                // On supprime le username des données pour éviter toute tentative de modification
                unset($data['username']);
            }
            
            $this->logger->info('Données traitées (sans username): ' . json_encode($data));
            $this->logger->info('Valeurs actuelles: firstName="' . $user->getFirstName() . '", lastName="' . $user->getLastName() . '"');
            
            if (!$data) {
                return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }
            
            // Mettre à jour les informations de l'utilisateur
            $hasChanges = false;
            
            // Mise à jour du prénom si fourni
            if (isset($data['firstName'])) {
                $oldFirstName = $user->getFirstName();
                $user->setFirstName($data['firstName']);
                $hasChanges = true;
                $this->logger->info('Mise à jour du prénom effectuée: de "' . $oldFirstName . '" à "' . $data['firstName'] . '"');
            } else {
                $this->logger->info('Pas de mise à jour du prénom: valeur non fournie');
            }
            
            // Mise à jour du nom si fourni (forcer la mise à jour même si les valeurs semblent identiques)
            if (isset($data['lastName'])) {
                $oldLastName = $user->getLastName();
                // Forcer la mise à jour du lastName, quelle que soit la valeur actuelle
                $user->setLastName($data['lastName']);
                $hasChanges = true;
                $this->logger->info('Mise à jour du nom effectuée (forcée): de "' . $oldLastName . '" à "' . $data['lastName'] . '"');
                
                // Comparaison pour débogage
                $this->logger->info('Debug lastName: valeur fournie="' . $data['lastName'] . '", valeur actuelle avant update="' . $oldLastName . '"');
                $this->logger->info('Type de lastName fourni: ' . gettype($data['lastName']) . ', type actuel: ' . gettype($oldLastName));
                $this->logger->info('Les valeurs sont-elles égales? ' . ($data['lastName'] === $oldLastName ? 'Oui' : 'Non'));
                $this->logger->info('Les valeurs sont-elles égales (==)? ' . ($data['lastName'] == $oldLastName ? 'Oui' : 'Non'));
            } else {
                $this->logger->info('Pas de mise à jour du nom: valeur non fournie dans la requête');
            }
            
            // Si aucun changement n'est nécessaire, retourner une réponse appropriée
            if (!$hasChanges) {
                return $this->json([
                    'success' => true,
                    'message' => 'Aucune modification effectuée',
                    'user' => [
                        'id' => $user->getId(),
                        'username' => $user->getUsername(),
                        'firstName' => $user->getFirstName(),
                        'lastName' => $user->getLastName()
                    ]
                ]);
            }
            
            // Persister les modifications en base de données
            $this->entityManager->persist($user);
            $this->logger->info('Utilisateur persisté, préparation du flush');
            $this->entityManager->flush();
            $this->logger->info('Flush effectué');
            
            // Vérification après flush
            $this->entityManager->refresh($user);
            $this->logger->info('Valeurs après mise à jour et refresh: firstName="' . $user->getFirstName() . '", lastName="' . $user->getLastName() . '"');
            
            $this->logger->info('Profil utilisateur mis à jour avec succès');
            
            // Retourner les informations mises à jour
            return $this->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName()
                ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la mise à jour du profil: ' . $e->getMessage());
            
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint pour mettre à jour uniquement le thème de l'utilisateur
     */
    #[Route('/api/mobile/user/update-theme', name: 'api_mobile_user_update_theme', methods: ['POST'])]
    public function updateUserTheme(Request $request): JsonResponse
    {
        $this->logger->info('Mise à jour du thème utilisateur');
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Récupérer les données de la requête
            $data = json_decode($request->getContent(), true);
            $this->logger->info('Contenu brut de la requête pour thème: ' . $request->getContent());
            
            if (!$data || !isset($data['theme'])) {
                $this->logger->error('Données invalides ou thème manquant');
                return $this->json(['message' => 'Thème non spécifié'], Response::HTTP_BAD_REQUEST);
            }
            
            $theme = $data['theme'];
            
            // Valider le thème (valeurs autorisées: default, blue, green, minimal)
            $validThemes = ['default', 'blue', 'green', 'minimal'];
            if (!in_array($theme, $validThemes)) {
                $this->logger->error('Thème invalide: ' . $theme);
                return $this->json([
                    'success' => false,
                    'message' => 'Thème invalide. Valeurs autorisées: default, blue, green, minimal'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Mettre à jour le thème de l'utilisateur
            $oldTheme = $user->getTheme();
            $user->setTheme($theme);
            
            // Persister les modifications en base de données
            $this->entityManager->persist($user);
            $this->logger->info('Mise à jour du thème: ' . $oldTheme . ' => ' . $theme);
            $this->entityManager->flush();
            
            // Rafraîchir l'entité pour obtenir les données à jour
            $this->entityManager->refresh($user);
            
            $this->logger->info('Thème utilisateur mis à jour avec succès');
            
            // Retourner les informations mises à jour
            return $this->json([
                'success' => true,
                'message' => 'Thème mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'theme' => $user->getTheme()
                ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la mise à jour du thème: ' . $e->getMessage());
            
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du thème',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint pour mettre à jour le mot de passe utilisateur
     */
    #[Route('/api/mobile/user/password', name: 'api_mobile_user_password', methods: ['PUT', 'POST'])]
    public function updateUserPassword(Request $request): JsonResponse
    {
        $this->logger->info('Tentative de mise à jour du mot de passe');
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Récupérer les données de la requête
            $content = $request->getContent();
            $this->logger->info('Contenu brut de la requête de mot de passe: ' . $content);
            
            $data = json_decode($content, true);
            
            // Vérifier que les données nécessaires sont présentes
            if (!$data || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
                $this->logger->error('Données manquantes pour la mise à jour du mot de passe');
                return $this->json([
                    'success' => false,
                    'message' => 'Les mots de passe actuel et nouveau sont requis'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            $currentPassword = $data['currentPassword'];
            $newPassword = $data['newPassword'];
            
            // Vérifier que le mot de passe actuel est correct
            if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
                $this->logger->error('Le mot de passe actuel est incorrect');
                return $this->json([
                    'success' => false,
                    'message' => 'Le mot de passe actuel est incorrect'
                ], Response::HTTP_UNAUTHORIZED);
            }
            
            // Hacher et définir le nouveau mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
            $user->setPassword($hashedPassword);
            
            // Persister les modifications
            $this->entityManager->persist($user);
            $this->entityManager->flush();
            
            $this->logger->info('Mot de passe mis à jour avec succès');
            
            return $this->json([
                'success' => true,
                'message' => 'Mot de passe mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la mise à jour du mot de passe: ' . $e->getMessage());
            
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du mot de passe',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Endpoint pour uploader la photo de profil de l'utilisateur mobile
     */
    #[Route('/api/mobile/user/upload-profile-picture', name: 'api_mobile_user_upload_profile_picture', methods: ['POST'])]
    public function uploadProfilePicture(Request $request): JsonResponse
    {
        $this->logger->info('Upload de la photo de profil utilisateur mobile');
        try {
            $user = $this->getUser();
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }

            $file = $request->files->get('file');
            if (!$file) {
                return $this->json(['message' => 'Aucun fichier reçu'], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier le type MIME
            $allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
            if (!in_array($file->getMimeType(), $allowedMime)) {
                return $this->json(['message' => 'Format de fichier non supporté'], Response::HTTP_BAD_REQUEST);
            }

            // Générer un nom de fichier unique
            $ext = $file->guessExtension();
            $filename = sprintf('user_%d_%d.%s', $user->getId(), time(), $ext);
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/profiles/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $file->move($uploadDir, $filename);
            $relativePath = '/uploads/profiles/' . $filename;

            // Mettre à jour l'utilisateur
            $user->setProfilePicture($relativePath);
            $this->entityManager->persist($user);
            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Photo de profil mise à jour',
                'profilePicture' => $relativePath,
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur upload photo de profil: ' . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload de la photo',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
