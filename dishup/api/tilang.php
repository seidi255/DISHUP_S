<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Read All Tilang
        try {
            $stmt = $pdo->query("SELECT * FROM tbl_tilang ORDER BY id DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $data]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create new Tilang
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['lokasi']) || !isset($input['jenis_pelanggaran']) || !isset($input['tanggal']) || !isset($input['wilayah'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO tbl_tilang (lokasi, wilayah, jenis_pelanggaran, tanggal, keterangan, lat, lng) VALUES (:lokasi, :wilayah, :jenis_pelanggaran, :tanggal, :keterangan, :lat, :lng)");
            $stmt->execute([
                ':lokasi' => $input['lokasi'],
                ':wilayah' => $input['wilayah'],
                ':jenis_pelanggaran' => $input['jenis_pelanggaran'],
                ':tanggal' => $input['tanggal'],
                ':keterangan' => $input['keterangan'] ?? '',
                ':lat' => isset($input['lat']) ? $input['lat'] : null,
                ':lng' => isset($input['lng']) ? $input['lng'] : null
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Data tilang berhasil ditambahkan', 'id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update existing Tilang
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE tbl_tilang SET lokasi=:lokasi, wilayah=:wilayah, jenis_pelanggaran=:jenis_pelanggaran, tanggal=:tanggal, keterangan=:keterangan, lat=:lat, lng=:lng WHERE id=:id");
            $stmt->execute([
                ':id' => $input['id'],
                ':lokasi' => $input['lokasi'],
                ':wilayah' => $input['wilayah'],
                ':jenis_pelanggaran' => $input['jenis_pelanggaran'],
                ':tanggal' => $input['tanggal'],
                ':keterangan' => $input['keterangan'] ?? '',
                ':lat' => isset($input['lat']) ? $input['lat'] : null,
                ':lng' => isset($input['lng']) ? $input['lng'] : null
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Data tilang berhasil diupdate']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete Tilang
        $id = $_GET['id'] ?? null;
        if (!$id) {
            // Coba ambil dari body
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? null;
        }

        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM tbl_tilang WHERE id=:id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['status' => 'success', 'message' => 'Data tilang berhasil dihapus']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        break;
}
?>