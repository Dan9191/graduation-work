# RAG Service

Сервис отвечает за работу с embeddings и поиском по данным.

## Основные функции

- генерация embeddings
- поиск по похожести
- интеграция с LLM

## Переменные конфигурации

| Название                 | Значение по умолчанию                                  | Описание          |
|--------------------------|--------------------------------------------------------|-------------------|
| SERVER_PORT              | 8094                                                   | Порт сервиса      |
| SPRING_APPLICATION_NAME  | rag                                                    | Имя сервиса       |
| KEYCLOAK                 | `http://localhost:9090/realms/graduation`              | JWT issuer        |
| DATASOURCE_URL           | jdbc:postgresql://localhost:5432/rag                   | База данных       |
| DATASOURCE_NAME          | rag_user                                               | Пользователь БД   |
| DATASOURCE_PASSWORD      | rag_pass                                               | Пароль БД         |
| RABBITMQ_HOST            | localhost                                              | RabbitMQ          |
| EMBEDDING_MODEL          | EmbeddingsGigaR                                        | Модель embeddings |
| EMBEDDING_URL            | https://gigachat.devices.sberbank.ru/api/v1/embeddings | API embeddings    |
| MODELS_SECRET_TOKEN      | (empty)                                                | Токен             |
| LLM_MODEL                | GigaChat-2-Max                                         | LLM модель        |
| EMBEDDING_MIN_SIMILARITY | 0.50                                                   | Порог похожести   |

## Swagger
http://localhost:8094/api/swagger-ui/index.html
