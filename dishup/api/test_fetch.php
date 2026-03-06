<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT id, created_at, username, aktivitas, status FROM tbl_log_aktivitas ORDER BY created_at DESC LIMIT 5");
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents('test_logs_output.json', json_encode($logs, JSON_PRETTY_PRINT));
} catch (Exception $e) {
    file_put_contents('test_logs_output.json', json_encode(["error" => $e->getMessage()]));
}
?>