<?php
require_once 'config.php';

try {
    // Buat tabel tbl_log_aktivitas
    $sqlLog = "CREATE TABLE IF NOT EXISTS tbl_log_aktivitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        username VARCHAR(255) NOT NULL,
        tipe_log ENUM('Login', 'Aktivitas', 'Perubahan Data') NOT NULL,
        aktivitas VARCHAR(255) NOT NULL,
        aksi VARCHAR(50) NOT NULL,
        data_terkait VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        ip_address VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlLog);
    echo "Tabel tbl_log_aktivitas berhasil dibuat atau sudah ada.<br>";

    echo "Setup log aktivitas selesai.";
} catch (PDOException $e) {
    die("Database setup failed: " . $e->getMessage());
}
?>