<?php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	echo json_encode([
		'success' => false,
		'message' => 'Неверный метод запроса.'
	]);
	exit;
}

$name = trim($_POST['name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');

if ($name === '' || $phone === '' || $email === '') {
	echo json_encode([
		'success' => false,
		'message' => 'Пожалуйста, заполните все поля.'
	]);
	exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	echo json_encode([
		'success' => false,
		'message' => 'Введите корректный email.'
	]);
	exit;
}

$createdAt = date('Y-m-d H:i:s');

/*
|--------------------------------------------------------------------------
| 1. Отправка в Google Sheets через Apps Script
|--------------------------------------------------------------------------
*/
$googleScriptUrl = 'https://script.google.com/macros/s/AKfycbzSBSs14_py81Joh8o2yyzWJ-EH9kcBUsjTQStdH34epeC6nhgAdWFXRKGAc5LN5hDc/exec';

$sheetPayload = json_encode([
	'name' => $name,
	'phone' => $phone,
	'email' => $email,
	'created_at' => $createdAt
], JSON_UNESCAPED_UNICODE);

$sheetSuccess = false;

if ($googleScriptUrl !== 'https://script.google.com/macros/s/AKfycbzSBSs14_py81Joh8o2yyzWJ-EH9kcBUsjTQStdH34epeC6nhgAdWFXRKGAc5LN5hDc/exec') {
	$ch = curl_init($googleScriptUrl);

	curl_setopt_array($ch, [
		CURLOPT_POST => true,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_HTTPHEADER => [
			'Content-Type: application/json'
		],
		CURLOPT_POSTFIELDS => $sheetPayload,
		CURLOPT_TIMEOUT => 15
	]);

	$sheetResponse = curl_exec($ch);
	$sheetHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	$sheetCurlError = curl_error($ch);

	curl_close($ch);

	if (!$sheetCurlError && $sheetHttpCode >= 200 && $sheetHttpCode < 300) {
		$sheetSuccess = true;
	}
}

/*
|--------------------------------------------------------------------------
| 2. Дублирование на почту
|--------------------------------------------------------------------------
*/
$to = 'sianalucky@gmail.com';
$subject = 'Новая заявка с сайта';

$message = <<<HTML
<html>
<head>
	<meta charset="UTF-8">
	<title>Новая заявка с сайта</title>
</head>
<body>
	<h2>Новая заявка с сайта</h2>
	<p><strong>Имя:</strong> {$name}</p>
	<p><strong>Телефон:</strong> {$phone}</p>
	<p><strong>Email:</strong> {$email}</p>
	<p><strong>Дата:</strong> {$createdAt}</p>
</body>
</html>
HTML;

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=UTF-8';
$headers[] = 'From: Site Form <no-reply@' . $_SERVER['HTTP_HOST'] . '>';
$headers[] = 'Reply-To: ' . $email;

$mailSuccess = mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $message, implode("\r\n", $headers));

/*
|--------------------------------------------------------------------------
| 3. Ответ
|--------------------------------------------------------------------------
| Успехом считаем ситуацию, когда сработал хотя бы один канал:
| либо таблица, либо почта
*/
if ($sheetSuccess || $mailSuccess) {
	echo json_encode([
		'success' => true
	]);
	exit;
}

echo json_encode([
	'success' => false,
	'message' => 'Не удалось отправить данные. Попробуйте позже.'
]);
exit;