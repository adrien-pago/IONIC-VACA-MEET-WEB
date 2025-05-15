<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted; // Ajoutez cette ligne

class TestController extends AbstractController
{
    #[Route('/api', name: 'api_index', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')] 
    public function index(): JsonResponse
    {
        return $this->json([
            'status' => 'success',
            'message' => 'API Vaca Meet',
            'timestamp' => new \DateTime(),
            'endpoints' => [
                'test' => '/api/test',
                'login' => '/api/login_check',
                'register' => '/api/register',
                'profile' => '/api/user/profile',
                'mobile_test' => '/api/mobile/test'
            ]
        ]);
    }
    
    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    #[IsGranted('PUBLIC_ACCESS')] // Ajoutez cette ligne
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