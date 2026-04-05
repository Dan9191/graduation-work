# Graduation — Knowledge Base с RAG

Система управления базой знаний с возможностью семантического поиска и генерации ответов на основе статей (RAG).

## Архитектура

```
Браузер → Gateway (:8033) → Article Service (:8057) → PostgreSQL (schema: article_service)
                                      ↓
                               RabbitMQ (outbox)
                                      ↓
                            RAG Service (:8094) → PostgreSQL (schema: rag, pgvector)
                                      ↓
                           GigaChat API (Embeddings + LLM)
```

## Состав репозитория

| Модуль                  | Описание                                         |
|-------------------------|--------------------------------------------------|
| `gateway/`              | Spring Cloud Gateway — точка входа               |
| `article/`              | Сервис хранения статей (WebFlux, R2DBC)          |
| `rag/`                  | Сервис векторизации и RAG-поиска (WebMVC, JDBC)  |
| `graduation-frontend/`  | React SPA                                        |
| `docs-project/`         | VitePress — документация проекта                 |

## Технологии

- **Backend**: Kotlin 2.2.21, Spring Boot 4.0.1, Java 21
- **База данных**: PostgreSQL + pgvector, Flyway
- **Очереди**: RabbitMQ (outbox pattern)
- **LLM / Embeddings**: GigaChat (Sber) — модели `GigaChat-2-Max` / `EmbeddingsGigaR`
- **Аутентификация**: Keycloak (OAuth2 JWT)
- **Frontend**: React 19, TanStack Query, Keycloak-js, STOMP/WebSocket
- **CI/CD**: GitHub Actions → ghcr.io

## Быстрый старт

### Backend

```shell
# Тесты
./gradlew :article:test
./gradlew :rag:test
./gradlew :gateway:test

# Сборка
./gradlew :article:build
./gradlew :rag:build
./gradlew :gateway:build

# Запуск отдельного сервиса
./gradlew :article:bootRun
./gradlew :rag:bootRun
./gradlew :gateway:bootRun
```

### Frontend

```shell
cd graduation-frontend
npm ci
npm start        # dev-сервер
npm test         # тесты
npm run build    # production-сборка
```

### Docker (сборка из корня репозитория)

```shell
docker build -f article/Dockerfile  -t article  .
docker build -f gateway/Dockerfile  -t gateway  .
docker build -f rag/Dockerfile      -t rag      .
docker build -f graduation-frontend/Dockerfile -t frontend graduation-frontend
```

## Сервисы

- [Article Service](./article/README.md) — порт `8057`
- [Gateway](./gateway/README.md) — порт `8033`
- [RAG Service](./rag/README.md) — порт `8094`
- [Frontend](./graduation-frontend/README.md)
- [Документация](./docs-project/README.md)
