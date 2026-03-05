<?php
// Konfigurasi Database
$host     = "localhost";
$username = "root";
$password = ""; // Default Laragon tidak ada password
$dbname   = "db_dishup";

// Atur header CORS agar file PHP bisa diakses oleh React (biasanya jalan di localhost:5173 / localhost:3000)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Mengatasi pre-flight request (OPTIONS) dari browser
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Membuat koneksi ke MySQL menggunakan PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    
    // Set error mode menjadi Exception agar mudah di-debug
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Kembalikan data dalam bentuk associatiave array secara default
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // Jika koneksi gagal, kembalikan response JSON dengan status 500
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed",
        "error" => $e->getMessage()
    ]);
    exit();
}
?>
