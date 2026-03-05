<?php
require_once 'config.php';

try {
    // 1. Buat Tabel tbl_pju_rusak
    $sql = "CREATE TABLE IF NOT EXISTS tbl_pju_rusak (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lokasi VARCHAR(255) NOT NULL,
        wilayah VARCHAR(100) NOT NULL,
        jenis_kerusakan VARCHAR(150) NOT NULL,
        tanggal_laporan DATE NOT NULL,
        tanggal_perbaikan DATE DEFAULT NULL,
        status ENUM('Rusak', 'Proses', 'Selesai') DEFAULT 'Rusak',
        petugas VARCHAR(100) DEFAULT NULL,
        keterangan TEXT,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
    echo "Tabel tbl_pju_rusak berhasil dibuat atau sudah ada.\n";

    // 2. Cek apakah tabel kosong sebelum memasukkan dummy data
    $stmt = $pdo->query("SELECT COUNT(*) FROM tbl_pju_rusak");
    $count = $stmt->fetchColumn();

    if ($count == 0) {
        $dummyData = [
            ['Jl. Ahmad Yani Km 34', 'Banjarbaru', 'Lampu Mati Total', '2024-05-10', null, 'Rusak', null, 'Tiang nomor 14', -3.4402, 114.8329],
            ['Jl. Pangeran Antasari', 'Banjarmasin', 'Kabel Putus', '2024-05-12', '2024-05-14', 'Proses', 'Tim Teknisi 2', 'Dekat pasar', -3.3262, 114.6012],
            ['Jl. Trikora', 'Banjarbaru', 'Tiang Miring', '2024-05-01', '2024-05-05', 'Selesai', 'Rudi H.', 'Tertabrak mobil', -3.4475, 114.8118],
            ['Jl. Hasan Basri', 'Banjarmasin', 'Lampu Berkedip', '2024-05-15', null, 'Rusak', null, 'Depan kampus ULM', -3.2985, 114.5875],
            ['Jl. Gubernur Syarkawi', 'Barito Kuala', 'Panel Konslet', '2024-05-10', '2024-05-16', 'Proses', 'Tim Teknisi 1', 'Sering jeglek', -3.2754, 114.6432],
            ['Jl. Veteran', 'Banjarmasin', 'Kaca Pecah', '2024-04-20', '2024-04-22', 'Selesai', 'Budi S.', 'Batu lemparan', -3.3201, 114.6052],
            ['Jl. A. Yani Km 14', 'Gambut', 'Lampu Mati', '2024-05-18', null, 'Rusak', null, '', -3.3912, 114.6644],
            ['Simpang 4 Banjarbaru', 'Banjarbaru', 'Lampu Merah Mati', '2024-05-19', '2024-05-19', 'Proses', 'Agus', 'Tingkat urgent tinggi', -3.4422, 114.8155],
        ];

        $insertSql = "INSERT INTO tbl_pju_rusak (lokasi, wilayah, jenis_kerusakan, tanggal_laporan, tanggal_perbaikan, status, petugas, keterangan, lat, lng) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $insertStmt = $pdo->prepare($insertSql);

        foreach ($dummyData as $row) {
            $insertStmt->execute($row);
        }
        echo "Berhasil memasukkan " . count($dummyData) . " data dummy.\n";
    } else {
        echo "Tabel sudah berisi data.\n";
    }

} catch (PDOException $e) {
    die("Error database: " . $e->getMessage() . "\n");
}
?>