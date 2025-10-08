<?php
// api/db_connect.php

// --- DATENBANK-KONFIGURATION ---
// Die Zugangsdaten für deine Datenbank bei myhosttech.
$host = 'localhost';                 // Dein Servername, meistens 'localhost'
$dbname = 'kinder_mediathek_db';     // Der Name deiner Datenbank
$user = 'kinder_mediathek';          // Dein Datenbank-Benutzername
$pass = 'lkje485!45-!';              // Dein Datenbank-Passwort
$charset = 'utf8mb4';
// --- ENDE KONFIGURATION ---

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Im Fehlerfall eine generische Nachricht ausgeben, um keine Details preiszugeben
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['message' => 'Datenbankverbindung fehlgeschlagen.']);
    // Für die Entwicklung kannst du die folgende Zeile einkommentieren, um den genauen Fehler zu sehen:
    // throw new \PDOException($e->getMessage(), (int)$e->getCode());
    exit();
}
?>