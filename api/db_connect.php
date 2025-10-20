<?php
// api/db_connect.php
// Database credentials are read from environment variables or an optional .env file next to this script.

$envFile = __DIR__ . '/.env';
if (is_readable($envFile)) {
    $loaded = parse_ini_file($envFile, false, INI_SCANNER_TYPED);
    if (is_array($loaded)) {
        foreach ($loaded as $key => $value) {
            if (getenv($key) === false) {
                putenv($key . '=' . $value);
                $_ENV[$key] = $value;
            }
        }
    }
}

$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: '';
$user = getenv('DB_USER') ?: '';
$pass = getenv('DB_PASSWORD');
$charset = getenv('DB_CHARSET') ?: 'utf8mb4';

if ($dbname === '' || $user === '' || $pass === false || $pass === '') {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['message' => 'Datenbankkonfiguration fehlt.']);
    exit();
}

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['message' => 'Datenbankverbindung fehlgeschlagen.']);
    exit();
}
