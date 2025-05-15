<?php

namespace App\Controller;

use App\Entity\UserMobile;
use App\Repository\UserMobileRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Psr\Log\LoggerInterface;

class MobileProfileController extends AbstractController
{
    public function __construct(
        private UserMobileRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private LoggerInterface $logger
    ) {
    }

    #[Route('/api/mobile/user/profile', name: 'api_mobile_user_full_profile', methods: ['GET'])]
    public function getUserFullProfile(): JsonResponse
    {
        $this->logger->info('Récupération du profil complet utilisateur');
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Obtenir les informations complètes
            $userData = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'theme' => $user->getTheme()
            ];
            
            $this->logger->info('Profil complet utilisateur récupéré avec succès');
            
            return $this->json($userData);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la récupération du profil utilisateur: ' . $e->getMessage());
            
            return $this->json([
                'message' => 'Erreur lors de la récupération du profil utilisateur',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/mobile/user/profile', name: 'api_mobile_update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $this->logger->info('Début de la mise à jour du profil utilisateur');
        $this->logger->info('Contenu de la requête: ' . $request->getContent());
        $this->logger->info('En-têtes de la requête: ' . json_encode($request->headers->all()));
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            $this->logger->info('Utilisateur récupéré: ID=' . ($user ? $user->getId() : 'null'));
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Décoder les données JSON
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                $this->logger->error('Données JSON invalides');
                return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }
            
            $this->logger->info('Données décodées: ' . json_encode($data));
            
            // Sauvegarder les valeurs actuelles pour la journalisation
            $oldValues = [
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'username' => $user->getUsername(),
                'theme' => $user->getTheme()
            ];
            
            // Utiliser SQL direct via DBAL
            $connection = $this->entityManager->getConnection();
            
            // Construire la requête SQL
            $queryBuilder = $connection->createQueryBuilder();
            $queryBuilder->update('user_mobile')
                ->where('id = :userId')
                ->setParameter('userId', $user->getId());
            
            $hasChanges = false;
            
            // Ajouter les champs à mettre à jour
            if (isset($data['firstName'])) {
                if ($data['firstName'] !== $oldValues['firstName']) {
                    $hasChanges = true;
                }
                $queryBuilder->set('first_name', ':firstName')
                    ->setParameter('firstName', $data['firstName']);
                $this->logger->info('Mise à jour du prénom: ' . $oldValues['firstName'] . ' -> ' . $data['firstName']);
            }
            
            if (isset($data['lastName'])) {
                if ($data['lastName'] !== $oldValues['lastName']) {
                    $hasChanges = true;
                }
                $queryBuilder->set('last_name', ':lastName')
                    ->setParameter('lastName', $data['lastName']);
                $this->logger->info('Mise à jour du nom: ' . $oldValues['lastName'] . ' -> ' . $data['lastName']);
            }
            
            if (isset($data['username'])) {
                // Vérifier si le nom d'utilisateur est déjà utilisé par un autre utilisateur
                $existingUser = $this->userRepository->findOneBy(['username' => $data['username']]);
                if ($existingUser && $existingUser->getId() !== $user->getId()) {
                    $this->logger->error('Nom d\'utilisateur déjà utilisé: ' . $data['username']);
                    return $this->json(['message' => 'Ce nom d\'utilisateur est déjà utilisé'], Response::HTTP_CONFLICT);
                }
                
                if ($data['username'] !== $oldValues['username']) {
                    $hasChanges = true;
                }
                $queryBuilder->set('username', ':username')
                    ->setParameter('username', $data['username']);
                $this->logger->info('Mise à jour du nom d\'utilisateur: ' . $oldValues['username'] . ' -> ' . $data['username']);
            }
            
            if (isset($data['theme'])) {
                if ($data['theme'] !== $oldValues['theme']) {
                    $hasChanges = true;
                }
                $queryBuilder->set('theme', ':theme')
                    ->setParameter('theme', $data['theme']);
                $this->logger->info('Mise à jour du thème: ' . $oldValues['theme'] . ' -> ' . $data['theme']);
                
                // S'assurer que le thème est enregistré même s'il est identique
                if ($oldValues['theme'] === $data['theme']) {
                    $this->logger->info('Thème inchangé, mais forçage de la mise à jour');
                }
            }
            
            // Forcer la mise à jour même si les valeurs sont identiques
            if (!$hasChanges) {
                // On ajoute un champ qui se met à jour lui-même pour forcer l'UPDATE
                $queryBuilder->set('username', ':forcedUsername')
                    ->setParameter('forcedUsername', $oldValues['username']);
                $this->logger->warning('Aucun changement détecté, mais forçage de la mise à jour par requête SQL directe');
            }
            
            // Exécuter la requête
            $sql = $queryBuilder->getSQL();
            $params = $queryBuilder->getParameters();
            $this->logger->info('Requête SQL: ' . $sql);
            $this->logger->info('Paramètres: ' . json_encode($params));
            
            $rowCount = $queryBuilder->executeStatement();
            $this->logger->info('Nombre de lignes mises à jour: ' . $rowCount);
            
            if ($rowCount === 0) {
                $this->logger->warning('La requête SQL n\'a mis à jour aucune ligne!');
            }
            
            // Actualiser l'objet utilisateur avec les nouvelles valeurs
            if (isset($data['firstName'])) {
                $user->setFirstName($data['firstName']);
            }
            
            if (isset($data['lastName'])) {
                $user->setLastName($data['lastName']);
            }
            
            if (isset($data['username'])) {
                $user->setUsername($data['username']);
            }
            
            if (isset($data['theme'])) {
                $user->setTheme($data['theme']);
            }
            
            // Récupérer l'utilisateur mis à jour pour vérification
            $sql = "SELECT id, username, first_name, last_name, theme FROM user_mobile WHERE id = :id";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue('id', $user->getId());
            $result = $stmt->executeQuery();
            $userData = $result->fetchAssociative();
            
            $this->logger->info('Données récupérées directement depuis la base après mise à jour: ' . json_encode($userData));
            
            // Préparer les données de réponse
            $updatedData = [
                'id' => $user->getId(),
                'username' => $userData['username'] ?? $user->getUsername(),
                'firstName' => $userData['first_name'] ?? $user->getFirstName(),
                'lastName' => $userData['last_name'] ?? $user->getLastName(),
                'theme' => $userData['theme'] ?? $user->getTheme()
            ];
            
            $this->logger->info('Profil utilisateur mis à jour avec succès en base de données');
            $this->logger->info('Données renvoyées au client: ' . json_encode($updatedData));
            
            return $this->json($updatedData);
        } catch (\Exception $e) {
            $this->logger->error('Exception lors de la mise à jour du profil: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
            
            return $this->json([
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/mobile/user/profile/direct', name: 'api_mobile_update_profile_direct', methods: ['PUT'])]
    public function updateProfileDirect(Request $request): JsonResponse
    {
        $this->logger->info('Mise à jour directe du profil utilisateur (SQL)');
        $this->logger->info('Contenu de la requête: ' . $request->getContent());
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            $this->logger->info('Utilisateur récupéré: ID=' . ($user ? $user->getId() : 'null'));
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Décoder les données JSON
            $data = json_decode($request->getContent(), true);
            
            if (!$data) {
                $this->logger->error('Données JSON invalides');
                return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }
            
            $this->logger->info('Données décodées: ' . json_encode($data));
            
            // Utiliser SQL direct via DBAL
            $connection = $this->entityManager->getConnection();
            
            // Construire la requête SQL
            $queryBuilder = $connection->createQueryBuilder();
            $queryBuilder->update('user_mobile')
                ->where('id = :userId')
                ->setParameter('userId', $user->getId());
            
            // Ajouter les champs à mettre à jour
            if (isset($data['firstName'])) {
                $queryBuilder->set('first_name', ':firstName')
                    ->setParameter('firstName', $data['firstName']);
                $this->logger->info('Ajout à la requête: first_name = ' . $data['firstName']);
            }
            
            if (isset($data['lastName'])) {
                $queryBuilder->set('last_name', ':lastName')
                    ->setParameter('lastName', $data['lastName']);
                $this->logger->info('Ajout à la requête: last_name = ' . $data['lastName']);
            }
            
            if (isset($data['username'])) {
                // Vérifier si le nom d'utilisateur est déjà utilisé par un autre utilisateur
                $existingUser = $this->userRepository->findOneBy(['username' => $data['username']]);
                if ($existingUser && $existingUser->getId() !== $user->getId()) {
                    $this->logger->error('Nom d\'utilisateur déjà utilisé: ' . $data['username']);
                    return $this->json(['message' => 'Ce nom d\'utilisateur est déjà utilisé'], Response::HTTP_CONFLICT);
                }
                
                $queryBuilder->set('username', ':username')
                    ->setParameter('username', $data['username']);
                $this->logger->info('Ajout à la requête: username = ' . $data['username']);
            }
            
            if (isset($data['theme'])) {
                $queryBuilder->set('theme', ':theme')
                    ->setParameter('theme', $data['theme']);
                $this->logger->info('Ajout à la requête: theme = ' . $data['theme']);
            }
            
            // Exécuter la requête
            $sql = $queryBuilder->getSQL();
            $params = $queryBuilder->getParameters();
            $this->logger->info('Requête SQL: ' . $sql);
            $this->logger->info('Paramètres: ' . json_encode($params));
            
            $rowCount = $queryBuilder->executeStatement();
            $this->logger->info('Nombre de lignes mises à jour: ' . $rowCount);
            
            if ($rowCount === 0) {
                $this->logger->warning('La requête SQL n\'a mis à jour aucune ligne!');
            }
            
            // Récupérer l'utilisateur mis à jour
            $updatedUser = $this->userRepository->find($user->getId());
            $updatedData = [
                'id' => $updatedUser->getId(),
                'username' => $updatedUser->getUsername(),
                'firstName' => $updatedUser->getFirstName(),
                'lastName' => $updatedUser->getLastName(),
                'theme' => $updatedUser->getTheme()
            ];
            
            $this->logger->info('Données renvoyées au client après mise à jour directe: ' . json_encode($updatedData));
            
            return $this->json($updatedData);
        } catch (\Exception $e) {
            $this->logger->error('Exception lors de la mise à jour directe du profil: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
            
            return $this->json([
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/mobile/user/password', name: 'api_mobile_update_password', methods: ['PUT'])]
    public function updatePassword(Request $request): JsonResponse
    {
        $this->logger->info('Mise à jour du mot de passe utilisateur');
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Décoder les données JSON
            $data = json_decode($request->getContent(), true);
            
            if (!$data || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
                $this->logger->error('Données JSON invalides ou incomplètes');
                return $this->json(['message' => 'Les champs currentPassword et newPassword sont obligatoires'], Response::HTTP_BAD_REQUEST);
            }
            
            // Vérifier le mot de passe actuel
            if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
                $this->logger->error('Mot de passe actuel incorrect');
                return $this->json(['message' => 'Mot de passe actuel incorrect'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Hacher et définir le nouveau mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
            $user->setPassword($hashedPassword);
            
            // Enregistrer les modifications
            $this->entityManager->flush();
            $this->logger->info('Mot de passe utilisateur mis à jour avec succès');
            
            return $this->json([
                'success' => true,
                'message' => 'Mot de passe mis à jour avec succès'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la mise à jour du mot de passe: ' . $e->getMessage());
            
            return $this->json([
                'message' => 'Erreur lors de la mise à jour du mot de passe',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 