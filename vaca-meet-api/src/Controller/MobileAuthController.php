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

    #[Route('/api/mobile/register', name: 'api_mobile_register', methods: ['POST'])]
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

        // Ne pas générer de token JWT pour éviter l'erreur de clé manquante
        // Au lieu de cela, retourner simplement un message de succès et demander à l'utilisateur de se connecter
        return $this->json(
            [
                'message' => 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
                'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read'])
            ],
            Response::HTTP_CREATED
        );
    }

    #[Route('/api/mobile/login_check', name: 'api_mobile_login_check', methods: ['POST'])]
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
        
        // Solution temporaire : créer un pseudo-token sans utiliser JWT
        // Ce n'est pas sécurisé pour la production, mais permet de débloquer le développement
        try {
            // Créer un pseudo-token simple (base64 de username + timestamp)
            $timestamp = time();
            $pseudoToken = base64_encode(json_encode([
                'user' => $user->getUsername(),
                'id' => $user->getId(),
                'exp' => $timestamp + 3600, // Expire dans 1 heure
                'iat' => $timestamp,
            ]));
            
            $this->logger->info('Pseudo-token généré avec succès');
            
            return $this->json([
                'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read']),
                'token' => $pseudoToken,
                'message' => 'Connexion réussie'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la génération du pseudo-token: ' . $e->getMessage());
            return $this->json(['message' => 'Erreur lors de la génération du token. Veuillez contacter l\'administrateur.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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
    #[Route('/api/user', name: 'api_user_profile', methods: ['GET'])]
    public function userProfile(Request $request): JsonResponse
    {
        // Récupérer le token d'Authorization
        $authHeader = $request->headers->get('Authorization');
        $this->logger->info('En-tête d\'autorisation reçu: ' . ($authHeader ? 'présent' : 'absent'));
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            $this->logger->error('Token d\'autorisation manquant ou invalide');
            return $this->json(['message' => 'Token d\'autorisation manquant ou invalide'], Response::HTTP_UNAUTHORIZED);
        }
        
        // Extraire le token
        $token = substr($authHeader, 7); // Enlever "Bearer "
        
        try {
            // Décoder le pseudo-token
            $tokenData = json_decode(base64_decode($token), true);
            $this->logger->info('Données du token décodées: ' . json_encode($tokenData));
            
            if (!$tokenData || !isset($tokenData['user']) || !isset($tokenData['exp'])) {
                $this->logger->error('Format de token invalide');
                return $this->json(['message' => 'Format de token invalide'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Vérifier l'expiration
            if ($tokenData['exp'] < time()) {
                $this->logger->error('Token expiré');
                return $this->json(['message' => 'Token expiré. Veuillez vous reconnecter.'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Récupérer l'utilisateur
            $user = $this->userRepository->findOneBy(['username' => $tokenData['user']]);
            
            if (!$user) {
                $this->logger->error('Utilisateur du token non trouvé: ' . $tokenData['user']);
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
            }
            
            $this->logger->info('Profil utilisateur récupéré avec succès pour: ' . $user->getUsername());
            
            return $this->json([
                'user' => $this->serializer->normalize($user, null, ['groups' => 'user_mobile:read']),
                'message' => 'Profil récupéré avec succès'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du décodage du token: ' . $e->getMessage());
            return $this->json(['message' => 'Erreur lors de la vérification du token'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 