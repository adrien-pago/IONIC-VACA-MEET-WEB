<?php
// fichier public/cors-handler.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Si c'est une requête OPTIONS preflight, renvoyer un OK
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Pour les autres méthodes, laissez l'application Symfony s'en charger
require_once __DIR__ . '/index.php';