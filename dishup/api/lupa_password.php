<?php
require_once 'config.php';

// Cek dan tambahkan kolom jika belum ada (Migration otomatis)
try {
    $pdo->query("SELECT reset_token FROM users LIMIT 1");
} catch (PDOException $e) {
    // Jika error, berarti kolom belum ada
    $pdo->exec("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL");
    $pdo->exec("ALTER TABLE users ADD COLUMN reset_expires DATETIME NULL");
}

header("Content-Type: application/json; charset=UTF-8");
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

$data = json_decode(file_get_contents("php://input"));

if ($method == 'POST') {
    if ($action == 'request') {
        // [1] User meminta link reset
        $email = isset($data->email) ? trim($data->email) : '';
        if (!$email) {
            echo json_encode(["status" => "error", "message" => "Email wajib diisi"]);
            exit;
        }

        // Cek apakah email terdaftar
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Jika user ada, buat token
        if ($user) {
            $token = bin2hex(random_bytes(32)); // Token 64 karakter
            $expires = date("Y-m-d H:i:s", time() + 3600); // Kedaluwarsa dalam 1 jam

            $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?");
            $stmt->execute([$token, $expires, $user['id']]);

            // Di environment asli, di sini mengirim email. 
            // Karena ini dilokal, kita kirimkan token dalam respons agar bisa diklik di UI (hanya untuk testing/dosen)
            // Atau berikan link localhost ke react app
            $resetLink = "http://localhost:5173/reset-password?token=" . $token;

            echo json_encode([
                "status" => "success",
                "message" => "Jika email terdaftar, instruksi reset dikirim.",
                "dev_note" => "HANYA UNTUK TESTING LOKAL: Link reset = " . $resetLink
            ]);
        } else {
            // Sengaja dibuat berhasil agar orang jahat tidak bisa menebak email mana yang terdaftar
            echo json_encode([
                "status" => "success",
                "message" => "Jika email terdaftar, instruksi reset dikirim."
            ]);
        }

    } elseif ($action == 'reset') {
        // [2] User mengsubmit password baru
        $token = isset($data->token) ? trim($data->token) : '';
        $new_password = isset($data->new_password) ? $data->new_password : '';

        if (!$token || !$new_password) {
            echo json_encode(["status" => "error", "message" => "Token dan Password baru wajib diisi"]);
            exit;
        }

        if (strlen($new_password) < 6) {
            echo json_encode(["status" => "error", "message" => "Password minimal 6 karakter"]);
            exit;
        }

        // Cari user yang punya token ini dan belum expire (Gunakan waktu PHP agar sinkron dengan saat token dibuat)
        $now = date("Y-m-d H:i:s");
        $stmt = $pdo->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expires > ?");
        $stmt->execute([$token, $now]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Update password dan kosongkan token
            $hashed = password_hash($new_password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?");
            if ($stmt->execute([$hashed, $user['id']])) {

                // Tambahkan log aktivitas
                require_once 'log_helper.php';
                $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
                insertLog($pdo, $user['id'], "User IDs: " . $user['id'], 'Perubahan Data', 'Reset Password', 'Update', 'users', 'Berhasil', $ip);

                echo json_encode(["status" => "success", "message" => "Password berhasil diubah. Silakan login."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Gagal mengubah password"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Link reset password tidak valid atau sudah kedaluwarsa"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Aksi tidak dikenali"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
}
?>