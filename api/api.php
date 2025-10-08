<?php
session_start();
header('Content-Type: application/json');
require 'db_connect.php';

// Funktion zur Fehlerbehandlung
function error_response($message) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Alle Buecher abrufen (oeffentlich zugaenglich)
            $stmt = $pdo->query("SELECT id, title, emoji, link FROM buecher");
            $books = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($books);
            break;

        case 'POST':
            // Ein neues Buch erstellen (erfordert Login)
            if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Zugriff verweigert. Bitte einloggen.']);
                exit();
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['title']) || !isset($data['emoji']) || !isset($data['link'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Ungueltige Eingabedaten.']);
                exit();
            }

            $sql = "INSERT INTO buecher (title, emoji, link) VALUES (:title, :emoji, :link)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':title' => $data['title'],
                ':emoji' => $data['emoji'],
                ':link' => $data['link']
            ]);

            $newBookId = $pdo->lastInsertId();
            echo json_encode(['status' => 'success', 'id' => $newBookId, 'data' => $data]);
            break;

        case 'PUT':
            // Ein Buch aktualisieren (erfordert Login)
            if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Zugriff verweigert.']);
                exit();
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['id']) || !isset($data['title']) || !isset($data['emoji']) || !isset($data['link'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Ungueltige Eingabedaten.']);
                exit();
            }

            $sql = "UPDATE buecher SET title = :title, emoji = :emoji, link = :link WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':title' => $data['title'],
                ':emoji' => $data['emoji'],
                ':link' => $data['link'],
                ':id' => $data['id']
            ]);

            echo json_encode(['status' => 'success', 'data' => $data]);
            break;

        case 'DELETE':
            // Ein Buch loeschen (erfordert Login)
             if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
                http_response_code(403);
                echo json_encode(['status' => 'error', 'message' => 'Zugriff verweigert.']);
                exit();
            }

            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data || !isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Keine ID angegeben.']);
                exit();
            }
            
            $sql = "DELETE FROM buecher WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':id' => $data['id']]);

            echo json_encode(['status' => 'success']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Methode nicht erlaubt']);
            break;
    }
} catch (PDOException $e) {
    // Generische Fehlermeldung fuer Datenbankprobleme
    error_response("Datenbankfehler: " . $e->getMessage());
}