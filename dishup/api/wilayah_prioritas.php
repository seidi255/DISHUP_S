<?php
require_once 'config.php';
require_once 'log_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM tbl_wilayah_prioritas ORDER BY id DESC");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $data]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['wilayah']) || !isset($input['kecamatan']) || !isset($input['kabupaten'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO tbl_wilayah_prioritas (wilayah, kecamatan, kabupaten, status_pju, tingkat_prioritas, lat, lng, keterangan) VALUES (:wilayah, :kecamatan, :kabupaten, :status_pju, :tingkat_prioritas, :lat, :lng, :keterangan)");
            $stmt->execute([
                ':wilayah' => $input['wilayah'],
                ':kecamatan' => $input['kecamatan'],
                ':kabupaten' => $input['kabupaten'],
                ':status_pju' => $input['status_pju'] ?? 'Tidak Ada',
                ':tingkat_prioritas' => $input['tingkat_prioritas'] ?? 'Sedang',
                ':lat' => isset($input['lat']) ? $input['lat'] : null,
                ':lng' => isset($input['lng']) ? $input['lng'] : null,
                ':keterangan' => $input['keterangan'] ?? ''
            ]);

            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            insertLog($pdo, null, null, 'Perubahan Data', 'Menampah Wilayah Prioritas PJU (' . $input['wilayah'] . ')', 'Insert', 'Wilayah Prioritas', 'Berhasil', $ip);

            echo json_encode(['status' => 'success', 'message' => 'Data wilayah prioritas berhasil ditambahkan', 'id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE tbl_wilayah_prioritas SET wilayah=:wilayah, kecamatan=:kecamatan, kabupaten=:kabupaten, status_pju=:status_pju, tingkat_prioritas=:tingkat_prioritas, lat=:lat, lng=:lng, keterangan=:keterangan WHERE id=:id");
            $stmt->execute([
                ':id' => $input['id'],
                ':wilayah' => $input['wilayah'],
                ':kecamatan' => $input['kecamatan'],
                ':kabupaten' => $input['kabupaten'],
                ':status_pju' => $input['status_pju'],
                ':tingkat_prioritas' => $input['tingkat_prioritas'],
                ':lat' => isset($input['lat']) ? $input['lat'] : null,
                ':lng' => isset($input['lng']) ? $input['lng'] : null,
                ':keterangan' => $input['keterangan'] ?? ''
            ]);

            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            insertLog($pdo, null, null, 'Perubahan Data', 'Update Wilayah Prioritas (ID: ' . $input['id'] . ')', 'Update', 'Wilayah Prioritas', 'Berhasil', $ip);

            echo json_encode(['status' => 'success', 'message' => 'Data wilayah prioritas berhasil diupdate']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? null;
        }

        if (!$id) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM tbl_wilayah_prioritas WHERE id=:id");
            $stmt->execute([':id' => $id]);

            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            insertLog($pdo, null, null, 'Perubahan Data', 'Hapus Wilayah Prioritas (ID: ' . $id . ')', 'Delete', 'Wilayah Prioritas', 'Berhasil', $ip);

            echo json_encode(['status' => 'success', 'message' => 'Data wilayah prioritas berhasil dihapus']);
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