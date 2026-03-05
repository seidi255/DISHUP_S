<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        try {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM laporan_surat WHERE id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetch();
                if ($result) {
                    echo json_encode(["status" => "success", "data" => $result]);
                } else {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "Data tidak ditemukan"]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM laporan_surat ORDER BY created_at DESC");
                $result = $stmt->fetchAll();
                echo json_encode(["status" => "success", "data" => $result]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $stmt = $pdo->prepare("INSERT INTO laporan_surat (nomor_surat, jenis_surat, tanggal_surat, perihal, nama_pegawai, jabatan, tujuan, keterangan, file_scan, dibuat_oleh) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['nomor_surat'],
                $input['jenis_surat'],
                $input['tanggal_surat'],
                $input['perihal'],
                $input['nama_pegawai'],
                $input['jabatan'] ?? null,
                $input['tujuan'] ?? null,
                $input['keterangan'] ?? null,
                $input['file_scan'] ?? null,
                $input['dibuat_oleh'] ?? null
            ]);

            echo json_encode(["status" => "success", "message" => "Laporan Surat berhasil ditambahkan"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID diperlukan"]);
            break;
        }

        $id = $_GET['id'];
        try {
            $fieldsToUpdate = [];
            $values = [];
            foreach ($input as $key => $value) {
                $fieldsToUpdate[] = "$key = ?";
                $values[] = $value;
            }
            if (empty($fieldsToUpdate))
                break;

            $values[] = $id;
            $sql = "UPDATE laporan_surat SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            echo json_encode(["status" => "success", "message" => "Laporan Surat berhasil diupdate"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID diperlukan"]);
            break;
        }
        $id = $_GET['id'];
        try {
            $stmt = $pdo->prepare("DELETE FROM laporan_surat WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "message" => "Laporan Surat berhasil dihapus"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
}
?>