<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class TestController extends AbstractController
{
    #[Route('/api', name: 'api_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        // Version simplifiée pour tester
        return new JsonResponse([
            'status' => 'success',
            'message' => 'API Vaca Meet fonctionne'
        ]);
    }
    
    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        // Version simplifiée pour tester
        return new JsonResponse([
            'status' => 'success',
            'message' => 'Test API fonctionne'
        ]);
    }
}