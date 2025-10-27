<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Your Stripe secret key
// IMPORTANT: Replace with your actual Stripe secret key
// Get your keys from: https://dashboard.stripe.com/apikeys
$stripe_secret_key = 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Calculate amount in cents
$amount = $input['amount'] ?? 0;
$amount_in_cents = intval($amount * 100);

// Get customer info
$customerEmail = $input['email'] ?? '';
$customerName = $input['customerName'] ?? '';
$dogName = $input['dogName'] ?? '';

// Create a payment intent using cURL
$ch = curl_init('https://api.stripe.com/v1/payment_intents');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $stripe_secret_key,
    'Content-Type: application/x-www-form-urlencoded',
]);

// Build description with order details
$description = "PupArt Portrait - {$dogName}";
if ($customerName) {
    $description .= " for {$customerName}";
}

// For test mode, we'll auto-confirm the payment with a test payment method
$payment_data = http_build_query([
    'amount' => $amount_in_cents,
    'currency' => 'usd',
    'payment_method' => 'pm_card_visa', // Test card that always succeeds
    'confirm' => 'true',
    'description' => $description,
    'receipt_email' => $customerEmail,
    'metadata[order_id]' => $input['orderId'] ?? '',
    'metadata[dog_name]' => $dogName,
    'metadata[customer_name]' => $customerName,
    'metadata[customer_email]' => $customerEmail,
    'automatic_payment_methods[enabled]' => 'true',
    'automatic_payment_methods[allow_redirects]' => 'never'
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $payment_data);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    http_response_code($http_code);
    echo json_encode(['error' => 'Payment failed', 'details' => json_decode($response, true)]);
    exit;
}

$payment_intent = json_decode($response, true);

// Return success with payment intent ID
echo json_encode([
    'success' => true,
    'paymentIntentId' => $payment_intent['id'],
    'status' => $payment_intent['status'],
    'amount' => $payment_intent['amount'] / 100
]);
?>