<?php
require_once 'config.php';
require_once 'log_helper.php';

// Membaca json body request dari React
$data = json_decode(file_get_contents("php://input"));
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Jika tidak ada action, keluarkan error
if (!$action) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Action is required"]);
    exit();
}

switch ($action) {
    case 'register':
        if (!isset($data->email) || !isset($data->password) || !isset($data->nama)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
            break;
        }

        $email = $data->email;
        $password = password_hash($data->password, PASSWORD_DEFAULT);
        $nama = $data->nama;
        $role = isset($data->role) ? $data->role : 'user';

        try {
            // Cek apakah email sudah terdaftar
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Email already exists"]);
                break;
            }

            // Mulai transaksi
            $pdo->beginTransaction();

            // Insert ke tabel users
            $stmt = $pdo->prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
            $stmt->execute([$email, $password]);

            // Dapatkan ID yang baru dibuat (karena kita pakai UUID() di tabel, lastInsertId() mungkin tidak bekerja untuk UUID string, 
            // Kita ambil dengan query id terakhir untuk email ini)
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            $user_id = $user['id'];

            // Insert ke tabel profiles
            $stmt = $pdo->prepare("INSERT INTO profiles (id, email, nama, role) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user_id, $email, $nama, $role]);

            $pdo->commit();

            echo json_encode([
                "status" => "success",
                "message" => "User registered successfully",
                "data" => [
                    "user" => [
                        "id" => $user_id,
                        "email" => $email,
                        "user_metadata" => [
                            "nama" => $nama,
                            "role" => $role
                        ]
                    ]
                ]
            ]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'login':
        if (!isset($data->email) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing email or password"]);
            break;
        }

        $email = $data->email;
        $password = $data->password;

        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                // Ambil data profile
                $stmt = $pdo->prepare("SELECT * FROM profiles WHERE id = ?");
                $stmt->execute([$user['id']]);
                $profile = $stmt->fetch();

                // Kita asumsikan token sederhana menggunakan base64 JSON (TIDAK AMAN UNTUK PRODUCTION, TAPI CUKUP UNTUK MIGRASI AWAL)
                // Seharusnya menggunakan JWT
                $session_data = [
                    "id" => $user['id'],
                    "email" => $user['email'],
                    "role" => $profile['role'] ?? 'user',
                    "exp" => time() + (86400 * 7) // 7 hari
                ];
                $access_token = base64_encode(json_encode($session_data));

                // Insert Log Login Berhasil
                $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
                insertLog($pdo, $user['id'], $user['email'], 'Login', 'Login Sistem', 'Login', 'Sistem', 'Berhasil', $ip);

                echo json_encode([
                    "status" => "success",
                    "data" => [
                        "session" => [
                            "access_token" => $access_token,
                            "user" => [
                                "id" => $user['id'],
                                "email" => $user['email'],
                                "user_metadata" => [
                                    "nama" => $profile['nama'] ?? '',
                                    "role" => $profile['role'] ?? 'user',
                                    "foto" => $profile['foto'] ?? null,
                                    "no_telepon" => $profile['no_telepon'] ?? '',
                                    "jabatan" => $profile['jabatan'] ?? ''
                                ]
                            ]
                        ],
                        "user" => [
                            "id" => $user['id'],
                            "email" => $user['email']
                        ]
                    ]
                ]);
            } else {
                // Insert Log Login Gagal
                $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
                insertLog($pdo, null, $email, 'Login', 'Gagal Login', 'Login', 'Sistem', 'Gagal', $ip);

                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'me':
        // Mendapatkan user dari token yang dikirim di header Authorization
        $headers = function_exists('apache_request_headers') ? apache_request_headers() : $_SERVER;
        $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');

        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
            $decoded = json_decode(base64_decode($token), true);

            if ($decoded && isset($decoded['id']) && $decoded['exp'] > time()) {
                $user_id = $decoded['id'];

                try {
                    // Ambil gabungan user dan profile
                    $stmt = $pdo->prepare("
                        SELECT u.id, u.email, p.nama, p.role, p.foto, p.no_telepon, p.jabatan 
                        FROM users u 
                        LEFT JOIN profiles p ON u.id = p.id 
                        WHERE u.id = ?
                    ");
                    $stmt->execute([$user_id]);
                    $user_data = $stmt->fetch();

                    if ($user_data) {
                        echo json_encode([
                            "status" => "success",
                            "data" => [
                                "user" => [
                                    "id" => $user_data['id'],
                                    "email" => $user_data['email'],
                                    "user_metadata" => [
                                        "nama" => $user_data['nama'],
                                        "role" => $user_data['role'],
                                        "foto" => $user_data['foto'],
                                        "no_telepon" => $user_data['no_telepon'],
                                        "jabatan" => $user_data['jabatan']
                                    ]
                                ]
                            ]
                        ]);
                    } else {
                        http_response_code(404);
                        echo json_encode(["status" => "error", "message" => "User not found"]);
                    }
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
                }
            } else {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Invalid or expired token"]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Authorization header missing"]);
        }
        break;

    case 'update_profile':
        $headers = function_exists('apache_request_headers') ? apache_request_headers() : $_SERVER;
        $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');

        if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
            $token = $matches[1];
            $decoded = json_decode(base64_decode($token), true);

            if ($decoded && isset($decoded['id']) && $decoded['exp'] > time()) {
                $user_id = $decoded['id'];

                $nama = $data->nama ?? '';
                $foto = $data->foto ?? null;
                $no_telepon = $data->no_telepon ?? null;
                $jabatan = $data->jabatan ?? null;

                try {
                    $stmt = $pdo->prepare("UPDATE profiles SET nama = ?, foto = ?, no_telepon = ?, jabatan = ? WHERE id = ?");
                    if ($stmt->execute([$nama, $foto, $no_telepon, $jabatan, $user_id])) {
                        echo json_encode(["status" => "success", "message" => "Profile updated successfully"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["status" => "error", "message" => "Failed to update profile"]);
                    }
                } catch (PDOException $e) {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
                }
            } else {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Invalid or expired token"]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Authorization header missing"]);
        }
        break;

    case 'list_users':
        try {
            $stmt = $pdo->query("
                SELECT u.id, u.email, u.created_at, u.is_active, p.nama, p.role 
                FROM users u 
                LEFT JOIN profiles p ON u.id = p.id
                ORDER BY u.created_at DESC
            ");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convert is_active ke tipe boolean
            foreach ($users as &$u) {
                $u['is_active'] = (bool) $u['is_active'];
            }

            echo json_encode([
                "status" => "success",
                "data" => $users
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'update_user_role':
        if (!isset($data->id) || !isset($data->role)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing id or role"]);
            break;
        }
        try {
            $stmt = $pdo->prepare("UPDATE profiles SET role = ? WHERE id = ?");
            if ($stmt->execute([$data->role, $data->id])) {
                echo json_encode(["status" => "success", "message" => "Role updated"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to update role"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    case 'update_user_status':
        if (!isset($data->id) || !isset($data->is_active)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Missing id or is_active"]);
            break;
        }
        try {
            $stmt = $pdo->prepare("UPDATE users SET is_active = ? WHERE id = ?");
            $isActiveInt = $data->is_active ? 1 : 0;
            if ($stmt->execute([$isActiveInt, $data->id])) {
                echo json_encode(["status" => "success", "message" => "Status updated"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to update status"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid action"]);
        break;
}
?>