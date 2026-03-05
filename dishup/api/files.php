<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
// Untuk multipart/form-data (upload file), PHP memprosesnya di $_POST dan $_FILES
// Namun untuk aplikasi yang mengirim form data PUT/DELETE akan butuh perlakuan khusus
// Kita pakai JSON request body untuk update GET/PUT/DELETE
// Dan $_POST/$_FILES untuk upload baru

switch ($method) {
    case 'GET':
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        $kategori = isset($_GET['kategori']) ? $_GET['kategori'] : null;

        try {
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM files WHERE id = ?");
                $stmt->execute([$id]);
                $result = $stmt->fetch();
                if ($result) {
                    echo json_encode(["status" => "success", "data" => $result]);
                } else {
                    http_response_code(404);
                    echo json_encode(["status" => "error", "message" => "File tidak ditemukan"]);
                }
            } else if ($kategori) {
                $stmt = $pdo->prepare("SELECT * FROM files WHERE kategori = ? ORDER BY created_at DESC");
                $stmt->execute([$kategori]);
                $result = $stmt->fetchAll();
                echo json_encode(["status" => "success", "data" => $result]);
            } else {
                $stmt = $pdo->query("SELECT * FROM files ORDER BY created_at DESC");
                $result = $stmt->fetchAll();
                echo json_encode(["status" => "success", "data" => $result]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Menangani Upload File
        if (isset($_FILES['file'])) {
            $user_id = $_POST['user_id'] ?? null;
            $kategori = $_POST['kategori'] ?? 'umum';
            $is_private = isset($_POST['private']) && $_POST['private'] === 'true' ? 1 : 0;
            $owner = $_POST['owner'] ?? null;

            if (!$user_id) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "user_id diperlukan"]);
                break;
            }

            $file = $_FILES['file'];
            $fileName = $file['name'];
            $fileTmpName = $file['tmp_name'];
            $fileError = $file['error'];

            if ($fileError === 0) {
                // Buat direktori upload jika belum ada
                $uploadDir = '../uploads/' . $kategori . '/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                // Generate nama unik
                $fileExt = explode('.', $fileName);
                $fileActualExt = strtolower(end($fileExt));
                $newFileName = uniqid('', true) . "." . $fileActualExt;
                $fileDestination = $uploadDir . $newFileName;

                // Path relatif yang akan disimpan di DB (relatif terhadap root project)
                $dbPath = 'uploads/' . $kategori . '/' . $newFileName;

                if (move_uploaded_file($fileTmpName, $fileDestination)) {
                    // Simpan ke database
                    try {
                        $stmt = $pdo->prepare("INSERT INTO files (name, path, kategori, private, user_id, owner) VALUES (?, ?, ?, ?, ?, ?)");
                        $stmt->execute([
                            $fileName,
                            $dbPath,
                            $kategori,
                            $is_private,
                            $user_id,
                            $owner
                        ]);

                        $fileIdResult = $pdo->prepare("SELECT id FROM files WHERE path = ?");
                        $fileIdResult->execute([$dbPath]);
                        $file_id = $fileIdResult->fetchColumn();

                        echo json_encode([
                            "status" => "success",
                            "message" => "File berhasil diupload",
                            "data" => [
                                "id" => $file_id,
                                "path" => $dbPath,
                                "url" => 'http://localhost/DISHUP_S/dishup/' . $dbPath
                            ]
                        ]);
                    } catch (PDOException $e) {
                        http_response_code(500);
                        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Terjadi kesalahan saat meng-upload file"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Error PHP upload code: " . $fileError]);
            }
        }
        // POST biasa tanpa file (misal insert metadata saja)
        else {
            $input = json_decode(file_get_contents('php://input'), true);
            if (isset($input['name']) && isset($input['path'])) {
                try {
                    $stmt = $pdo->prepare("INSERT INTO files (name, path, kategori, private, user_id, owner) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $input['name'],
                        $input['path'],
                        $input['kategori'] ?? 'umum',
                        isset($input['private']) && $input['private'] ? 1 : 0,
                        $input['user_id'],
                        $input['owner'] ?? null
                    ]);
                    echo json_encode(["status" => "success", "message" => "Metadata file tersimpan"]);
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Tidak ada file yang diunggah atau data tidak valid"]);
            }
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID diperlukan"]);
            break;
        }

        try {
            // Dapatkan path filenya dulu
            $stmt = $pdo->prepare("SELECT path FROM files WHERE id = ?");
            $stmt->execute([$id]);
            $fileRecord = $stmt->fetch();

            if ($fileRecord) {
                // Hapus file fisik
                $physicalPath = '../' . $fileRecord['path'];
                if (file_exists($physicalPath)) {
                    unlink($physicalPath);
                }

                // Hapus record database
                $stmt = $pdo->prepare("DELETE FROM files WHERE id = ?");
                $stmt->execute([$id]);

                echo json_encode(["status" => "success", "message" => "File berhasil dihapus"]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "File tidak ditemukan di database"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
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
                // Konversi boolean JS ke tinyint 
                if ($key === 'private') {
                    $fieldsToUpdate[] = "$key = ?";
                    $values[] = $value ? 1 : 0;
                } else {
                    $fieldsToUpdate[] = "$key = ?";
                    $values[] = $value;
                }
            }
            if (empty($fieldsToUpdate))
                break;

            $values[] = $id;
            $sql = "UPDATE files SET " . implode(", ", $fieldsToUpdate) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);

            echo json_encode(["status" => "success", "message" => "Metadata file berhasil diupdate"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;
}
?>