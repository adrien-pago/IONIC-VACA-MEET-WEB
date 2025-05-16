<?php

namespace App\Controller;

use App\Entity\UserMobile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Psr\Log\LoggerInterface;

/**
 * Contrôleur pour gérer le profil utilisateur mobile
 * Permet la mise à jour des informations personnelles (prénom et nom)
 */
class MobileProfileController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger
    ) {
    }

    /**
     * Endpoint pour mettre à jour le profil utilisateur (prénom et nom uniquement)
     * Le username n'est pas modifiable via cet endpoint
     */
    #[Route('/api/mobile/user/update', name: 'api_mobile_user_update', methods: ['POST'])]
    public function updateUserProfile(Request $request): JsonResponse
    {
        $this->logger->info('Mise à jour du profil utilisateur mobile');
        
        try {
            // Récupérer l'utilisateur connecté
            $user = $this->getUser();
            
            if (!$user instanceof UserMobile) {
                $this->logger->error('Utilisateur non authentifié ou invalide');
                return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_UNAUTHORIZED);
            }
            
            // Récupérer les données de la requête
            $data = json_decode($request->getContent(), true);
            
            // Ajouter des logs détaillés pour le debugging
            $this->logger->info('Contenu brut de la requête: ' . $request->getContent());
            
            // IMPORTANT: Si le username est présent dans les données, on l'ignore intentionnellement
            if (isset($data['username'])) {
                $this->logger->info('Le champ username est présent mais sera ignoré: ' . $data['username']);
                // On supprime le username des données pour éviter toute tentative de modification
                unset($data['username']);
            }
            
            $this->logger->info('Données traitées (sans username): ' . json_encode($data));
            $this->logger->info('Valeurs actuelles: firstName="' . $user->getFirstName() . '", lastName="' . $user->getLastName() . '"');
            
            if (!$data) {
                return $this->json(['message' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }
            
            // Mettre à jour les informations de l'utilisateur
            $hasChanges = false;
            
            // Mise à jour du prénom si fourni
            if (isset($data['firstName'])) {
                $oldFirstName = $user->getFirstName();
                $user->setFirstName($data['firstName']);
                $hasChanges = true;
                $this->logger->info('Mise à jour du prénom effectuée: de "' . $oldFirstName . '" à "' . $data['firstName'] . '"');
            } else {
                $this->logger->info('Pas de mise à jour du prénom: valeur non fournie');
            }
            
            // Mise à jour du nom si fourni (forcer la mise à jour même si les valeurs semblent identiques)
            if (isset($data['lastName'])) {
                $oldLastName = $user->getLastName();
                // Forcer la mise à jour du lastName, quelle que soit la valeur actuelle
                $user->setLastName($data['lastName']);
                $hasChanges = true;
                $this->logger->info('Mise à jour du nom effectuée (forcée): de "' . $oldLastName . '" à "' . $data['lastName'] . '"');
                
                // Comparaison pour débogage
                $this->logger->info('Debug lastName: valeur fournie="' . $data['lastName'] . '", valeur actuelle avant update="' . $oldLastName . '"');
                $this->logger->info('Type de lastName fourni: ' . gettype($data['lastName']) . ', type actuel: ' . gettype($oldLastName));
                $this->logger->info('Les valeurs sont-elles égales? ' . ($data['lastName'] === $oldLastName ? 'Oui' : 'Non'));
                $this->logger->info('Les valeurs sont-elles égales (==)? ' . ($data['lastName'] == $oldLastName ? 'Oui' : 'Non'));
            } else {
                $this->logger->info('Pas de mise à jour du nom: valeur non fournie dans la requête');
            }
            
            // Si aucun changement n'est nécessaire, retourner une réponse appropriée
            if (!$hasChanges) {
                return $this->json([
                    'success' => true,
                    'message' => 'Aucune modification effectuée',
                    'user' => [
                        'id' => $user->getId(),
                        'username' => $user->getUsername(),
                        'firstName' => $user->getFirstName(),
                        'lastName' => $user->getLastName()
                    ]
                ]);
            }
            
            // Persister les modifications en base de données
            $this->entityManager->persist($user);
            $this->logger->info('Utilisateur persisté, préparation du flush');
            $this->entityManager->flush();
            $this->logger->info('Flush effectué');
            
            // Vérification après flush
            $this->entityManager->refresh($user);
            $this->logger->info('Valeurs après mise à jour et refresh: firstName="' . $user->getFirstName() . '", lastName="' . $user->getLastName() . '"');
            
            $this->logger->info('Profil utilisateur mis à jour avec succès');
            
            // Retourner les informations mises à jour
            return $this->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName()
                ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la mise à jour du profil: ' . $e->getMessage());
            
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
