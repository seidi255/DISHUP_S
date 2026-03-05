<?php
$db = new PDO('mysql:host=localhost;dbname=db_dishup', 'root', '');
$stmt = $db->query('SELECT email, password_hash FROM users');
$data = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $data[] = $row;
}
file_put_contents('users_out.json', json_encode($data, JSON_PRETTY_PRINT));
