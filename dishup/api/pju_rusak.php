<?php
require_once 'config.php';
require_once 'log_helper.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Cek jika minta dashboard summary
        if (isset($_GET['summary'])) {
            try {
                // Total
                $stmtTotal = $pdo->query("SELECT COUNT(*) FROM tbl_pju_rusak");
                $total = $stmtTotal->fetchColumn();

                // Status Counts
                $stmtStatus = $pdo->query("SELECT status, COUNT(*) as count FROM tbl_pju_rusak GROUP BY status");
                $statusData = $stmtStatus->fetchAll(PDO::FETCH_ASSOC);

                $summary = [
                    'total' => $total,
                    'rusak' => 0,
                    'proses' => 0,
                    'selesai' => 0
                ];

                foreach ($statusData as $row) {
                    $s = strtolower($row['status']);
                    if (isset($summary[$s])) {
                        $summary[$s] = $row['count'];
                    }
                }

                // Wilayah chart data
                $stmtWilayah = $pdo->query("SELECT wilayah, COUNT(*) as value FROM tbl_pju_rusak GROUP BY wilayah ORDER BY value DESC");
                $wilayahData = $stmtWilayah->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'status' => 'success',
                    'data' => [
                        'summary' => $summary,
                        'wilayahChart' => $wilayahData
                    ]
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            // Read All PJU Rusak
            try {
                $stmt = $pdo->query("SELECT * FROM tbl_pju_rusak ORDER BY id DESC");
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['status' => 'success', 'data' => $data]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        }
        break;

    case 'POST':
        // Create new
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['lokasi']) || !isset($input['wilayah']) || !isset($input['jenis_kerusakan']) || !isset($input['tanggal_laporan'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Data tidak lengkap']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO tbl_pju_rusak (lokasi, wilayah, jenis_kerusakan, tanggal_laporan, tanggal_perbaikan, status, petugas, keterangan, lat, lng) VALUES (:lokasi, :wilayah, :jenis_kerusakan, :tanggal_laporan, :tanggal_perbaikan, :status, :petugas, :keterangan, :lat, :lng)");
            $stmt->execute([
                ':lokasi' => $input['lokasi'],
                ':wilayah' => $input['wilayah'],
                ':jenis_kerusakan' => $input['jenis_kerusakan'],
                ':tanggal_laporan' => $input['tanggal_laporan'],
                ':tanggal_perbaikan' => !empty($input['tanggal_perbaikan']) ? $input['tanggal_perbaikan'] : null,
                ':status' => isset($input['status']) ? $input['status'] : 'Rusak',
                ':petugas' => isset($input['petugas']) ? $input['petugas'] : null,
                ':keterangan' => isset($input['keterangan']) ? $input['keterangan'] : null,
                ':lat' => isset($input['lat']) ? $input['lat'] : null,
                ':lng' => isset($input['lng']) ? $input['lng'] : null
            ]);

            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            insertLog($pdo, null, null, 'Perubahan Data', 'Menampah PJU Rusak', 'Insert', 'PJU Rusak', 'Berhasil', $ip);

            echo json_encode(['status' => 'success', 'message' => 'Data PJU Rusak berhasil ditambahkan', 'id' => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        // Update existing
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("UPDATE tbl_pju_rusak SET lokasi=:lokasi, wilayah=:wilayah, jenis_kerusakan=:jenis_kerusakan, tanggal_laporan=:tanggal_laporan, tanggal_perbaikan=:tanggal_perbaikan, status=:status, petugas=:petugas, keterangan=:keterangan, lat=:lat, lng=:lng WHERE id=:id");
            $stmt->execute([
                ':id' => $input['id'],
                ':lokasi' => $input['lokasi'],
                ':wilayah' => $input['wilayah'],
                ':jenis_kerusakan' => $input['jenis_kerusakan'],
                ':tanggal_laporan' => $input['tanggal_laporan'],
                ':tanggal_perbaikan' => !empty($input['tanggal_perbaikan']) ? $input['tanggal_perbaikan'] : null,
                ':status' => isset($input['status']) ? $input['status'] : 'Rusak',
                ':petugas' => isset($input['petugas']) ? $input['petugas'] : null,
                ':keterangan' => isset($input['keterangan']) ? $input['keterangan'] : null,
                ':lat' => isset($input['lat']) ? $input['lat'] : null,
                ':lng' => isset($input['lng']) ? $input['lng'] : null
            ]);

            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            insertLog($pdo, null, null, 'Perubahan Data', 'Update PJU Rusak (ID: ' . $input['id'] . ')', 'Update', 'PJU Rusak', 'Berhasil', $ip);

            echo json_encode(['status' => 'success', 'message' => 'Data PJU Rusak berhasil diupdate']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete
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
            $stmt = $pdo->prepare("DELETE FROM tbl_pju_rusak WHERE id=:id");
            $stmt->execute([':id' => $id]);

            $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
            insertLog($pdo, null, null, 'Perubahan Data', 'Hapus PJU Rusak (ID: ' . $id . ')', 'Delete', 'PJU Rusak', 'Berhasil', $ip);

            echo json_encode(['status' => 'success', 'message' => 'Data PJU Rusak berhasil dihapus']);
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