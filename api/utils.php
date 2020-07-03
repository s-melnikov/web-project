<?php

# Simple var_dump wrapper
function dd() {
  echo '<pre>';
  call_user_func_array('var_dump', func_get_args());
  exit;
}

# maps directly to json_encode, but renders JSON headers as well
function json() {
  $json = call_user_func_array('json_encode', func_get_args());
  $err = json_last_error();

  # trigger a user error for failed encodings
  if ($err !== JSON_ERROR_NONE) {
    throw new RuntimeException(
      "JSON encoding failed [{$err}].",
      500
    );
  }

  header('Content-type: application/json');
  print $json;
}

function params($name, $fallback = null) {
  return isset($_REQUEST[$name]) ? $_REQUEST[$name] : $fallback;
}
