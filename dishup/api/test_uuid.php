<?php
require_once 'config.php';
require_once 'log_helper.php';

$res = insertLog($pdo, '123e4567-e89b-12d3-a456-426614174000', 'test@test.com', 'Login', 'Login Sistem', 'Login', 'Sistem', 'Berhasil', '127.0.0.1');

if ($res) {
    echo "Success insert UUID";
} else {
    echo "Fail insert UUID";
}
?>