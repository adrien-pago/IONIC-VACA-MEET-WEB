<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Psr\Log\LoggerInterface;

class MobileActivityController extends AbstractController
{
    public function __construct(
        private Connection $connection,
        private LoggerInterface $logger
    ) {}

    #[Route('/api/mobile/camping/{id}/activities', name: 'api_mobile_camping_activities', methods: ['GET'])]
    public function getActivities(int $id, Request $request): JsonResponse
    {
        try {
            // Récupérer les dates de début et de fin de la semaine (optionnel)
            $start = $request->query->get('start'); // format YYYY-MM-DD
            $end = $request->query->get('end');     // format YYYY-MM-DD

            $sql = "SELECT a.id, a.name as title, a.description, a.location, a.max_participants as participants, a.category_id, a.start_date_time, a.end_date_time, c.name as category_name, c.color as category_color, c.icon as category_icon
                    FROM activity a
                    LEFT JOIN activity_category c ON a.category_id = c.id
                    WHERE a.organizer_id = :id";
            $params = ['id' => $id];

            if ($start && $end) {
                $sql .= " AND DATE(a.start_date_time) <= :end AND DATE(a.end_date_time) >= :start";
                $params['start'] = $start;
                $params['end'] = $end;
            }

            $sql .= " ORDER BY a.start_date_time ASC";

            $stmt = $this->connection->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $result = $stmt->executeQuery();

            $daysMap = [
                'Monday' => 'Lundi',
                'Tuesday' => 'Mardi',
                'Wednesday' => 'Mercredi',
                'Thursday' => 'Jeudi',
                'Friday' => 'Vendredi',
                'Saturday' => 'Samedi',
                'Sunday' => 'Dimanche',
            ];

            $activities = [];
            foreach ($result->fetchAllAssociative() as $row) {
                $startDate = new \DateTime($row['start_date_time']);
                $endDate = new \DateTime($row['end_date_time']);
                $dayEn = $startDate->format('l');
                $day = $daysMap[$dayEn] ?? $dayEn;
                $activities[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'day' => $day,
                    'start_time' => $startDate->format('H:i'),
                    'end_time' => $endDate->format('H:i'),
                    'location' => $row['location'],
                    'participants' => $row['participants'],
                    'type' => [
                        'id' => $row['category_id'],
                        'name' => $row['category_name'],
                        'color' => $row['category_color'],
                        'icon' => $row['category_icon'],
                    ],
                ];
            }

            return $this->json(['activities' => $activities]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la récupération des activités: ' . $e->getMessage());
            return $this->json([
                'message' => 'Erreur lors de la récupération des activités',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 