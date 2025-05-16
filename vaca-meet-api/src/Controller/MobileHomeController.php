<?php

namespace App\Controller;

use App\Entity\UserMobile;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Psr\Log\LoggerInterface;

class MobileHomeController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Connection $connection,
        private SerializerInterface $serializer,
        private LoggerInterface $logger
    ) {
    }

    #[Route('/api/mobile/destinations', name: 'api_mobile_destinations', methods: ['GET'])]
    public function getDestinations(): JsonResponse
    {
        $this->logger->info('Récupération des destinations');
        
        try {
            // Récupération uniquement des destinations (id, username) depuis la table user
            $sql = "SELECT id, username FROM user ORDER BY username ASC";
            $stmt = $this->connection->prepare($sql);
            $result = $stmt->executeQuery();
            $destinations = $result->fetchAllAssociative();
            
            $this->logger->info('Destinations récupérées avec succès: ' . count($destinations));
            
            return $this->json([
                'destinations' => $destinations,
                'count' => count($destinations),
                'message' => 'Destinations récupérées avec succès'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la récupération des destinations: ' . $e->getMessage());
            
            return $this->json([
                'message' => 'Erreur lors de la récupération des destinations',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/mobile/verify-password', name: 'api_mobile_verify_password', methods: ['POST'])]
    public function verifyVacationPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $this->logger->info('Vérification du mot de passe pour la destination');
        
        if (!$data || !isset($data['destinationId']) || !isset($data['password'])) {
            $this->logger->error('Données invalides: champs obligatoires manquants', ['fields' => array_keys($data ?? [])]);
            return $this->json(['message' => 'Les champs destinationId et password sont obligatoires'], Response::HTTP_BAD_REQUEST);
        }
        
        $destinationId = $data['destinationId'];
        $password = $data['password'];
        
        try {
            // Vérification simple du mot de passe dans la table user
            $sql = "SELECT id FROM user WHERE id = :id AND mdp_vacancier = :password";
            $stmt = $this->connection->prepare($sql);
            $stmt->bindValue('id', $destinationId);
            $stmt->bindValue('password', $password);
            $result = $stmt->executeQuery();
            
            $isValid = $result->rowCount() > 0;
            
            if ($isValid) {
                $this->logger->info('Mot de passe valide pour la destination ' . $destinationId);
                return $this->json([
                    'valid' => true,
                    'message' => 'Mot de passe correct'
                ]);
            } else {
                $this->logger->info('Mot de passe invalide pour la destination ' . $destinationId);
                return $this->json([
                    'valid' => false,
                    'message' => 'Mot de passe incorrect'
                ], Response::HTTP_UNAUTHORIZED);
            }
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la vérification du mot de passe: ' . $e->getMessage());
            
            return $this->json([
                'message' => 'Erreur lors de la vérification du mot de passe',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/mobile/user', name: 'api_mobile_user_profile', methods: ['GET'])]
    public function getUserProfile(): JsonResponse
    {
        $this->logger->info('Récupération du profil utilisateur');
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Obtenir les informations nécessaires
            $userData = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'theme' => $user->getTheme()
            ];
            
            $this->logger->info('Profil utilisateur récupéré avec succès');
            
            return $this->json($userData);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la récupération du profil utilisateur: ' . $e->getMessage());
            
            return $this->json([
                'message' => 'Erreur lors de la récupération du profil utilisateur',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 