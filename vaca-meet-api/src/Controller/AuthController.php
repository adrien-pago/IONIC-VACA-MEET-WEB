<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
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
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class AuthController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private JWTTokenManagerInterface $jwtManager,
        private TokenStorageInterface $tokenStorage
    ) {
    }

    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        return $this->json([
            'message' => 'API fonctionne correctement',
            'status' => 'ok',
            'timestamp' => new \DateTime()
        ]);
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'email existe déjà
        if ($this->userRepository->findOneBy(['email' => $data['email']])) {
            return $this->json(['message' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($data['email']);
        
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

        return $this->json(
            [
                'message' => 'Utilisateur créé avec succès',
                'user' => $this->serializer->normalize($user, null, ['groups' => 'user:read'])
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email']) || !isset($data['password'])) {
            return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Rechercher l'utilisateur par email
        $user = $this->userRepository->findOneBy(['email' => $data['email']]);

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
            'user' => $this->serializer->normalize($user, null, ['groups' => 'user:read']),
            'token' => $token
        ]);
    }
} 