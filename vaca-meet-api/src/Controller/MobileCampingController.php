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

class MobileCampingController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Connection $connection,
        private SerializerInterface $serializer,
        private LoggerInterface $logger
    ) {
    }

    #[Route('/api/mobile/camping/info/{id}', name: 'api_mobile_camping_info', methods: ['GET'])]
    public function getCampingInfo(int $id): JsonResponse
    {
        $this->logger->info('Récupération des informations du camping', ['id' => $id]);
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Récupérer les informations du camping à partir de la base de données
            $sql = "SELECT id, username FROM user WHERE id = :id";
            $stmt = $this->connection->prepare($sql);
            $stmt->bindValue('id', $id);
            $result = $stmt->executeQuery();
            $campingData = $result->fetchAssociative();
            
            if (!$campingData) {
                $this->logger->error('Camping non trouvé', ['id' => $id]);
                return $this->json(['message' => 'Camping non trouvé'], Response::HTTP_NOT_FOUND);
            }
            
            // Créer la réponse avec seulement les infos de base du camping
            $response = [
                'camping' => [
                    'id' => $campingData['id'],
                    'name' => 'Camping ' . $campingData['username'],
                    'username' => $campingData['username']
                ],
                'animations' => [],
                'services' => [],
                'activities' => []
            ];
            
            $this->logger->info('Informations du camping récupérées avec succès', [
                'id' => $id,
                'nom' => $campingData['username']
            ]);
            
            return $this->json($response);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la récupération des informations du camping: ' . $e->getMessage());
            
            return $this->json([
                'message' => 'Erreur lors de la récupération des informations du camping',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 