<?php
session_start();
header('Content-Type: application/json');

// --- Hardcodierte Login-Daten ---
$valid_username = 'Sandro';
$valid_password_hash = password_hash('HalloLeo', PASSWORD_DEFAULT); // Passwort wird gehasht

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // strcasecmp vergleicht Strings ohne auf Gross-/Kleinschreibung zu achten.
    if (strcasecmp($username, $valid_username) == 0 && password_verify($password, $valid_password_hash)) {
        // Erfolgreich eingeloggt
        $_SESSION['loggedin'] = true;
        $_SESSION['username'] = $username;
        echo json_encode(['status' => 'success']);
    } else {
        // Falsche Anmeldedaten
        echo json_encode(['status' => 'error', 'message' => 'Ungültiger Benutzername oder Passwort.']);
    }
} else {
    // Ungültige Anfrage
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Methode nicht erlaubt.']);
}
?>

