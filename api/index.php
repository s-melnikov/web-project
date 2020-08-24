<?php

// Проверка версии PHP
if (version_compare(PHP_VERSION, '5.6') < 0) {
  echo 'We need PHP 5.6 or higher, you are running ' . PHP_VERSION;
  exit;
}

define('DS', DIRECTORY_SEPARATOR);
define('VERSION', '0.0.1');

define('PATH', __DIR__ . DS);

define('DB_PATH', PATH . 'db' . DS);
define('DB_NAME', 'main.sqlite');

require PATH . 'utils.php';
require PATH . 'rest.php';

new REST(DB_PATH . DB_NAME);
