<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        try {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM surat_permohonan WHERE id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetch();
                if ($result) {
                    echo json_encode(["status" => "success", "data" => $result]);
                } else {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "Data tidak ditemukan"]);
                }
            } else {
                $stmt = $pdo->query("SELECT * FROM surat_permohonan ORDER BY created_at DESC");
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
            $stmt = $pdo->prepare("INSERT INTO surat_permohonan (nomor_surat, tanggal_surat, perihal, tujuan, instansi_tujuan, nama_pemohon, identitas_pemohon, jabatan_pemohon, unit_pemohon, keperluan, waktu_permohonan, paragraf_pembuka, paragraf_penutup, nama_penandatangan, jabatan_penandatangan, nip_penandatangan, dibuat_oleh) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['nomor_surat'],
                $input['tanggal_surat'],
                $input['perihal'],
                $input['tujuan'],
                $input['instansi_tujuan'],
                $input['nama_pemohon'],
                $input['identitas_pemohon'],
                $input['jabatan_pemohon'],
                $input['unit_pemohon'] ?? null,
                $input['keperluan'],
                $input['waktu_permohonan'] ?? null,
                $input['paragraf_pembuka'] ?? null,
                $input['paragraf_penutup'] ?? null,
                $input['nama_penandatangan'],
                $input['jabatan_penandatangan'],
                $input['nip_penandatangan'] ?? null,
                $input['dibuat_oleh'] ?? null
            ]);

            echo json_encode(["status" => "success", "message" => "Surat Permohonan berhasil ditambahkan"]);
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
            $sql = "UPDATE surat_permohonan SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            echo json_encode(["status" => "success", "message" => "Surat Permohonan berhasil diupdate"]);
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
            $stmt = $pdo->prepare("DELETE FROM surat_permohonan WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "message" => "Surat Permohonan berhasil dihapus"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
}
?>