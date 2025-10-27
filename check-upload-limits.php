<?php
// Display current PHP upload limits
echo "PHP Upload Limits:\n";
echo "==================\n";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "max_file_uploads: " . ini_get('max_file_uploads') . "\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n";
echo "\n";
echo "Your configured MAX_FILE_SIZE in config.php: 10MB\n";
echo "\n";
echo "Note: The actual upload limit is the smallest value between:\n";
echo "- upload_max_filesize (PHP setting)\n";
echo "- post_max_size (PHP setting)\n";
echo "- MAX_FILE_SIZE (your config)\n";
?>