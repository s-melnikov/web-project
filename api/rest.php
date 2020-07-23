<?php

class REST {

  /**
   * Методы HTTP запроса
   */
  static $METHOD_GET = 'GET';

  static $METHOD_POST = 'POST';

  static $METHOD_PUT = 'PUT';

  static $METHOD_DELETE = 'DELETE';

  /**
   * Конструктор
   * $db_path - путь к файлу sqlite базы данных
   */
  public function __construct($db_path) {
    // Роутинг
    $request_path = trim(
      parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH),
      '/'
    );

    // Метод текущего запроса (GET, POST, ...)
    $request_method = strtoupper($_SERVER['REQUEST_METHOD']);

    // Сохраняем данные из роута в виде массива строк
    // "api/users/9" -> array("api", "users", "9")
    $this->route = explode('/', $request_path);

    // Убираем первый элемент массива, который равен названию
    // папки, где лежит скрипт API
    array_shift($this->route);

    // Екземпляр класса для работы с базой данных
    $this->db = new PDO('sqlite:' . $db_path);

    // Если в роуте ничего нет (запрос в корень API)
    // возвращаем пустой ответ
    if (count($this->route) === 0) {
      $this->response(0);
    }

    // Инсталяция базы данных
    if ($this->route[0] === 'install') {
      $this->install();
    }

    // Опредеаляем метод и вызываем его
    switch ($request_method) {
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

  /**
   * Обработка GET запроса
   */
  private function get() {
    // Название сущности получаемой из базы (обязательно).
    // Соответствует названию таблицы в базе данных.
    $entity = $this->route[0];

    // ID сущности ()
    $id = isset($this->route[1]) ? $this->route[1] : null;

    // Лимит выборки (опционально)
    $limit = params("limit");
    // Сдвиг выборки (опционально)
    $offset = params("offset");
    // Аттрибут, по которому надо отсортировать строки (опционально)
    $sortBy = params("sortBy");
    // Порядок сортировки (desc - убывание, asc - возрастание) (опционально)
    $order = params("order");
    // Поля, которые следует показать (опционально)
    $fields = params("fields", "*");
    // Условие выборки (опционально)
    $where = params("where");

    // Формируем строку запроса в базу данных на языке SQL
    $sql = "SELECT $fields FROM $entity";

    if ($id) {
      $sql .= " WHERE id = $id";
    } else if ($where) {
      $where = json_decode($where, true);
      $temp = [];
      foreach ($where as $key => $val) {
        $temp[] = "$key = $val";
      }
      $sql .= " WHERE " . implode($temp, " AND ");
    }

    if ($sortBy) {
      $sql .= " ORDER BY $sortBy COLLATE NOCASE";

      if ($order) {
        $sql .= " $order";
      }
    }

    if (!$id) {
      if ($limit) $sql .= " LIMIT $limit";

      if ($limit && $offset) $sql .= " OFFSET $offset";
    }

    // Выполняем запрос
    $result = $this->db->query($sql);

    // Проверяем результат
    if ($result === false) {
      // Ошибка, что то пошло не так
      $this->error('Wrong SQL: ' . $sql . ' Error: ' . $this->db->errorInfo()[2]);
    } else {
      // Переменная для ответа
      $response = [];
      // Выбираем все строки в ввиде ассациотивного массива
      $result = $result->fetchAll(PDO::FETCH_ASSOC);
      // Добавляем в переменную
      $response['result'] = $id ? $result[0] : $result;
      // Если выборка нескольких строк и нет условия и есть лимит - считаем
      // сколько вообще строк в базе данных
      if (!$id && !$where && $limit) {
        $result = $this->db->query("SELECT COUNT(*) FROM $entity");
        $response['count'] = $result->fetchColumn();
      }
      // Формируем ответ
      $this->response($response);
    }
  }

  /**
   * Обработка POST запроса
   */
  private function post() {
    // Название сущности получаемой из базы
    $entity = $this->route[0];

    // Переменная для хранения названий столбцов
    $columns = [];

    // Переменная для хранения названий значений
    $values = [];

    // Получаем данные из тела запроса
    $data = $this->body();

    // Извлекаем из тела запроса
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