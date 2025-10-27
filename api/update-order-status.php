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

// Support both old format (completed: boolean) and new format (status: string)
if (isset($input['status'])) {
    $status = $input['status'];
    $completed = ($status === 'completed');
    $shipped = ($status === 'shipped' || $status === 'completed');
} else {
    // Backwards compatibility
    $completed = $input['completed'] ?? false;
    $shipped = $completed; // If using old format, completed means shipped too
    $status = $completed ? 'completed' : 'pending';
}

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
    // Get all order files to show available IDs
    $orderFiles = glob($ordersDir . '*.json');
    $availableIds = [];
    foreach ($orderFiles as $file) {
        $availableIds[] = basename($file, '.json');
    }
    
    http_response_code(404);
    echo json_encode([
        'error' => 'Order not found', 
        'searchingFor' => $orderId, 
        'availableIds' => $availableIds,
        'totalOrders' => count($availableIds)
    ]);
    exit;
}

// Read the order file
$orderData = file_get_contents($orderFile);
$order = json_decode($orderData, true);

if ($order === null) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to parse order file']);
    exit;
}

// Update the order
$order['completed'] = $completed;
$order['shipped'] = $shipped;
$order['completedAt'] = $completed && !isset($order['completedAt']) ? date('c') : ($completed ? $order['completedAt'] : null);
$order['shippedAt'] = $shipped ? date('c') : null;

// Save updated order
$result = file_put_contents($orderFile, json_encode($order, JSON_PRETTY_PRINT));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save orders file']);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Order status updated successfully',
    'orderId' => $orderId,
    'completed' => $completed,
    'shipped' => $shipped,
    'status' => $status
]);
?>