# Article Service

Сервис хранения и управления статьями базы знаний. Работает на реактивном стеке (Spring WebFlux, R2DBC).

## Основные функции

- CRUD для статей, разделов и тегов
- Outbox pattern: при создании/изменении статьи событие публикуется в RabbitMQ для RAG-сервиса
- Аутентификация через Keycloak (OAuth2 JWT)
- Миграции схемы через Flyway (схема `article_service`)

## Команды

```shell
./gradlew :article:test           # запуск тестов (Testcontainers)
./gradlew :article:build          # сборка
./gradlew :article:bootRun        # локальный запуск
./gradlew :article:ktlintCheck    # проверка стиля
./gradlew :article:ktlintFormat   # автоформатирование
```

## Переменные окружения

| Переменная                | По умолчанию                                                          | Описание                      |
|---------------------------|-----------------------------------------------------------------------|-------------------------------|
| `SERVER_PORT`             | `8057`                                                                | Порт сервиса                  |
| `SPRING_APPLICATION_NAME` | `article`                                                             | Имя сервиса                   |
| `KEYCLOAK`                | `http://localhost:9090/realms/graduation`                             | JWT issuer (Keycloak)         |
| `DATASOURCE_R2DBC_URL`    | `r2dbc:postgresql://localhost:5432/rag?currentSchema=article_service` | R2DBC подключение             |
| `DATASOURCE_URL`          | `jdbc:postgresql://localhost:5432/rag`                                | JDBC подключение (для Flyway) |
| `DATASOURCE_NAME`         | `rag_user`                                                            | Пользователь БД               |
| `DATASOURCE_PASSWORD`     | `rag_pass`                                                            | Пароль БД                     |
| `DATASOURCE_SCHEMAS`      | `article_service`                                                     | Схема Flyway                  |
| `RABBITMQ_HOST`           | `localhost`                                                           | Хост RabbitMQ                 |
| `RABBITMQ_PORT`           | `5672`                                                                | Порт RabbitMQ                 |
| `RABBITMQ_USERNAME`       | `guest`                                                               | Пользователь RabbitMQ         |
| `RABBITMQ_PASSWORD`       | `guest`                                                               | Пароль RabbitMQ               |
| `RABBITMQ_VIRTUAL_HOST`   | `/`                                                                   | Virtual host                  |
| `RABBITMQ_EXCHANGE`       | `article.exchange`                                                    | Exchange                      |
| `RABBITMQ_ROUTING_KEY`    | `article.outbox`                                                      | Routing key                   |
| `RABBITMQ_QUEUE`          | `article.outbox.queue`                                                | Очередь                       |

## Swagger UI

`http://localhost:8057/webjars/swagger-ui/index.html`
