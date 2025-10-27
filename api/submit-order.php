<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include configuration
require_once 'config.php';

// Configuration
$ordersDir = ORDERS_PATH;
$uploadsDir = UPLOAD_PATH;

// Create directories if they don't exist
if (!file_exists($ordersDir)) {
    mkdir($ordersDir, 0755, true);
}
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

// Function to generate order ID
function generateOrderId() {
    return 'PUP-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
}

// Function to handle files already in dog name folders
function processUploadedFiles($files) {
    // Files are already in their dog-name folders from upload.php
    // Just return the paths as-is
    return $files;
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

// Generate order ID
$orderId = generateOrderId();

// Process uploaded files (they're already in dog-name folders)
$finalPhotos = [];
if (!empty($data['uploadedPhotos'])) {
    $finalPhotos = processUploadedFiles($data['uploadedPhotos']);
}

// Prepare order data
$orderData = [
    'orderId' => $orderId,
    'timestamp' => date('Y-m-d H:i:s'),
    'mode' => $data['mode'] ?? 'new',
    'dogName' => $data['dogName'] ?? '',
    'background' => $data['background'] ?? '',
    'photos' => $finalPhotos,
    'existingPortrait' => $data['existingPortrait'] ?? null,
    'prints' => $data['prints'] ?? [],
    'shipping' => [
        'firstName' => $data['shipping']['firstName'] ?? '',
        'lastName' => $data['shipping']['lastName'] ?? '',
        'email' => $data['shipping']['email'] ?? '',
        'address' => $data['shipping']['address'] ?? '',
        'city' => $data['shipping']['city'] ?? '',
        'state' => $data['shipping']['state'] ?? '',
        'zipCode' => $data['shipping']['zipCode'] ?? ''
    ],
    'payment' => [
        'method' => $data['payment']['method'] ?? 'card',
        'venmoUsername' => $data['payment']['venmoUsername'] ?? null,
        'billingAddress' => $data['payment']['billingAddress'] ?? null
    ],
    'totals' => [
        'subtotal' => $data['totals']['subtotal'] ?? 0,
        'shipping' => $data['totals']['shipping'] ?? 15,
        'tax' => $data['totals']['tax'] ?? 0,
        'total' => $data['totals']['total'] ?? 0
    ]
];

// Save order to JSON file
$orderFile = $ordersDir . $orderId . '.json';
if (file_put_contents($orderFile, json_encode($orderData, JSON_PRETTY_PRINT))) {
    
    // Send branded HTML email notification
    $to = $orderData['shipping']['email'];
    $subject = "🎨 Order Confirmation - PupArt Portraits #{$orderId}";

    // HTML message with branding
    $customerName = $orderData['shipping']['firstName'] . ' ' . $orderData['shipping']['lastName'];
    $htmlMessage = "<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 100%; max-width: 300px; margin: 0 auto; padding: 20px; background: white; }
        .header { background: #1e293b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { font-size: 28px; font-weight: 600; margin-bottom: 10px; letter-spacing: -0.025em; }
        .paw { color: #06b6d4; }
        .pup { color: #f43f5e; }
        .art { color: #fbbf24; }
        .portraits { color: white; font-weight: 300; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-row:last-child { border-bottom: none; }
        .payment-box { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>
                <i class='fa-solid fa-paw paw'></i> <span class='pup'>PUP</span><span class='art'>ART</span> <span class='portraits'>portraits</span>
            </div>
        </div>

        <div class='content'>
            <p>Hi {$customerName},</p>
            <p>Thanks for your order. I'm excited to paint an awesome portrait of <strong>{$orderData['dogName']}</strong>!</p>
            <p>Here are the details of your order:</p>

            <div class='order-details'>
                <h3 style='margin-top: 0;'>Order Details</h3>
                <div class='detail-row'>
                    <strong>Order ID:</strong>
                    <span>{$orderId}</span>
                </div>
                <div class='detail-row'>
                    <strong>Dog Name:</strong>
                    <span>{$orderData['dogName']}</span>
                </div>
                <div class='detail-row'>
                    <strong>Portrait Type:</strong>
                    <span>{$orderData['mode']}</span>
                </div>
                <div class='detail-row'>
                    <strong>Total:</strong>
                    <span style='color: #0ea5e9; font-size: 18px;'><strong>$" . number_format($orderData['totals']['total'], 2) . "</strong></span>
                </div>
            </div>";

    if ($orderData['payment']['method'] === 'venmo') {
        $htmlMessage .= "
            <div class='payment-box'>
                <h3>Please complete your payment via Venmo so I can begin {$orderData['dogName']}'s portrait:</h3>
                <ul style='margin: 10px 0;'>
                    <li>Send payment to: <strong>@yanti-arifin-franz</strong></li>
                    <li>Amount: <strong>$" . number_format($orderData['totals']['total'], 2) . "</strong></li>
                    <li>Include order ID <strong>{$orderId}</strong> in the payment note</li>
                </ul>
                <p style='margin-bottom: 0;'>Your order will be processed once payment is received.</p>
            </div>";
    }

    $htmlMessage .= "
            <h3 style='font-weight: 600;'>What's Next?</h3>
            <p>I'll reach out if I have any questions about {$orderData['dogName']}'s portrait. Please allow up to one week to receive a preview of the portrait. Once you approve it, the print will be ordered and shipped within 2-3 days.</p>
            <br>
            <p>Have a PAW-some day!</p>
            <br>
            Yanti Arifin Franz
            <hr>
            <div style='width: 100%; height: 2rem; margin-top: 2rem;'></div>

            <div class='footer'>
                <p>Questions? Reply to email me at connect@pupartportraits.com or visit pupartportraits.com website.</p>
                <p style='margin: 5px 0;'>Made with 💜 by Yanti - PupArt Portraits</p>
                <p style='margin: 5px 0; font-size: 12px;'>© 2025 Yanti Arifin Franz. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>";

    // Plain text fallback
    $plainMessage = "Hi {$customerName},\n\n";
    $plainMessage .= "Thanks for your order. I'm excited to paint an awesome portrait of {$orderData['dogName']}!\n\n";
    $plainMessage .= "Here are the details of your order:\n";
    $plainMessage .= "Order ID: {$orderId}\n";
    $plainMessage .= "Dog Name: {$orderData['dogName']}\n";
    $plainMessage .= "Total: $" . number_format($orderData['totals']['total'], 2) . "\n\n";

    if ($orderData['payment']['method'] === 'venmo') {
        $plainMessage .= "Please complete your payment via Venmo so I can begin {$orderData['dogName']}'s portrait:\n";
        $plainMessage .= "- Send payment to: @yanti-arifin-franz\n";
        $plainMessage .= "- Amount: $" . number_format($orderData['totals']['total'], 2) . "\n";
        $plainMessage .= "- Include order ID ({$orderId}) in the payment note\n\n";
        $plainMessage .= "Your order will be processed once payment is received.\n\n";
    }

    $plainMessage .= "What's Next?\n";
    $plainMessage .= "I'll reach out if I have any questions about {$orderData['dogName']}'s portrait. Please allow up to one week to receive a preview of the portrait. Once you approve it, the print will be ordered and shipped within 2-3 days.\n\n";
    $plainMessage .= "Have a PAW-some day!\n\n";
    $plainMessage .= "Yanti Arifin Franz\n\n";
    $plainMessage .= "Questions? Reply to email me at connect@pupartportraits.com or visit pupartportraits.com website.\n";
    $plainMessage .= "Made with 💜 by Yanti - PupArt Portraits\n";
    $plainMessage .= "© 2025 Yanti Arifin Franz. All rights reserved.";

    // Create multipart message
    $boundary = md5(time());

    $headers = "From: PupArt Portraits <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n";

    $message = "--{$boundary}\r\n";
    $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $plainMessage . "\r\n";
    $message .= "--{$boundary}\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $htmlMessage . "\r\n";
    $message .= "--{$boundary}--";

    // Send email
    @mail($to, $subject, $message, $headers);

    // Also send notification to admin email
    $adminEmail = ADMIN_EMAIL;
    $adminSubject = "New Order Received - {$orderId}";
    $adminMessage = "New order received!\n\n";
    $adminMessage .= "Customer: {$shipping['firstName']} {$shipping['lastName']}\n";
    $adminMessage .= "Dog: {$orderData['dogName']}\n";
    $adminMessage .= "Total: $" . number_format($orderData['totals']['total'], 2) . "\n";
    $adminMessage .= "Mode: " . ($orderData['mode'] ?? 'Existing portrait') . "\n\n";
    $adminMessage .= "View in admin panel: https://pupartportraits.com/admin.html";
    @mail($adminEmail, $adminSubject, $adminMessage, $headers);

    // Send SMS notification if configured
    if (defined('ADMIN_SMS')) {
        $smsMessage = "New PupArt Order!\n";
        $smsMessage .= "{$shipping['firstName']} {$shipping['lastName']}\n";
        $smsMessage .= "Dog: {$orderData['dogName']}\n";
        $smsMessage .= "Total: $" . number_format($orderData['totals']['total'], 2);
        @mail(ADMIN_SMS, "Order {$orderId}", $smsMessage, $headers);
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'orderId' => $orderId,
        'message' => 'Order submitted successfully!'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save order']);
}
?>