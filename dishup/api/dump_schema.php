<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("DESCRIBE users");
    $schema = $stmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents('schema_output.json', json_encode($schema, JSON_PRETTY_PRINT));
} catch (Exception $e) {
    echo $e->getMessage();
}
?>