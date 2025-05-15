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
use Psr\Log\LoggerInterface;

class MobileAuthController extends AbstractController
{
    public function __construct(
        private UserMobileRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator,
        private JWTTokenManagerInterface $jwtManager,
        private LoggerInterface $logger
    ) {
    }

    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $rawContent = $request->getContent();
        $this->logger->info('Contenu brut reçu: ' . $rawContent);
        
        $data = json_decode($rawContent, true);
        $this->logger->info('Données décodées: ' . ($data ? json_encode($data) : 'null'));

        if (!$data) {
            $this->logger->error('Données JSON invalides: impossible de décoder');
            return $this->json(['message' => 'Données invalides ou format JSON incorrect'], Response::HTTP_BAD_REQUEST);
        }
        
        // Vérifier les champs obligatoires
        if (!isset($data['username']) || !isset($data['password'])) {
            $this->logger->error('Données invalides: champs obligatoires manquants', ['fields' => array_keys($data)]);
            return $this->json(['message' => 'Les champs username et password sont obligatoires'], Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'username existe déjà
        if ($this->userRepository->findOneBy(['username' => $data['username']])) {
            $this->logger->info('Nom d\'utilisateur déjà utilisé: ' . $data['username']);
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
            $this->logger->error('Validation échouée: ' . $errorsString);
            return $this->json(['message' => $errorsString], Response::HTTP_BAD_REQUEST);
        }

        // Enregistrer l'utilisateur
        $this->entityManager->persist($user);
        $this->entityManager->flush();
        $this->logger->info('Utilisateur créé avec succès: ' . $data['username']);

        // Retourner un message de succès sans token JWT
        return $this->json(
            [
                'message' => 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
                'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read'])
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $this->logger->info('Tentative de connexion: ' . json_encode(['username' => $data['username'] ?? 'non défini']));

        if (!$data || !isset($data['username']) || !isset($data['password'])) {
            $this->logger->error('Données de connexion invalides ou incomplètes', ['fields' => array_keys($data ?? [])]);
            return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
        }

        // Rechercher l'utilisateur par username
        $user = $this->userRepository->findOneBy(['username' => $data['username']]);

        if (!$user) {
            $this->logger->info('Utilisateur non trouvé: ' . $data['username']);
            return $this->json(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        // Vérifier le mot de passe
        if (!$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            $this->logger->info('Mot de passe invalide pour l\'utilisateur: ' . $data['username']);
            return $this->json(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        $this->logger->info('Connexion réussie pour l\'utilisateur: ' . $data['username']);
        
        // Génération du token JWT
        try {
            $token = $this->jwtManager->create($user);
            
            return $this->json([
                'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read']),
                'token' => $token,
                'message' => 'Connexion réussie'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la génération du token JWT: ' . $e->getMessage());
            return $this->json(['message' => 'Erreur lors de la génération du token. Veuillez contacter l\'administrateur.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/mobile/user', name: 'api_user_profile', methods: ['GET'])]
    public function userProfile(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user instanceof UserMobile) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read']),
            'message' => 'Profil récupéré avec succès'
        ]);
    }

    #[Route('/api/mobile/destinations', name: 'api_destinations_list', methods: ['GET'])]
    public function getDestinations(): JsonResponse
    {
        try {
            $users = $this->userRepository->findAll();
            
            $destinations = [];
            foreach ($users as $user) {
                $destinations[] = [
                    'id' => $user->getId(),
                    'username' => $user->getUsername()
                ];
            }
            
            return $this->json([
                'destinations' => $destinations,
                'message' => 'Liste des destinations récupérée avec succès'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la récupération des destinations: ' . $e->getMessage());
            return $this->json([
                'message' => 'Erreur lors de la récupération des destinations'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/mobile/verify-password', name: 'api_verify_vacation_password', methods: ['POST'])]
    public function verifyVacationPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['userId']) || !isset($data['vacationPassword'])) {
            return $this->json([
                'message' => 'Données invalides ou incomplètes',
                'success' => false
            ], Response::HTTP_BAD_REQUEST);
        }
        
        $userId = $data['userId'];
        $password = $data['vacationPassword'];
        
        // Dans un cas réel, vous vérifieriez avec une table ou un champ mdp_vacancier
        // Pour cet exemple, nous utilisons une simulation
        $success = $this->simulateVacationPasswordCheck($userId, $password);
        
        if ($success) {
            return $this->json([
                'message' => 'Mot de passe vacancier valide',
                'success' => true
            ]);
        } else {
            return $this->json([
                'message' => 'Mot de passe vacancier invalide',
                'success' => false
            ], Response::HTTP_UNAUTHORIZED);
        }
    }
    
    /**
     * Méthode de simulation pour vérifier le mot de passe vacancier
     * Cette méthode serait remplacée par une vraie vérification en base de données
     */
    private function simulateVacationPasswordCheck(int $userId, string $password): bool
    {
        // Simuler quelques mots de passe valides pour les tests
        $validPasswords = [
            1 => 'camping123',
            2 => 'vacances2023',
            3 => 'ete2023',
            // Ajoutez d'autres combinaisons pour les tests
        ];
        
        return isset($validPasswords[$userId]) && $validPasswords[$userId] === $password;
    }
} 