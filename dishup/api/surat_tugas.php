<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        try {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM surat_tugas WHERE id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetch();
                if ($result) {
                    echo json_encode(["status" => "success", "data" => $result]);
                } else {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "Data tidak ditemukan"]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM surat_tugas ORDER BY created_at DESC");
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
            $stmt = $pdo->prepare("INSERT INTO surat_tugas (nomor_surat, tanggal_surat, nama_pejabat, nip_pejabat, jabatan_pejabat, nama_pegawai, nip_pegawai, pangkat_golongan, jabatan_pegawai, unit_kerja, dasar_penugasan, uraian_tugas, tempat_tugas, waktu_pelaksanaan, dibuat_oleh) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['nomor_surat'],
                $input['tanggal_surat'],
                $input['nama_pejabat'],
                $input['nip_pejabat'] ?? null,
                $input['jabatan_pejabat'],
                $input['nama_pegawai'],
                $input['nip_pegawai'] ?? null,
                $input['pangkat_golongan'] ?? null,
                $input['jabatan_pegawai'],
                $input['unit_kerja'] ?? null,
                $input['dasar_penugasan'] ?? null,
                $input['uraian_tugas'],
                $input['tempat_tugas'] ?? null,
                $input['waktu_pelaksanaan'] ?? null,
                $input['dibuat_oleh'] ?? null
            ]);

            echo json_encode(["status" => "success", "message" => "Surat Tugas berhasil ditambahkan"]);
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
            $sql = "UPDATE surat_tugas SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            echo json_encode(["status" => "success", "message" => "Surat Tugas berhasil diupdate"]);
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
            $stmt = $pdo->prepare("DELETE FROM surat_tugas WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "message" => "Surat Tugas berhasil dihapus"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
}
?>