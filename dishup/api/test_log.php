<?php
require_once 'config.php';
require_once 'log_helper.php';

$ip = '127.0.0.1';
$res = insertLog($pdo, null, 'TestUser', 'Login', 'Test Activity', 'Test Action', 'Test Data', 'Berhasil', $ip);

if ($res) {
    echo "Log successfully inserted";
} else {
    echo "Log insertion failed. Check php_error.log or catch block.";
}
?>