<?php

class REST {

  static $METHOD_GET = 'GET';

  static $METHOD_POST = 'POST';

  static $METHOD_PUT = 'PUT';

  static $METHOD_DELETE = 'DELETE';

  public function __construct($db_path) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH); 
    $path = trim($path, '/');

    $verb = strtoupper($_SERVER['REQUEST_METHOD']);

    $this->route = explode('/', $path);
    array_shift($this->route);

    $this->db = new PDO('sqlite:' . $db_path);

    if (count($this->route) === 0) {
      $this->response(0);
    }

    if ($this->route[0] === 'install') {
      $this->install();
    }

    switch ($verb) {
      case self::$METHOD_GET:
        $this->get();
        break;
      case self::$METHOD_POST:
        $this->post();
        break;
      case self::$METHOD_PUT:
        $this->put();
        break;
      case self::$METHOD_DELETE:
        $this->delete();
        break;
      default:
        $this->error("Неизвестный метод запроса: '$verb'");
    }
  }

  private function get() {
    $entity = $this->route[0];
    $id = isset($this->route[1]) ? $this->route[1] : null;

    $limit = params("limit");
    $offset = params("offset");
    $fields = params("fields", "*");

    $sql = "SELECT $fields FROM $entity";

    if ($id) $sql .= " WHERE id = $id";

    if ($limit) $sql .= " LIMIT $limit";

    if ($limit && $offset) $sql .= " OFFSET $offset";

    $result = $this->db->query($sql);    
    if ($result === false) {
      $this->error('Wrong SQL: ' . $sql . ' Error: ' . $this->db->errorInfo()[2]);
    } else {
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      $this->response([
        'result' => $id ? $result[0] : $result,
      ]);
    }    
  }

  private function post() {
    $entity = $this->route[0];

    $columns = [];
    $values = [];
    $data = $this->body();

    foreach ($data as $key => $val) {
      $columns[] = $key;
      $values[] = ":$key";
    }

    $columns = join($columns, ", ");
    $values = join($values, ", "); 

    $sql = "INSERT INTO $entity ($columns) VALUES ($values)";
    $sth = $this->db->prepare($sql);
    if ($sth->execute($data) === false) {
      $this->error('Wrong SQL: ' . $sql . ' Error: ' . $this->db->errorInfo()[2]);
    } else {
      $this->response(['result' => $this->db->lastInsertId()]);
    }
  }

  private function put() {
    $entity = $this->route[0];
    $id = $this->route[1];

    $columns = [];
    $values = [];
    $data = $this->body();

    foreach ($data as $key => $val) {
      $columns[] = "$key = :$key";
    }

    $columns = join($columns, ", ");

    $sql = "UPDATE $entity SET $columns WHERE id = $id";
    $sth = $this->db->prepare($sql);
    if ($sth->execute($data) === false) {
      $this->error('Wrong SQL: ' . $sql . ' Error: ' . $this->db->errorInfo()[2]);
    } else {
      $this->response(['result' => true]);
    }
  }

  private function delete() {
    $entity = $this->route[0];
    $id = $this->route[1];    

    $sql = "DELETE FROM $entity WHERE id = $id";
    $result = $this->db->query($sql);

    if ($result === false) {
      $this->error('Wrong SQL: ' . $sql . ' Error: ' . $this->db->errorInfo()[2]);
    } else {
      $this->response(['result' => true]);
    }
  }

  private function install() {
    $sql = file_get_contents('db/dump.sql');
    $this->db->exec($sql);
    exit;
  }

  # maps directly to json_encode, but renders JSON headers as well
  private function json() {
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

  # response
  private function response($data) {
    $this->json($data);
    exit;
  }

  private function error($error) {
    http_response_code(500);
    $this->response([ 'error' => $error ]);
  }

  private function body() {
    $content = file_get_contents('php://input');
    return json_decode($content, true);
  }
}