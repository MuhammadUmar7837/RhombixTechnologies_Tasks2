<?php
include 'db.php';

// Get JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Validate input
if (!isset($data['id']) || empty($data['id'])) {
    http_response_code(400);
    echo json_encode([
        "error" => true,
        "message" => "Song ID is required"
    ]);
    exit();
}

try {
    $id = (int)$data['id'];
    
    // Check if song exists
    $checkSql = "SELECT id FROM songs WHERE id = $id";
    $checkResult = $conn->query($checkSql);
    
    if ($checkResult->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            "error" => true,
            "message" => "Song not found"
        ]);
        exit();
    }
    
    // Delete the song
    $sql = "DELETE FROM songs WHERE id = $id";
    
    if ($conn->query($sql) === TRUE) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Song deleted successfully",
            "id" => $id
        ]);
    } else {
        throw new Exception($conn->error);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => "Database error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
