# Gateway

Единая точка входа в систему на базе Spring Cloud Gateway. Маршрутизирует запросы к Article Service и RAG Service, управляет CORS.

## Маршруты

| Путь           | Сервис          | Целевой URL (по умолчанию)  |
|----------------|-----------------|-----------------------------|
| `/knowledge/**`| Article Service | `http://localhost:8057`     |
| `/embedding/**`| RAG Service     | `http://localhost:8094`     |

Префикс (`/knowledge`, `/embedding`) удаляется перед проксированием (`StripPrefix=1`).

## Команды

```shell
./gradlew :gateway:test      # запуск тестов
./gradlew :gateway:build     # сборка
./gradlew :gateway:bootRun   # локальный запуск
```

## Переменные окружения

| Переменная                | По умолчанию            | Описание                       |
|---------------------------|-------------------------|--------------------------------|
| `SERVER_PORT`             | `8033`                  | Порт Gateway                   |
| `SPRING_APPLICATION_NAME` | `gateway`               | Имя сервиса                    |
| `ARTICLE_PATH`            | `/knowledge/**`         | Паттерн пути для Article       |
| `ARTICLE_STRIP_PREFIX`    | `1`                     | Количество удаляемых сегментов |
| `ARTICLE_SERVICE_ID`      | `article`               | ID маршрута                    |
| `ARTICLE_SERVICE_URI`     | `http://localhost:8057` | URL Article Service            |
| `RAG_PATH`                | `/embedding/**`         | Паттерн пути для RAG           |
| `RAG_STRIP_PREFIX`        | `1`                     | Количество удаляемых сегментов |
| `RAG_SERVICE_ID`          | `rag`                   | ID маршрута                    |
| `RAG_SERVICE_URI`         | `http://localhost:8094` | URL RAG Service                |
