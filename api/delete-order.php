<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

// Check if user is authenticated
if (!isset($_SESSION['admin_authenticated']) || $_SESSION['admin_authenticated'] !== true) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$orderId = $input['orderId'] ?? '';

if (empty($orderId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID is required']);
    exit;
}

// Include config for proper paths
require_once 'config.php';
$ordersDir = ORDERS_PATH;

if (!file_exists($ordersDir)) {
    http_response_code(404);
    echo json_encode(['error' => 'Orders directory not found']);
    exit;
}

// Find the specific order file
$orderFile = $ordersDir . $orderId . '.json';

if (!file_exists($orderFile)) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found']);
    exit;
}

// Delete the order file
$result = unlink($orderFile);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save orders file']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Order deleted successfully',
    'orderId' => $orderId
]);
?>