<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

$input = json_decode(file_get_contents('php://input'), true);

$name = $input['name'] ?? '';
$email = $input['email'] ?? '';
$message = $input['message'] ?? '';

// Validate inputs
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    exit(json_encode(['success' => false, 'error' => 'All fields are required']));
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit(json_encode(['success' => false, 'error' => 'Invalid email address']));
}

// Prepare email
$to = 'contact@pupartportraits.com';
$subject = 'New Contact Form Message from ' . $name;
$headers = "From: " . $email . "\r\n" .
           "Reply-To: " . $email . "\r\n" .
           "X-Mailer: PHP/" . phpversion() . "\r\n" .
           "Content-Type: text/plain; charset=UTF-8";

$emailBody = "Name: " . $name . "\n";
$emailBody .= "Email: " . $email . "\n\n";
$emailBody .= "Message:\n" . $message . "\n\n";
$emailBody .= "---\n";
$emailBody .= "Sent from: pupartportraits.com contact form\n";
$emailBody .= "Date: " . date('Y-m-d H:i:s') . "\n";

// Send email
if (mail($to, $subject, $emailBody, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to send message. Please try again later.']);
}
?>