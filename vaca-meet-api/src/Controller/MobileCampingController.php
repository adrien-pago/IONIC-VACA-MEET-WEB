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
            $sql = "SELECT id, username, nom_camping FROM user WHERE id = :id";
            $stmt = $this->connection->prepare($sql);
            $stmt->bindValue('id', $id);
            $result = $stmt->executeQuery();
            $campingData = $result->fetchAssociative();
            
            if (!$campingData) {
                $this->logger->error('Camping non trouvé', ['id' => $id]);
                return $this->json(['message' => 'Camping non trouvé'], Response::HTTP_NOT_FOUND);
            }
            
            // Données de test pour les animations
            $animations = [
                [
                    'id' => 1,
                    'title' => 'Soirée Dansante',
                    'description' => 'Venez profiter d\'une soirée dansante sur la plage',
                    'day' => 'Vendredi',
                    'time' => '20h00'
                ],
                [
                    'id' => 2,
                    'title' => 'Tournoi de Pétanque',
                    'description' => 'Participez à notre tournoi hebdomadaire de pétanque',
                    'day' => 'Samedi',
                    'time' => '15h00'
                ],
                [
                    'id' => 3,
                    'title' => 'Aquagym',
                    'description' => 'Séance d\'aquagym dans la piscine du camping',
                    'day' => 'Mardi',
                    'time' => '10h00'
                ]
            ];
            
            // Données de test pour les services
            $services = [
                [
                    'id' => 1,
                    'name' => 'Piscine',
                    'description' => 'Grande piscine chauffée avec toboggan',
                    'hours' => '9h00 - 19h00'
                ],
                [
                    'id' => 2,
                    'name' => 'Restaurant',
                    'description' => 'Restaurant avec spécialités locales',
                    'hours' => '12h00 - 22h00'
                ],
                [
                    'id' => 3,
                    'name' => 'Mini-market',
                    'description' => 'Épicerie avec produits de première nécessité',
                    'hours' => '8h00 - 20h00'
                ]
            ];
            
            // Données de test pour les activités
            $activities = [
                [
                    'id' => 1,
                    'title' => 'Randonnée en groupe',
                    'description' => 'Organisée par la famille Martin',
                    'day' => 'Dimanche',
                    'time' => '9h00',
                    'location' => 'Départ accueil',
                    'participants' => 8
                ],
                [
                    'id' => 2,
                    'title' => 'Barbecue partagé',
                    'description' => 'Apportez vos grillades et boissons',
                    'day' => 'Samedi',
                    'time' => '19h00',
                    'location' => 'Espace pique-nique',
                    'participants' => 15
                ]
            ];
            
            // Créer la réponse avec les données de test
            $response = [
                'camping' => [
                    'id' => $campingData['id'],
                    'name' => $campingData['nom_camping'] ?? 'Camping ' . $campingData['username'],
                    'username' => $campingData['username']
                ],
                'animations' => $animations,
                'services' => $services,
                'activities' => $activities
            ];
            
            $this->logger->info('Informations du camping récupérées avec succès', [
                'id' => $id,
                'nom' => $campingData['nom_camping'] ?? 'Camping ' . $campingData['username']
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