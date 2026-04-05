# RAG Service

Сервис векторизации статей и семантического поиска с генерацией ответов (Retrieval-Augmented Generation). Работает на блокирующем стеке (Spring WebMVC, JDBC).

## Основные функции

- Получение событий из RabbitMQ (статьи из Article Service)
- Разбивка статей на чанки и генерация embeddings через GigaChat API
- Хранение векторов в PostgreSQL pgvector (схема `rag`, `VECTOR(2560)`)
- Семантический поиск по косинусному сходству
- Генерация ответа через GigaChat LLM (`GigaChat-2-Max`)
- Аутентификация через Keycloak (OAuth2 JWT)
- Миграции через Flyway

## Команды

```shell
./gradlew :rag:test             # запуск тестов (Testcontainers)
./gradlew :rag:build            # сборка
./gradlew :rag:bootRun          # локальный запуск
./gradlew :rag:ktlintCheck      # проверка стиля
./gradlew :rag:ktlintFormat     # автоформатирование
```

## Переменные окружения

| Переменная                 | По умолчанию                                                   | Описание                               |
|----------------------------|----------------------------------------------------------------|----------------------------------------|
| `SERVER_PORT`              | `8094`                                                         | Порт сервиса                           |
| `SPRING_APPLICATION_NAME`  | `rag`                                                          | Имя сервиса                            |
| `KEYCLOAK`                 | `http://localhost:9090/realms/graduation`                      | JWT issuer (Keycloak)                  |
| `DATASOURCE_URL`           | `jdbc:postgresql://localhost:5432/rag?currentSchema=rag`       | JDBC подключение                       |
| `DATASOURCE_NAME`          | `rag_user`                                                     | Пользователь БД                        |
| `DATASOURCE_PASSWORD`      | `rag_pass`                                                     | Пароль БД                              |
| `RABBITMQ_HOST`            | `localhost`                                                    | Хост RabbitMQ                          |
| `RABBITMQ_PORT`            | `5672`                                                         | Порт RabbitMQ                          |
| `RABBITMQ_USERNAME`        | `guest`                                                        | Пользователь RabbitMQ                  |
| `RABBITMQ_PASSWORD`        | `guest`                                                        | Пароль RabbitMQ                        |
| `RABBITMQ_VIRTUAL_HOST`    | `/`                                                            | Virtual host                           |
| `RABBITMQ_EXCHANGE`        | `article.exchange`                                             | Exchange                               |
| `RABBITMQ_ROUTING_KEY`     | `article.outbox`                                               | Routing key                            |
| `RABBITMQ_QUEUE`           | `article.outbox.queue`                                         | Очередь                                |
| `EMBEDDING_MODEL`          | `EmbeddingsGigaR`                                              | Модель эмбеддингов GigaChat            |
| `EMBEDDING_URL`            | `https://gigachat.devices.sberbank.ru/api/v1/embeddings`       | URL API эмбеддингов                    |
| `MODELS_SECRET_TOKEN`      | _(пусто)_                                                      | OAuth2 client credentials              |
| `MODELS_TOKEN_URL`         | `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`            | URL получения токена GigaChat          |
| `LLM_URL`                  | `https://gigachat.devices.sberbank.ru/api/v1/chat/completions` | URL API LLM                            |
| `LLM_MODEL`                | `GigaChat-2-Max`                                               | LLM модель                             |
| `EMBEDDING_MIN_SIMILARITY` | `0.50`                                                         | Минимальный порог косинусного сходства |

## Swagger UI

`http://localhost:8094/api/swagger-ui/index.html`
