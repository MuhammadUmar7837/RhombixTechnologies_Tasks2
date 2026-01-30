<?php
include 'db.php';

try {
    $sql = "SELECT * FROM songs ORDER BY id DESC";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception($conn->error);
    }

    $songs = array();
    
    while ($row = $result->fetch_assoc()) {
        // Ensure numeric types are correct
        $row['id'] = (int)$row['id'];
        // liked status is stored in localStorage on client side
        $row['liked'] = false;
        $songs[] = $row;
    }

    http_response_code(200);
    echo json_encode($songs);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => "Database error: " . $e->getMessage(),
        "songs" => []
    ]);
}

$conn->close();
?>
