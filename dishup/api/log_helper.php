<?php
function getUserIdFromToken()
{
    $headers = function_exists('apache_request_headers') ? apache_request_headers() : $_SERVER;
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');

    if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        $token = $matches[1];
        $decoded = json_decode(base64_decode($token), true);
        if ($decoded && isset($decoded['id'])) {
            return [
                'id' => $decoded['id'],
                'email' => $decoded['email'] ?? 'Unknown',
                'role' => $decoded['role'] ?? 'user'
            ];
        }
    }
    return null;
}

function insertLog($pdo, $user_id, $username, $tipe_log, $aktivitas, $aksi, $data_terkait, $status, $ip_address)
{
    try {
        // Jika user_id dan username kosong, coba ambil dari token
        if (!$user_id && !$username && $tipe_log === 'Perubahan Data') {
            $user_info = getUserIdFromToken();
            if ($user_info) {
                $user_id = $user_info['id'];
                $username = "Admin (" . $user_info['email'] . ")";
            } else {
                $username = "Admin / Sistem"; // Default fallback
            }
        }

        $stmt = $pdo->prepare("INSERT INTO tbl_log_aktivitas (user_id, username, tipe_log, aktivitas, aksi, data_terkait, status, ip_address) VALUES (:user_id, :username, :tipe_log, :aktivitas, :aksi, :data_terkait, :status, :ip_address)");
        $stmt->execute([
            ':user_id' => $user_id,
            ':username' => $username,
            ':tipe_log' => $tipe_log,
            ':aktivitas' => $aktivitas,
            ':aksi' => $aksi,
            ':data_terkait' => $data_terkait,
            ':status' => $status,
            ':ip_address' => $ip_address
        ]);
        return true;
    } catch (PDOException $e) {
        // Abaikan error log agar tidak mengganggu transaksi utama
        error_log("Gagal merekam log aktivitas: " . $e->getMessage());
        return false;
    }
}
?>