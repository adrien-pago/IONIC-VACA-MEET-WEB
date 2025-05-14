<?php

namespace App\Command;

use App\Entity\UserMobile;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-mobile-user',
    description: 'Crée un nouvel utilisateur mobile.'
)]
class CreateMobileUserCommand extends Command
{
    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $helper = $this->getHelper('question');
        
        $usernameQuestion = new Question('Nom d\'utilisateur : ');
        $passwordQuestion = new Question('Mot de passe : ');
        $passwordQuestion->setHidden(true);
        $passwordQuestion->setHiddenFallback(false);
        
        $firstNameQuestion = new Question('Prénom (optionnel, appuyez sur Entrée pour ignorer) : ');
        $lastNameQuestion = new Question('Nom (optionnel, appuyez sur Entrée pour ignorer) : ');

        $username = $helper->ask($input, $output, $usernameQuestion);
        $password = $helper->ask($input, $output, $passwordQuestion);
        $firstName = $helper->ask($input, $output, $firstNameQuestion);
        $lastName = $helper->ask($input, $output, $lastNameQuestion);

        $user = new UserMobile();
        $user->setUsername($username);
        
        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);
        
        if ($firstName) {
            $user->setFirstName($firstName);
        }
        
        if ($lastName) {
            $user->setLastName($lastName);
        }
        
        $user->setRoles(['ROLE_USER']);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $output->writeln('<info>Utilisateur mobile créé avec succès !</info>');
        
        return Command::SUCCESS;
    }
} 