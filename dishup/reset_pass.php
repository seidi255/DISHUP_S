<?php
$db = new PDO('mysql:host=localhost;dbname=db_dishup', 'root', '');
$newHash = password_hash('admin123', PASSWORD_BCRYPT);
$stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@dishup.com'");
$stmt->execute([$newHash]);
echo "Password resetted successfully to admin123";
