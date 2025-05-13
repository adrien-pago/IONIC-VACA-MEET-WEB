<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;

class UserController extends AbstractController
{
    public function __construct(
        private SerializerInterface $serializer
    ) {
    }

    #[Route('/api/user/profile', name: 'api_user_profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['message' => 'Non autorisé'], 401);
        }
        
        return $this->json([
            'user' => $this->serializer->normalize($user, null, ['groups' => 'user:read'])
        ]);
    }
} 