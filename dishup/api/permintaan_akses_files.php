<?php
require_once 'config.php';

header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method == 'GET') {
        // Ambil semua permintaan
        $stmt = $pdo->prepare("SELECT p.*, f.name as file_name, f.kategori, f.private as file_private, f.owner as file_owner 
                               FROM permintaan_akses_files p 
                               LEFT JOIN files f ON p.file_id = f.id ORDER BY p.dibuat_pada DESC");
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format agar mirip seperti Supabase join (nested file object)
        $formatted = [];
        foreach ($data as $row) {
            $fileObj = [
                "id" => $row['file_id'],
                "name" => $row['file_name'],
                "kategori" => $row['kategori'],
                "private" => filter_var($row['file_private'], FILTER_VALIDATE_BOOLEAN),
                "owner" => $row['file_owner']
            ];
            unset($row['file_name']);
            unset($row['kategori']);
            unset($row['file_private']);
            unset($row['file_owner']);

            $row['file'] = $fileObj;
            $formatted[] = $row;
        }

        echo json_encode(['status' => 'success', 'data' => $formatted]);
    } elseif ($method == 'POST') {
        // Insert atau Approve/Revoke
        // Baca body JSON
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, TRUE);

        // Karena ada aksi tambahan custom seperti approve dll yang mungkin dikirim lewat POST action parameter
        $action = isset($_GET['action']) ? $_GET['action'] : 'insert';

        if ($action == 'insert') {
            $file_id = $input['file_id'] ?? null;
            $pe_id = $input['peminta_id'] ?? null;
            $email = $input['email_peminta'] ?? null;
            $pesan = $input['pesan'] ?? '';

            if (!$file_id || !$pe_id) {
                echo json_encode(['status' => 'error', 'message' => 'Missing file_id/peminta_id']);
                exit;
            }

            $stmt = $pdo->prepare("INSERT INTO permintaan_akses_files (file_id, peminta_id, email_peminta, pesan, status, dibuat_pada) VALUES (?, ?, ?, ?, 'menunggu', NOW())");
            $stmt->execute([$file_id, $pe_id, $email, $pesan]);

            echo json_encode(['status' => 'success', 'message' => 'Permintaan dikirim', 'id' => $pdo->lastInsertId()]);
        } elseif ($action == 'approve') {
            // Admin menyetujui
            $id = $input['id'];
            $file_id = $input['file_id'];
            $pe_id = $input['peminta_id'];
            $admin_id = $input['admin_id'];
            $waktu = current_time_for_izin(); // Buat izin baru

            // Insert izin
            $stmt = $pdo->prepare("INSERT INTO izin_files (file_id, penerima_id, diberi_oleh, waktu_permohonan, diberi_pada) VALUES (?, ?, ?, NOW(), NOW())");
            $stmt->execute([$file_id, $pe_id, $admin_id]);

            // Update status
            $stmt = $pdo->prepare("UPDATE permintaan_akses_files SET status = 'disetujui' WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['status' => 'success', 'message' => 'Disetujui']);
        } elseif ($action == 'revoke') {
            // Admin mencabut
            $id = $input['id'];
            $file_id = $input['file_id'];
            $pe_id = $input['peminta_id'];

            // Hapus izin
            $stmt = $pdo->prepare("DELETE FROM izin_files WHERE file_id = ? AND penerima_id = ?");
            $stmt->execute([$file_id, $pe_id]);

            // Update status
            $stmt = $pdo->prepare("UPDATE permintaan_akses_files SET status = 'dicabut' WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['status' => 'success', 'message' => 'Dicabut']);
        }
    } elseif ($method == 'DELETE') {
        // Ini untuk deny
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM permintaan_akses_files WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error']);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

function current_time_for_izin()
{
    return date('Y-m-d H:i:s');
}
