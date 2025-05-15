<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class TestController extends AbstractController
{
    #[Route('/api', name: 'api_index', methods: ['GET'])]
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
} 