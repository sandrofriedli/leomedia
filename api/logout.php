<?php
// api/logout.php
session_start();

// Alle Session-Variablen löschen
$_SESSION = array();

// Das Session-Cookie löschen.
// Hinweis: Das wird die Session zerstören, nicht nur die Session-Daten!
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Zum Schluss, die Session zerstören.
session_destroy();

// Bestätigung an das Frontend senden
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logout erfolgreich.']);
?>

