<?php

/**
 * Script de diagnostic pour tester les permissions de base de données
 * Ce script tente d'effectuer une mise à jour en base de données pour
 * vérifier les permissions d'écriture.
 */

echo "=== Script de test de la base de données ===\n";

// Paramètres de connexion à renseigner ici
$dbHost = 'localhost';  // Hôte de la base de données
$dbName = 'vaca_meet'; // Nom de la base de données
$dbUser = 'root';      // Utilisateur de la base
$dbPass = '';          // Mot de passe (laisser vide si non défini)
$dbPort = 3306;        // Port MySQL par défaut

// 1. Test de connexion
try {
    $dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";
    echo "Tentative de connexion à la base: {$dbHost}:{$dbPort} / {$dbName}\n";
    
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ]);
    
    echo "✅ Connexion à la base de données réussie\n";
} catch (\PDOException $e) {
    echo "❌ Échec de connexion à la base de données: " . $e->getMessage() . "\n";
    exit(1);
}

// 2. Vérifier l'existence de la table user_mobile
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'user_mobile'");
    $tableExists = $stmt->fetchColumn();
    
    if ($tableExists) {
        echo "✅ Table 'user_mobile' trouvée\n";
    } else {
        echo "❌ Table 'user_mobile' introuvable\n";
        exit(1);
    }
} catch (\PDOException $e) {
    echo "❌ Erreur lors de la vérification de la table: " . $e->getMessage() . "\n";
    exit(1);
}

// 3. Vérifier les permissions de lecture
try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM user_mobile");
    $count = $stmt->fetchColumn();
    echo "✅ Lecture réussie - {$count} utilisateurs trouvés\n";
    
    // Récupérer un utilisateur pour nos tests
    $stmt = $pdo->query("SELECT id, username, first_name, last_name, theme FROM user_mobile LIMIT 1");
    $user = $stmt->fetch();
    
    if (!$user) {
        echo "⚠️ Aucun utilisateur trouvé pour les tests\n";
        exit(1);
    }
    
    echo "📊 Utilisateur de test: ID={$user['id']}, Username={$user['username']}\n";
} catch (\PDOException $e) {
    echo "❌ Erreur lors de la lecture: " . $e->getMessage() . "\n";
    exit(1);
}

// 4. Tester une requête UPDATE simple non modificatrice
try {
    $userId = $user['id'];
    $username = $user['username'];
    $firstName = $user['first_name'];
    
    $stmt = $pdo->prepare("UPDATE user_mobile SET username = :username WHERE id = :id");
    $stmt->bindValue(':username', $username);
    $stmt->bindValue(':id', $userId);
    $stmt->execute();
    $rowCount = $stmt->rowCount();
    
    if ($rowCount > 0) {
        echo "✅ UPDATE sans modification réussi - {$rowCount} ligne(s) affectée(s)\n";
    } else {
        echo "⚠️ UPDATE sans modification n'a affecté aucune ligne\n";
    }
} catch (\PDOException $e) {
    echo "❌ Erreur lors de l'UPDATE sans modification: " . $e->getMessage() . "\n";
}

// 5. Tester un UPDATE réel avec un timestamp pour forcer une modification
try {
    $timestamp = date('YmdHis');
    $testValue = "{$firstName}_test_{$timestamp}";
    
    $stmt = $pdo->prepare("UPDATE user_mobile SET first_name = :firstName WHERE id = :id");
    $stmt->bindValue(':firstName', $testValue);
    $stmt->bindValue(':id', $userId);
    $stmt->execute();
    $rowCount = $stmt->rowCount();
    
    if ($rowCount > 0) {
        echo "✅ UPDATE avec modification réussi - {$rowCount} ligne(s) affectée(s)\n";
    } else {
        echo "❌ UPDATE avec modification n'a affecté aucune ligne\n";
    }
    
    // Vérifier que la modification a bien été prise en compte
    $stmt = $pdo->prepare("SELECT first_name FROM user_mobile WHERE id = :id");
    $stmt->bindValue(':id', $userId);
    $stmt->execute();
    $updatedValue = $stmt->fetchColumn();
    
    if ($updatedValue === $testValue) {
        echo "✅ Vérification de l'UPDATE réussie: valeur modifiée correctement\n";
    } else {
        echo "❌ Échec de vérification de l'UPDATE: valeur attendue '{$testValue}', obtenue '{$updatedValue}'\n";
    }
    
    // Remettre la valeur d'origine
    $stmt = $pdo->prepare("UPDATE user_mobile SET first_name = :firstName WHERE id = :id");
    $stmt->bindValue(':firstName', $firstName);
    $stmt->bindValue(':id', $userId);
    $stmt->execute();
    echo "✅ Valeur d'origine restaurée\n";
} catch (\PDOException $e) {
    echo "❌ Erreur lors de l'UPDATE avec modification: " . $e->getMessage() . "\n";
}

// 6. Vérifier les permissions avec SHOW GRANTS si possible
try {
    $stmt = $pdo->query("SHOW GRANTS FOR CURRENT_USER()");
    echo "📋 Permissions de l'utilisateur de la base de données:\n";
    while ($grant = $stmt->fetchColumn()) {
        echo "   - {$grant}\n";
    }
} catch (\PDOException $e) {
    echo "⚠️ Impossible de récupérer les permissions: " . $e->getMessage() . "\n";
}

echo "\n=== Résumé des tests ===\n";
echo "Les tests nous ont permis de vérifier si la base de données est accessible en lecture/écriture.\n";
echo "Si un des tests d'écriture a échoué, vérifiez les permissions de l'utilisateur de la base de données.\n";
echo "Si l'utilisateur a les droits mais que les UPDATEs échouent quand même, vérifiez s'il y a des triggers ou des contraintes qui bloquent les mises à jour.\n"; 