<?php
require_once 'config.php';

$jsonString = file_get_contents(__DIR__ . '/../src/assets/pju_data.json');
$data = json_decode($jsonString, true);

if ($data === null) {
    die("Error decoding JSON");
}

$count = 0;
// We will simply truncate the table to avoid duplicates if they were partially imported
$pdo->exec("TRUNCATE TABLE tbl_pju");

$stmt = $pdo->prepare("INSERT INTO tbl_pju (nama, lokasi, kecamatan, lat, lng, status, tahun) VALUES (:nama, :lokasi, :kecamatan, :lat, :lng, :status, :tahun)");

foreach ($data as $item) {
    $stmt->execute([
        ':nama' => isset($item['id']) ? $item['id'] : '',
        ':lokasi' => isset($item['alamat']) ? $item['alamat'] : '',
        ':kecamatan' => isset($item['kecamatan']) ? $item['kecamatan'] : '',
        ':lat' => isset($item['lat']) ? $item['lat'] : 0,
        ':lng' => isset($item['lng']) ? $item['lng'] : 0,
        ':status' => isset($item['status']) ? $item['status'] : 'aktif',
        ':tahun' => isset($item['tahun']) ? $item['tahun'] : 2024
    ]);
    $count++;
}

echo "Successfully imported $count rows into tbl_pju\\n";
?>