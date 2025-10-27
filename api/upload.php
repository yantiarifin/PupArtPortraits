<?php
// Enable CORS for local development
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
$uploadDir = UPLOAD_PATH;
$maxFileSize = MAX_FILE_SIZE;
$allowedTypes = ALLOWED_IMAGE_TYPES;

// Get dog name from POST data (if provided)
$dogName = isset($_POST['dogName']) ? trim($_POST['dogName']) : '';
if (empty($dogName)) {
    $dogName = 'Unknown';
}

// Sanitize dog name for folder name (remove special characters)
$safeDogName = preg_replace('/[^a-zA-Z0-9\-_]/', '', str_replace(' ', '-', $dogName));
if (empty($safeDogName)) {
    $safeDogName = 'Unknown';
}

// Create subdirectory with dog name and date
$dateFolder = $safeDogName . '-' . date('Y-m-d');
$uploadDir = UPLOAD_PATH . $dateFolder . '/';

// Create upload directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Function to generate unique filename
function generateUniqueFilename($originalName) {
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    $timestamp = date('Y-m-d-His');
    $random = bin2hex(random_bytes(4));
    return "dog-{$timestamp}-{$random}.{$extension}";
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Check if files were uploaded
if (!isset($_FILES['photos'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No files uploaded']);
    exit;
}

$uploadedFiles = [];
$errors = [];

// Handle multiple file uploads
$files = $_FILES['photos'];
$fileCount = is_array($files['name']) ? count($files['name']) : 1;

for ($i = 0; $i < $fileCount; $i++) {
    $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
    $type = is_array($files['type']) ? $files['type'][$i] : $files['type'];
    $tmpName = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
    $error = is_array($files['error']) ? $files['error'][$i] : $files['error'];
    $size = is_array($files['size']) ? $files['size'][$i] : $files['size'];
    
    // Validate file upload
    if ($error !== UPLOAD_ERR_OK) {
        $errorMessage = "Upload failed for {$name}: ";
        switch ($error) {
            case UPLOAD_ERR_INI_SIZE:
                $errorMessage .= "File exceeds upload_max_filesize in php.ini";
                break;
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage .= "File exceeds MAX_FILE_SIZE in form";
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage .= "File was only partially uploaded";
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMessage .= "No file was uploaded";
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errorMessage .= "Missing temporary folder";
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errorMessage .= "Failed to write file to disk";
                break;
            case UPLOAD_ERR_EXTENSION:
                $errorMessage .= "File upload stopped by extension";
                break;
            default:
                $errorMessage .= "Unknown error (code: {$error})";
        }
        $errors[] = $errorMessage;
        continue;
    }
    
    // Validate file type
    if (!in_array($type, $allowedTypes)) {
        $errors[] = "Invalid file type for {$name}. Got: {$type}. Allowed: " . implode(', ', $allowedTypes);
        continue;
    }
    
    // Validate file size
    if ($size > $maxFileSize) {
        $sizeInMB = round($size / (1024 * 1024), 2);
        $maxInMB = round($maxFileSize / (1024 * 1024), 2);
        $errors[] = "File too large: {$name} ({$sizeInMB}MB). Maximum allowed: {$maxInMB}MB";
        continue;
    }
    
    // Generate unique filename
    $newFilename = generateUniqueFilename($name);
    $destination = $uploadDir . $newFilename;
    
    // Move uploaded file
    if (move_uploaded_file($tmpName, $destination)) {
        $uploadedFiles[] = [
            'original_name' => $name,
            'filename' => $newFilename,
            'url' => 'google-drive://' . $dateFolder . '/' . $newFilename, // Include folder in path
            'folder' => $dateFolder, // Add folder name for reference
            'size' => $size,
            'type' => $type,
            'path' => $destination // Store full path for reference
        ];
    } else {
        $errors[] = "Failed to save {$name}";
    }
}

// Prepare response
$response = [
    'success' => count($uploadedFiles) > 0,
    'files' => $uploadedFiles,
    'errors' => $errors
];

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>