<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class TestController extends AbstractController
{
    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        return $this->json([
            'status' => 'success',
            'message' => 'API fonctionne correctement!',
            'timestamp' => new \DateTime(),
            'environment' => $_ENV['APP_ENV'] ?? 'unknown',
            'app' => 'Vaca Meet Mobile API'
        ]);
    }
} 