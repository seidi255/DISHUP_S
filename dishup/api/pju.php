<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Read All PJU
        try {
            $stmt = $pdo->query("SELECT * FROM tbl_pju ORDER BY id DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $data]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Create new PJU
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['nama']) || !isset($input['lat']) || !isset($input['lng'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO tbl_pju (nama, lokasi, kecamatan, lat, lng, status, tahun) VALUES (:nama, :lokasi, :kecamatan, :lat, :lng, :status, :tahun)");
            $stmt->execute([
                ':nama' => $input['nama'],
                ':lokasi' => $input['lokasi'] ?? '',
                ':kecamatan' => $input['kecamatan'] ?? '',
                ':lat' => $input['lat'],
                ':lng' => $input['lng'],
                ':status' => $input['status'] ?? 'aktif',
                ':tahun' => $input['tahun'] ?? date('Y')
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Data PJU berhasil ditambahkan', 'id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update existing PJU
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE tbl_pju SET nama=:nama, lokasi=:lokasi, kecamatan=:kecamatan, lat=:lat, lng=:lng, status=:status, tahun=:tahun WHERE id=:id");
            $stmt->execute([
                ':id' => $input['id'],
                ':nama' => $input['nama'],
                ':lokasi' => $input['lokasi'] ?? '',
                ':kecamatan' => $input['kecamatan'] ?? '',
                ':lat' => $input['lat'],
                ':lng' => $input['lng'],
                ':status' => $input['status'] ?? 'aktif',
                ':tahun' => $input['tahun'] ?? date('Y')
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Data PJU berhasil diupdate']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete PJU
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
            $stmt = $pdo->prepare("DELETE FROM tbl_pju WHERE id=:id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['status' => 'success', 'message' => 'Data PJU berhasil dihapus']);
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