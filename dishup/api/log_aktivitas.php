<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $today = date("Y-m-d");
        $seven_days_ago = date("Y-m-d", strtotime("-7 days"));

        // Data untuk Grafik (Aktivitas per Hari, 7 hari terakhir)
        $stmtGrafik = $pdo->prepare("
            SELECT DATE(created_at) as tanggal, COUNT(*) as jumlah 
            FROM tbl_log_aktivitas 
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY tanggal ASC
        ");
        $stmtGrafik->execute([$seven_days_ago]);
        $grafikAktivitas = $stmtGrafik->fetchAll(PDO::FETCH_ASSOC);

        // Data Log Aktivitas Pengguna (semua aktivitas, limit 100 terbaru)
        $stmtAktivitas = $pdo->query("SELECT * FROM tbl_log_aktivitas ORDER BY created_at DESC LIMIT 100");
        $logAktivitas = $stmtAktivitas->fetchAll(PDO::FETCH_ASSOC);

        // Data Log Percobaan Login (hanya tipe Login, limit 50 terbaru)
        $stmtLogin = $pdo->query("SELECT * FROM tbl_log_aktivitas WHERE tipe_log = 'Login' ORDER BY created_at DESC LIMIT 50");
        $logLogin = $stmtLogin->fetchAll(PDO::FETCH_ASSOC);

        // Data Log Perubahan Data (hanya tipe Perubahan Data, limit 50 terbaru)
        $stmtPerubahan = $pdo->query("SELECT * FROM tbl_log_aktivitas WHERE tipe_log = 'Perubahan Data' ORDER BY created_at DESC LIMIT 50");
        $logPerubahan = $stmtPerubahan->fetchAll(PDO::FETCH_ASSOC);

        // Summary Counts
        $stmtTotal = $pdo->prepare("SELECT
            (SELECT COUNT(*) FROM tbl_log_aktivitas WHERE DATE(created_at) = ? AND tipe_log = 'Login' AND status = 'Berhasil') as login_hari_ini,
            (SELECT COUNT(*) FROM tbl_log_aktivitas WHERE DATE(created_at) = ? AND tipe_log = 'Aktivitas') as aktivitas_hari_ini,
            (SELECT COUNT(*) FROM tbl_log_aktivitas WHERE DATE(created_at) = ? AND tipe_log = 'Perubahan Data') as perubahan_hari_ini,
            (SELECT COUNT(*) FROM tbl_log_aktivitas WHERE DATE(created_at) = ? AND tipe_log = 'Login' AND status = 'Gagal') as gagal_login_hari_ini
        ");
        $stmtTotal->execute([$today, $today, $today, $today]);
        $summary = $stmtTotal->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'status' => 'success',
            'data' => [
                'grafik' => $grafikAktivitas,
                'logSemua' => $logAktivitas,
                'logLogin' => $logLogin,
                'logPerubahan' => $logPerubahan,
                'summary' => $summary
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>