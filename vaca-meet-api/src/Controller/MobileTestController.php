<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class MobileTestController extends AbstractController
{
    #[Route('/api/mobile/test', name: 'api_mobile_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'OK', 
            'message' => 'API mobile fonctionne correctement', 
            'time' => (new \DateTime())->format('Y-m-d H:i:s')
        ]);
    }
}