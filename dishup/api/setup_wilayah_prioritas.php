<?php
require_once 'config.php';

try {
    // Buat tabel tbl_wilayah_prioritas
    $sqlTabel = "CREATE TABLE IF NOT EXISTS tbl_wilayah_prioritas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wilayah VARCHAR(255) NOT NULL,
        kecamatan VARCHAR(255) NOT NULL,
        kabupaten VARCHAR(255) NOT NULL,
        status_pju VARCHAR(50) NOT NULL,
        tingkat_prioritas VARCHAR(50) NOT NULL,
        lat DECIMAL(10, 8) NULL,
        lng DECIMAL(11, 8) NULL,
        keterangan TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sqlTabel);
    echo "Tabel tbl_wilayah_prioritas berhasil dibuat atau sudah ada.<br>";

    // Cek apakah tabel kosong, jika iya, insert data seed
    $stmtCek = $pdo->query("SELECT COUNT(*) FROM tbl_wilayah_prioritas");
    if ($stmtCek->fetchColumn() == 0) {
        $dataSeed = [
            ['Desa Paramasan Bawah', 'Paramasan', 'Kabupaten Banjar', 'Tidak Ada', 'Tinggi', -3.0567, 115.3120, 'Akses jalan hutan yang gelap gulita di malam hari, rawan kriminalitas.'],
            ['Desa Angkipih', 'Paramasan', 'Kabupaten Banjar', 'Tidak Ada', 'Tinggi', -3.0789, 115.3400, 'Jalan penghubung antar desa belum ada penerangan sama sekali.'],
            ['Desa Sungai Pinang', 'Sungai Pinang', 'Kabupaten Banjar', 'Tidak Ada', 'Sedang', -3.0901, 115.1122, 'Pertigaan utama desa minim cahaya, sering terjadi laka lantas.'],
            ['Desa Juhu', 'Batang Alai Timur', 'Hulu Sungai Tengah', 'Tidak Ada', 'Tinggi', -2.6201, 115.5410, 'Desa di pegunungan meratus, sangat terisolir dan sama sekali tidak ada tiang PJU.'],
            ['Desa Aing Bantai', 'Batang Alai Timur', 'Hulu Sungai Tengah', 'Tidak Ada', 'Tinggi', -2.5901, 115.5200, 'Akses jalan tebing rawan longsor tanpa penerangan malam.'],
            ['Desa Muara Uya', 'Muara Uya', 'Tabalong', 'Tidak Ada', 'Sedang', -1.8201, 115.6100, 'Perbatasan provinsi yang masih sepi dari infrastruktur penerangan.']
        ];

        $stmtInsert = $pdo->prepare("INSERT INTO tbl_wilayah_prioritas (wilayah, kecamatan, kabupaten, status_pju, tingkat_prioritas, lat, lng, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        foreach ($dataSeed as $row) {
            $stmtInsert->execute($row);
        }
        echo "Data awalan (seed) berhasil ditambahkan ke tbl_wilayah_prioritas.<br>";
    } else {
        echo "Tabel tbl_wilayah_prioritas sudah berisi data, lewati proses seeding.<br>";
    }

    echo "Setup Lokasi Prioritas selesai.";

} catch (PDOException $e) {
    die("Setup Prioritas gagal: " . $e->getMessage());
}
?>