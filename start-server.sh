#!/bin/bash
# Start PHP server with increased upload limits

echo "Starting PHP server with 10MB upload limit..."
php -c php.ini -S localhost:8000