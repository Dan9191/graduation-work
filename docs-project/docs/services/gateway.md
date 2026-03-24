# Gateway

Gateway — это точка входа в систему. Он маршрутизирует запросы к backend сервисам и управляет CORS.

## Основные функции

- маршрутизация запросов
- агрегация API
- CORS политика

## Переменные конфигурации

| Название                | Значение по умолчанию | Описание                 |
|-------------------------|-----------------------|--------------------------|
| SERVER_PORT             | 8033                  | Порт сервера             |
| SPRING_APPLICATION_NAME | gateway               | Имя сервиса              |
| ARTICLE_PATH            | /knowledge/**         | Путь для article сервиса |
| ARTICLE_STRIP_PREFIX    | 1                     | Удаление префикса        |
| ARTICLE_SERVICE_ID      | article               | ID маршрута              |
| ARTICLE_SERVICE_URI     | http://localhost:8057 | URL article сервиса      |
| RAG_PATH                | /embedding/**         | Путь для RAG             |
| RAG_STRIP_PREFIX        | 1                     | Удаление префикса        |
| RAG_SERVICE_ID          | rag                   | ID маршрута              |
| RAG_SERVICE_URI         | http://localhost:8094 | URL RAG сервиса          |