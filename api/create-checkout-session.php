<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// IMPORTANT: Install Stripe PHP library first:
// composer require stripe/stripe-php
// OR download from: https://github.com/stripe/stripe-php/releases

// Your Stripe secret key
// IMPORTANT: Replace with your actual Stripe secret key
// Get your keys from: https://dashboard.stripe.com/apikeys
// Use sk_test_ for testing, sk_live_ for production
$stripe_secret_key = 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE';

// For now, we'll handle this without the Stripe PHP library for simplicity
// This is a basic implementation

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

$input = json_decode(file_get_contents('php://input'), true);

// Get order details from the request
$items = $input['items'] ?? [];
$customerEmail = $input['email'] ?? '';
$dogName = $input['dogName'] ?? '';

// Calculate total
$subtotal = 0;
$line_items = [];

foreach ($items as $item) {
    $price = 0;
    $name = '';
    
    switch($item['type']) {
        case '8x8':
            $price = 2800; // $28.00 in cents
            $name = '8x8 Print';
            break;
        case '10x10':
            $price = 3000;
            $name = '10x10 Print';
            break;
        case '12x12':
            $price = 3600;
            $name = '12x12 Print';
            break;
        case '20x20':
            $price = 6000;
            $name = '20x20 Print';
            break;
        case 'digital':
            $price = 2000;
            $name = 'Digital File';
            break;
    }
    
    if ($price > 0) {
        $line_items[] = [
            'price_data' => [
                'currency' => 'usd',
                'product_data' => [
                    'name' => $name . ' - ' . $dogName,
                ],
                'unit_amount' => $price,
            ],
            'quantity' => $item['quantity'] ?? 1,
        ];
        $subtotal += $price * ($item['quantity'] ?? 1);
    }
}

// Add shipping if there are physical items
if (!empty($items) && $items[0]['type'] !== 'digital') {
    $line_items[] = [
        'price_data' => [
            'currency' => 'usd',
            'product_data' => [
                'name' => 'Shipping',
            ],
            'unit_amount' => 1500, // $15.00
        ],
        'quantity' => 1,
    ];
}

// Initialize cURL for Stripe API
$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $stripe_secret_key,
    'Content-Type: application/x-www-form-urlencoded',
]);

// Build the checkout session data
$checkout_data = http_build_query([
    'payment_method_types' => ['card'],
    'mode' => 'payment',
    'success_url' => (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/success.html?session_id={CHECKOUT_SESSION_ID}',
    'cancel_url' => (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . '/#checkout',
    'customer_email' => $customerEmail,
]);

// Add line items
foreach ($line_items as $index => $item) {
    $checkout_data .= '&line_items[' . $index . '][price_data][currency]=' . $item['price_data']['currency'];
    $checkout_data .= '&line_items[' . $index . '][price_data][product_data][name]=' . urlencode($item['price_data']['product_data']['name']);
    $checkout_data .= '&line_items[' . $index . '][price_data][unit_amount]=' . $item['price_data']['unit_amount'];
    $checkout_data .= '&line_items[' . $index . '][quantity]=' . $item['quantity'];
}

curl_setopt($ch, CURLOPT_POSTFIELDS, $checkout_data);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 200) {
    http_response_code($http_code);
    echo json_encode(['error' => 'Failed to create checkout session', 'details' => json_decode($response, true)]);
    exit;
}

echo $response;
?>