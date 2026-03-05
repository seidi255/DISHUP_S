<?php
$hash = '$2y$10$Mz5D5D6p/kz/Swn20knsLeFu5ee5hJN1zSsMk9S6d8yADsjv7h6AO';
$passwords = ['admin', 'admin123', 'password', '123456', '12345678', 'dishup'];
foreach ($passwords as $p) {
    if (password_verify($p, $hash)) {
        echo "Found: " . $p . "\n";
        exit;
    }
}
echo "Not found common passwords.\n";
