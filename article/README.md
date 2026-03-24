# Article Service

Сервис отвечает за хранение и управление статьями.

## Основные функции

- CRUD операций со статьями
- интеграция с RabbitMQ
- миграции через Flyway

## Переменные конфигурации

| Название                | Значение по умолчанию                      | Описание          |
|-------------------------|--------------------------------------------|-------------------|
| SERVER_PORT             | 8057                                       | Порт сервиса      |
| SPRING_APPLICATION_NAME | article                                    | Имя сервиса       |
| KEYCLOAK                | `http://localhost:9090/realms/graduation`  | JWT issuer        |
| DATASOURCE_R2DBC_URL    | r2dbc:postgresql://localhost:5432/rag      | R2DBC подключение |
| DATASOURCE_NAME         | rag_user                                   | Пользователь БД   |
| DATASOURCE_PASSWORD     | rag_pass                                   | Пароль БД         |
| RABBITMQ_HOST           | localhost                                  | Хост RabbitMQ     |
| RABBITMQ_PORT           | 5672                                       | Порт RabbitMQ     |
| RABBITMQ_USERNAME       | guest                                      | Пользователь      |
| RABBITMQ_PASSWORD       | guest                                      | Пароль            |
| RABBITMQ_EXCHANGE       | article.exchange                           | Exchange          |
| RABBITMQ_ROUTING_KEY    | article.outbox                             | Routing key       |
| RABBITMQ_QUEUE          | article.outbox.queue                       | Очередь           |

**Swagger**
http://localhost:8057/webjars/swagger-ui/index.html#/
