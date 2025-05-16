<?php

namespace App\Controller;

use App\Entity\UserMobile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Psr\Log\LoggerInterface;

class MobileProfileController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger
    ) {
    }

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
            
            $this->logger->info('Données brutes reçues:', [
                'content' => $request->getContent(),
                'parsed' => $data
            ]);
            
            $this->logger->info('Données reçues pour mise à jour:', [
                'userId' => $user->getId(),
                'data' => $data
            ]);
            
            $this->logger->info('Valeurs actuelles en base:', [
                'userId' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'username' => $user->getUsername()
            ]);
            
            if (!$data) {
                $this->logger->error('Données invalides ou manquantes');
                return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }
            
            // Mettre à jour les informations de l'utilisateur
            // Enregistrer les valeurs actuelles pour le log
            $oldValues = [
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'username' => $user->getUsername()
            ];
            
            $hasChanges = false;
            $forceUpdate = true; // Force la mise à jour même si les valeurs sont identiques (pour test)
            
            if (isset($data['firstName']) && ($data['firstName'] !== $user->getFirstName() || $forceUpdate)) {
                $user->setFirstName($data['firstName']);
                $hasChanges = true;
                $this->logger->info('Mise à jour prénom:', [
                    'ancien' => $oldValues['firstName'],
                    'nouveau' => $data['firstName']
                ]);
            }
            
            if (isset($data['lastName']) && ($data['lastName'] !== $user->getLastName() || $forceUpdate)) {
                $user->setLastName($data['lastName']);
                $hasChanges = true;
                $this->logger->info('Mise à jour nom:', [
                    'ancien' => $oldValues['lastName'],
                    'nouveau' => $data['lastName']
                ]);
            }
            
            // Utiliser username au lieu de email (username correspond à l'email en base)
            if (isset($data['username']) && ($data['username'] !== $user->getUsername() || $forceUpdate)) {
                $user->setUsername($data['username']); // Utiliser setUsername car l'entité n'a pas de méthode setEmail
                $hasChanges = true;
                $this->logger->info('Mise à jour username:', [
                    'ancien' => $oldValues['username'],
                    'nouveau' => $data['username']
                ]);
            }
            
            if (!$hasChanges) {
                $this->logger->info('Aucune modification détectée, les valeurs sont identiques');
            } else {
                // Persister les modifications et forcer le flush
                $this->entityManager->persist($user);
                $this->entityManager->flush();
                $this->logger->info('Flush exécuté avec succès');
                
                // Vérifier que les données ont bien été mises à jour
                // Refresh l'entité pour s'assurer d'avoir les dernières valeurs
                $this->entityManager->refresh($user);
                $this->logger->info('Valeurs après mise à jour en base:', [
                    'userId' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'username' => $user->getUsername()
                ]);
            }
            
            $this->logger->info('Profil utilisateur mis à jour avec succès pour l\'utilisateur ' . $user->getId());
            
            // Retourner les informations mises à jour
            return $this->json([
                'success' => true,
                'message' => $hasChanges ? 'Profil mis à jour avec succès' : 'Aucune modification nécessaire',
                'changes' => $hasChanges,
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(), // Username correspond à l'email
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName()
                ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la mise à jour du profil: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
