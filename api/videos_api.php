<?php
// api/videos_api.php

session_start();
include 'db_connect.php'; // Stellt die PDO-Verbindung ($pdo) her

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

// GET-Anfrage zum Abrufen aller Videos (erfordert keinen Login)
if ($method === 'GET') {
    error_log("API-Anfrage: GET-Methode");
    $sql = "SELECT id, title, posterUrl, previewUrl, trailerUrl, age, summary, tags, platform, platformUrl, platformLogo, watchHint, firstAired, imdbRating FROM videos ORDER BY title ASC";
    
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

        $stmt = $pdo->prepare("UPDATE videos SET title=?, posterUrl=?, previewUrl=?, trailerUrl=?, age=?, summary=?, tags=?, platform=?, platformUrl=?, platformLogo=?, watchHint=?, firstAired=?, imdbRating=? WHERE id=?");
        
        try {
            $stmt->execute([
                $_POST['title'] ?? '',
                $_POST['posterUrl'] ?? '',
                $_POST['previewUrl'] ?? '',
                $_POST['trailerUrl'] ?? '',
                $_POST['age'] ?? 0,
                $_POST['summary'] ?? '',
                $_POST['tags'] ?? '',
                $_POST['platform'] ?? '',
                $_POST['platformUrl'] ?? '',
                $_POST['platformLogo'] ?? '',
                $_POST['watchHint'] ?? '',
                $_POST['firstAired'] ?? '',
                $_POST['imdbRating'] ?? '',
                $id
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Video aktualisiert']);
        } catch (\PDOException $e) {
            error_log("Fehler beim Aktualisieren: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Fehler beim Aktualisieren: ' . $e->getMessage()]);
        }
    } else {
        // --- CREATE LOGIC ---
        error_log("Create-Anfrage mit Daten: " . print_r($_POST, true));
        $stmt = $pdo->prepare("INSERT INTO videos (title, posterUrl, previewUrl, trailerUrl, age, summary, tags, platform, platformUrl, platformLogo, watchHint, firstAired, imdbRating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        try {
            $stmt->execute([
                $_POST['title'] ?? '',
                $_POST['posterUrl'] ?? '',
                $_POST['previewUrl'] ?? '',
                $_POST['trailerUrl'] ?? '',
                $_POST['age'] ?? 0,
                $_POST['summary'] ?? '',
                $_POST['tags'] ?? '',
                $_POST['platform'] ?? '',
                $_POST['platformUrl'] ?? '',
                $_POST['platformLogo'] ?? '',
                $_POST['watchHint'] ?? '',
                $_POST['firstAired'] ?? '',
                $_POST['imdbRating'] ?? ''
            ]);
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
