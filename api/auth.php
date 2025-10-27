<?php
session_start();

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include configuration
require_once 'config.php';
$ADMIN_PASSWORD = ADMIN_PASSWORD;

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $password = $data['password'] ?? '';
    
    if ($password === $ADMIN_PASSWORD) {
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['login_time'] = time();
        echo json_encode(['success' => true]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid password']);
    }
    exit;
}

// Handle logout
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['logout'])) {
    $_SESSION['admin_authenticated'] = false;
    unset($_SESSION['admin_authenticated']);
    unset($_SESSION['login_time']);
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Logged out']);
    exit;
}

// Handle authentication check
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if session is valid (expires after 24 hours)
    if (isset($_SESSION['admin_authenticated']) && 
        $_SESSION['admin_authenticated'] === true &&
        (time() - $_SESSION['login_time']) < 86400) {
        echo json_encode(['authenticated' => true]);
    } else {
        echo json_encode(['authenticated' => false]);
    }
    exit;
}
?>