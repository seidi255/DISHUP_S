<?php
require_once 'config.php';

// Mendapatkan method HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Mengambil data body jika method-nya POST, PUT, atau DELETE
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        // ACTION READ
        // Mendapatkan ID opsional untuk dibaca
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        try {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM dokumen WHERE id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetch();
                if ($result) {
                    echo json_encode(["status" => "success", "data" => $result]);
                } else {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "Dokumen tidak ditemukan"]);
                }
            } else {
                // Ambil semua dokumen
                $stmt = $pdo->query("SELECT dokumen.*, profiles.nama as nama_pengupload FROM dokumen LEFT JOIN profiles ON dokumen.uploaded_by = profiles.id ORDER BY dokumen.created_at DESC");
                $result = $stmt->fetchAll();
                echo json_encode(["status" => "success", "data" => $result]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'POST':
        // ACTION CREATE
        if (!isset($input['nama_file']) || !isset($input['jenis_dokumen'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
            break;
        }

        try {
            // Karena id menggunakan UUID default, kita pass nullable id jika tidak disediakan
            $stmt = $pdo->prepare("INSERT INTO dokumen (nama_file, jenis_dokumen, bidang, uploaded_by, ukuran_file, is_private, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $input['nama_file'],
                $input['jenis_dokumen'],
                $input['bidang'] ?? null,
                $input['uploaded_by'] ?? null,
                $input['ukuran_file'] ?? null,
                isset($input['is_private']) && $input['is_private'] ? 1 : 0,
                $input['keterangan'] ?? null
            ]);

            echo json_encode(["status" => "success", "message" => "Dokumen berhasil ditambahkan"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        // ACTION UPDATE
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID diperlukan untuk update"]);
            break;
        }

        $id = $_GET['id'];

        try {
            // Membuat query dinamis berdasarkan data yang dikirim
            $fieldsToUpdate = [];
            $values = [];
            foreach ($input as $key => $value) {
                // Konversi boolean JS ke tinyint MySQL untuk is_private
                if ($key === 'is_private') {
                    $fieldsToUpdate[] = "$key = ?";
                    $values[] = $value ? 1 : 0;
                } else {
                    $fieldsToUpdate[] = "$key = ?";
                    $values[] = $value;
                }
            }

            if (empty($fieldsToUpdate)) {
                echo json_encode(["status" => "error", "message" => "Tidak ada data untuk diupdate"]);
                break;
            }

            $values[] = $id; // untuk kondisi WHERE id = ?

            $sql = "UPDATE dokumen SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            echo json_encode(["status" => "success", "message" => "Dokumen berhasil diupdate"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // ACTION DELETE
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID diperlukan untuk hapus"]);
            break;
        }
        $id = $_GET['id'];

        try {
            $stmt = $pdo->prepare("DELETE FROM dokumen WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "message" => "Dokumen berhasil dihapus"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["status" => "error", "message" => "Method not allowed"]);
        break;
}
?>