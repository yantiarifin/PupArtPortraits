<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include configuration
require_once 'config.php';

// Use configured orders path
$ordersDir = ORDERS_PATH;

// Check if orders directory exists
if (!file_exists($ordersDir)) {
    echo json_encode([]);
    exit;
}

// Get all order files
$orderFiles = glob($ordersDir . '*.json');
$orders = [];

foreach ($orderFiles as $file) {
    // Skip the orders.json index file
    if (basename($file) === 'orders.json') {
        continue;
    }
    $content = file_get_contents($file);
    if ($content) {
        $orderData = json_decode($content, true);
        if ($orderData) {
            $orders[] = $orderData;
        }
    }
}

// Sort orders by timestamp (newest first)
usort($orders, function($a, $b) {
    return strtotime($b['timestamp']) - strtotime($a['timestamp']);
});

// Return orders as JSON
echo json_encode($orders);
?>