<?php
session_start();
// Simpele gebruikersnaam en wachtwoord voor demonstratie
// In een echte applicatie zou je deze gegevens uit een database halen
$valid_username = 'admin';
$valid_password = 'password123';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if ($username === $valid_username && $password === $valid_password) {
        $_SESSION['loggedin'] = true;
        $_SESSION['username'] = $username;
        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Ongeldige gebruikersnaam of wachtwoord.';
    }
}
?>

<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Inloggen</title>
</head>
<body>
    <h2>Inloggen</h2>
    <?php if ($error): ?>
        <p style="color:red;"><?php echo htmlspecialchars($error); ?></p>
    <?php endif; ?>
    <form method="post" action="">
        <label for="username">Gebruikersnaam:</label>
        <input type="text" id="username" name="username" required><br><br>
        <label for="password">Wachtwoord:</label>
        <input type="password" id="password" name="password" required><br><br>
        <button type="submit">Inloggen</button>
    </form>
</body>
</html>