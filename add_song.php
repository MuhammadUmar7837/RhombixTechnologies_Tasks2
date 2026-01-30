<?php
include 'db.php';

// Get JSON input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Validate input
if (!isset($data['title']) || empty(trim($data['title']))) {
    http_response_code(400);
    echo json_encode([
        "error" => true,
        "message" => "Title is required"
    ]);
    exit();
}

if (!isset($data['src']) || empty(trim($data['src']))) {
    http_response_code(400);
    echo json_encode([
        "error" => true,
        "message" => "Audio source URL is required"
    ]);
    exit();
}

try {
    // Sanitize inputs
    $title = $conn->real_escape_string(trim($data['title']));
    $artist = isset($data['artist']) ? $conn->real_escape_string(trim($data['artist'])) : 'Unknown';
    $album = isset($data['album']) ? $conn->real_escape_string(trim($data['album'])) : 'Single';
    $cover = isset($data['cover']) ? $conn->real_escape_string(trim($data['cover'])) : 'images/default.jpg';
    $src = $conn->real_escape_string(trim($data['src']));
    $duration = isset($data['duration']) ? $conn->real_escape_string(trim($data['duration'])) : '0:00';

    // Prepare SQL statement
    $sql = "INSERT INTO songs (title, artist, album, cover, src, duration) 
            VALUES ('$title', '$artist', '$album', '$cover', '$src', '$duration')";
    
    if ($conn->query($sql) === TRUE) {
        $newId = $conn->insert_id;
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Song added successfully",
            "id" => $newId,
            "song" => [
                "id" => $newId,
                "title" => $title,
                "artist" => $artist,
                "album" => $album,
                "cover" => $cover,
                "src" => $src,
                "duration" => $duration,
                "liked" => false
            ]
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
