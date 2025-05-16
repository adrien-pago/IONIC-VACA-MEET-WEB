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

/**
 * Contrôleur pour gérer le profil utilisateur mobile
 * Permet la mise à jour des informations personnelles (prénom et nom)
 */
class MobileProfileController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger
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
            
            if (!$data) {
                return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }
            
            // Mettre à jour les informations de l'utilisateur
            $hasChanges = false;
            
            // Mise à jour du prénom si fourni et différent
            if (isset($data['firstName']) && $data['firstName'] !== $user->getFirstName()) {
                $user->setFirstName($data['firstName']);
                $hasChanges = true;
                $this->logger->info('Mise à jour du prénom effectuée');
            }
            
            // Mise à jour du nom si fourni et différent
            if (isset($data['lastName']) && $data['lastName'] !== $user->getLastName()) {
                $user->setLastName($data['lastName']);
                $hasChanges = true;
                $this->logger->info('Mise à jour du nom effectuée');
            }
            
            // Si aucun changement n'est nécessaire, retourner une réponse appropriée
            if (!$hasChanges) {
                return $this->json([
                    'success' => true,
                    'message' => 'Aucune modification nécessaire',
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
            $this->entityManager->flush();
            
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
}
