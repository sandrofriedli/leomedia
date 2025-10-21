<?php
// api/videos_api.php

session_start();
include 'db_connect.php'; // Stellt die PDO-Verbindung ($pdo) her

function columnExists(PDO $pdo, $table, $column)
{
    try {
        $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE :column");
        $stmt->execute([':column' => $column]);
        return (bool) $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (\PDOException $e) {
        error_log("Spaltenpruefung fehlgeschlagen: " . $e->getMessage());
        return false;
    }
}

function normalizeAdditionalPlatformsInput($value)
{
    if (!isset($value)) {
        return '[]';
    }

    if (is_array($value)) {
        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    if (!is_string($value)) {
        return '[]';
    }

    $trimmed = trim($value);
    if ($trimmed === '') {
        return '[]';
    }

    $decoded = json_decode($trimmed, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        return json_encode($decoded, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    $lines = preg_split('/\r\n|\n|;/', $trimmed);
    $entries = [];

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }
        $parts = array_map('trim', explode('|', $line));
        $entries[] = [
            'name' => $parts[0] ?? '',
            'url' => $parts[1] ?? '',
            'logo' => $parts[2] ?? '',
            'hint' => $parts[3] ?? ''
        ];
    }

    return json_encode($entries, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$hasAdditionalPlatforms = columnExists($pdo, 'videos', 'additionalPlatforms');

// GET-Anfrage zum Abrufen aller Videos (erfordert keinen Login)
if ($method === 'GET') {
    error_log("API-Anfrage: GET-Methode");
    $fields = "id, title, posterUrl, previewUrl, trailerUrl, age, summary, tags, platform, platformUrl, platformLogo, watchHint, firstAired, imdbRating";
    if ($hasAdditionalPlatforms) {
        $fields .= ", additionalPlatforms";
    }
    $sql = "SELECT $fields FROM videos ORDER BY title ASC";
    
    try {
        $stmt = $pdo->query($sql);
        $videos = $stmt->fetchAll();
    } catch (\PDOException $e) {
        error_log("Datenbankfehler in GET-Methode: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Datenbankfehler beim Abrufen der Videos.']);
        exit;
    }
    
    if (empty($videos)) {
        error_log("Keine Videos gefunden. Leeres Array wird gesendet.");
    }

    if ($hasAdditionalPlatforms) {
        foreach ($videos as &$videoRow) {
            if (!isset($videoRow['additionalPlatforms']) || $videoRow['additionalPlatforms'] === null || $videoRow['additionalPlatforms'] === '') {
                $videoRow['additionalPlatforms'] = '[]';
            }
        }
        unset($videoRow);
    } else {
        foreach ($videos as &$videoRow) {
            $videoRow['additionalPlatforms'] = '[]';
        }
        unset($videoRow);
    }

    echo json_encode($videos);
    exit;
}

// Für alle anderen Anfragen (POST, DELETE) ist ein Login erforderlich
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    error_log("Zugriffsversuch ohne Login.");
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Zugriff verweigert. Bitte einloggen.']);
    exit;
}

// POST-Anfrage zum Erstellen ODER Aktualisieren
if ($method === 'POST') {
    error_log("API-Anfrage: POST-Methode");

    if (isset($_POST['_method']) && strtoupper($_POST['_method']) === 'PUT') {
        // --- UPDATE LOGIC ---
        $id = $_POST['id'] ?? 0;
        if (!$id) {
            error_log("Update-Anfrage: ID fehlt.");
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Keine ID für Update angegeben']);
            exit;
        }
        
        error_log("Update-Anfrage für ID: " . $id . " mit Daten: " . print_r($_POST, true)); 

        $updateData = [
            'title' => $_POST['title'] ?? '',
            'posterUrl' => $_POST['posterUrl'] ?? '',
            'previewUrl' => $_POST['previewUrl'] ?? '',
            'trailerUrl' => $_POST['trailerUrl'] ?? '',
            'age' => $_POST['age'] ?? 0,
            'summary' => $_POST['summary'] ?? '',
            'tags' => $_POST['tags'] ?? '',
            'platform' => $_POST['platform'] ?? '',
            'platformUrl' => $_POST['platformUrl'] ?? '',
            'platformLogo' => $_POST['platformLogo'] ?? '',
            'watchHint' => $_POST['watchHint'] ?? '',
            'firstAired' => $_POST['firstAired'] ?? '',
            'imdbRating' => $_POST['imdbRating'] ?? ''
        ];

        if ($hasAdditionalPlatforms) {
            $updateData['additionalPlatforms'] = normalizeAdditionalPlatformsInput($_POST['additionalPlatforms'] ?? '');
        }

        $setFragments = [];
        $values = [];
        foreach ($updateData as $column => $value) {
            $setFragments[] = "$column = ?";
            $values[] = $value;
        }
        $values[] = $id;

        $sql = 'UPDATE videos SET ' . implode(', ', $setFragments) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute($values);
            echo json_encode(['status' => 'success', 'message' => 'Video aktualisiert']);
        } catch (\PDOException $e) {
            error_log("Fehler beim Aktualisieren: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Fehler beim Aktualisieren: ' . $e->getMessage()]);
        }
    } else {
        // --- CREATE LOGIC ---
        error_log("Create-Anfrage mit Daten: " . print_r($_POST, true));
        $insertData = [
            'title' => $_POST['title'] ?? '',
            'posterUrl' => $_POST['posterUrl'] ?? '',
            'previewUrl' => $_POST['previewUrl'] ?? '',
            'trailerUrl' => $_POST['trailerUrl'] ?? '',
            'age' => $_POST['age'] ?? 0,
            'summary' => $_POST['summary'] ?? '',
            'tags' => $_POST['tags'] ?? '',
            'platform' => $_POST['platform'] ?? '',
            'platformUrl' => $_POST['platformUrl'] ?? '',
            'platformLogo' => $_POST['platformLogo'] ?? '',
            'watchHint' => $_POST['watchHint'] ?? '',
            'firstAired' => $_POST['firstAired'] ?? '',
            'imdbRating' => $_POST['imdbRating'] ?? ''
        ];

        if ($hasAdditionalPlatforms) {
            $insertData['additionalPlatforms'] = normalizeAdditionalPlatformsInput($_POST['additionalPlatforms'] ?? '');
        }

        $columns = array_keys($insertData);
        $placeholders = array_fill(0, count($columns), '?');
        $values = array_values($insertData);

        $sql = 'INSERT INTO videos (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')';
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute($values);
            echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId()]);
        } catch (\PDOException $e) {
            error_log("Fehler beim Speichern: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Fehler beim Speichern: ' . $e->getMessage()]);
        }
    }
}

// DELETE-Anfrage zum Löschen
if ($method === 'DELETE') {
    error_log("API-Anfrage: DELETE-Methode");

    $id = $_GET['id'] ?? 0;
    if ($id) {
        error_log("Delete-Anfrage für ID: " . $id);
        $stmt = $pdo->prepare("DELETE FROM videos WHERE id = ?");
        
        try {
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success', 'message' => 'Video gelöscht']);
        } catch (\PDOException $e) {
            error_log("Fehler beim Löschen: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Fehler beim Löschen: ' . $e->getMessage()]);
        }
    } else {
        error_log("Delete-Anfrage: ID fehlt.");
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Keine ID angegeben']);
    }
}
?>
