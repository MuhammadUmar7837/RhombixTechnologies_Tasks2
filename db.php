<?php
// Database configuration
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "vibestream_db";

// Create connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([
        "error" => true,
        "message" => "Database connection failed: " . $conn->connect_error
    ]));
}

// Set charset to UTF-8
$conn->set_charset("utf8mb4");

// Enable CORS for development (adjust in production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
