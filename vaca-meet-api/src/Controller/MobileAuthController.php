<?php

namespace App\Controller;

use App\Entity\UserMobile;
use App\Repository\UserMobileRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class MobileAuthController extends AbstractController
{
    public function __construct(
        private UserMobileRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private JWTTokenManagerInterface $jwtManager
    ) {
    }

    #[Route('/api/mobile/register', name: 'api_mobile_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'username existe déjà
        if ($this->userRepository->findOneBy(['username' => $data['username']])) {
            return $this->json(['message' => 'Ce nom d\'utilisateur est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        $user = new UserMobile();
        $user->setUsername($data['username']);
        
        // Hachage du mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);
        
        // Ajouter les infos supplémentaires si présentes
        if (isset($data['firstName'])) {
            $user->setFirstName($data['firstName']);
        }
        
        if (isset($data['lastName'])) {
            $user->setLastName($data['lastName']);
        }

        // Valider l'utilisateur
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorsString = (string) $errors;
            return $this->json(['message' => $errorsString], Response::HTTP_BAD_REQUEST);
        }

        // Enregistrer l'utilisateur
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Générer le token JWT pour connexion automatique
        $token = $this->jwtManager->create($user);

        return $this->json(
            [
                'message' => 'Utilisateur mobile créé avec succès',
                'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read']),
                'token' => $token
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route('/api/mobile/login_check', name: 'api_mobile_login_check', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['username']) || !isset($data['password'])) {
            return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Rechercher l'utilisateur par username
        $user = $this->userRepository->findOneBy(['username' => $data['username']]);

        if (!$user) {
            return $this->json(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier le mot de passe
        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        // Générer le token JWT
        $token = $this->jwtManager->create($user);

        return $this->json([
            'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read']),
            'token' => $token
        ]);
    }

    #[Route('/api/mobile/test', name: 'api_mobile_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        return $this->json([
            'message' => 'API mobile fonctionne correctement',
            'status' => 'ok',
            'timestamp' => new \DateTime()
        ]);
    }

    #[Route('/api/mobile/user', name: 'api_mobile_user_profile', methods: ['GET'])]
    public function userProfile(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof UserMobile) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read'])
        ]);
    }
} 