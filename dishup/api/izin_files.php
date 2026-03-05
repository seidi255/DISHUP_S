<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'GET') {
    try {
        if ($action === 'with_kategori') {
            // Ambil semua izin beserta kategori file-nya untuk laporan respons akses
            $stmt = $pdo->query("SELECT i.*, f.kategori FROM izin_files i LEFT JOIN files f ON i.file_id = f.id ORDER BY i.diberi_pada DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $data]);
        } else {
            $stmt = $pdo->query("SELECT * FROM izin_files ORDER BY dibuat_pada DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $data]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>