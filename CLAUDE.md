# Project Overview
Graduation project — knowledge base system with RAG capabilities.

# Repository Structure
```
graduation/                        # Gradle root project
├── article/                       # Article service (WebFlux, reactive)
│   ├── src/main/kotlin/ru/dan/article/
│   │   ├── config/                # RabbitMQ, Security, Flyway, CORS, OpenAPI configs
│   │   ├── controller/            # ArticleController, SectionController, TagController
│   │   ├── entity/                # Article, ArticleOutbox, Section, Tag
│   │   ├── model/                 # DTOs (article/section/tag/topic)
│   │   ├── repository/            # R2DBC reactive repositories
│   │   └── service/               # ArticleService, SectionService, TagService
│   │       └── outbox/            # OutboxScheduler, OutboxService
│   ├── src/main/resources/
│   │   ├── application.yaml
│   │   └── db/migration/          # Flyway migrations (schema: article_service)
│   └── Dockerfile
├── gateway/                       # Spring Cloud Gateway (WebFlux)
│   ├── src/main/kotlin/ru/dan/gateway/GatewayApplication.kt
│   ├── src/main/resources/application.yaml
│   └── Dockerfile
├── rag/                           # RAG service (WebMVC, blocking)
│   ├── src/main/kotlin/ru/dan/rag/
│   │   ├── client/                # GigachatModelsClient
│   │   ├── config/                # RabbitMQ consumer, GigaChat SSL, Security, OpenAPI
│   │   ├── controller/            # RequestController
│   │   ├── entity/                # Article, ArticleChunk (pgvector)
│   │   ├── model/                 # SearchRequest, SearchResult, ArticleMessage, ChunkForProcessing
│   │   ├── repository/            # JDBC repositories
│   │   └── service/               # ArticleMessageListener, ArticleProcessingService,
│   │                              #   ChunkEmbeddingService, LlmService, SearchService
│   ├── src/main/resources/
│   │   ├── application.yaml
│   │   ├── application-dev.yaml
│   │   └── db/migration/          # Flyway migrations (schema: rag)
│   └── Dockerfile
├── graduation-frontend/           # React SPA
├── docs-project/                  # VitePress documentation site
├── .github/workflows/ci.yml       # CI/CD pipeline
├── build.gradle.kts               # Root build (plugins only, apply false)
└── settings.gradle.kts            # Includes: rag, article, gateway
```

# Tech Stack
## Backend
- Kotlin 2.2.21 + Spring Boot 4.0.1 (3 services: gateway, article, rag)
- Java 21 (eclipse-temurin toolchain)
- Gradle multi-module (wrapper in repo root)
- RabbitMQ (outbox pattern: article → rag)
  - Exchange: `article.exchange`, queue: `article.outbox.queue`, routing key: `article.outbox`
  - Outbox scheduler: every 30s, batch size 10, max 3 attempts
- PostgreSQL with pgvector (single DB `rag`, separate schemas per service)
  - Article service schema: `article_service` (R2DBC + Flyway)
  - RAG service schema: `rag` (JDBC + Flyway)
- GigaChat (Sber): embeddings (`EmbeddingsGigaR`) + LLM (`GigaChat-2-Max`)
- Security: OAuth2 JWT via Keycloak (`/realms/graduation`)
- Linting: ktlint 14.1.0 (article and rag modules)

### Service ports (defaults)
| Service  | Port |
|----------|------|
| Gateway  | 8033 |
| Article  | 8057 |
| RAG      | 8094 |

### Article service specifics
- WebFlux (reactive), Spring Data R2DBC
- Dependencies: WebFlux, R2DBC PostgreSQL, Spring AMQP, Spring Security OAuth2, Flyway, springdoc-openapi, Testcontainers

### RAG service specifics
- WebMVC (blocking), Spring Data JDBC
- Dependencies: Spring Web, JDBC, Spring AMQP, Spring Security OAuth2, Flyway, langchain4j 0.31.0, springdoc-openapi, flexmark (Markdown), Testcontainers

### Gateway service specifics
- Spring Cloud Gateway WebFlux (Spring Cloud 2025.1.0)
- Routes: `/knowledge/**` → article (port 8057), `/embedding/**` → rag (port 8094)
- Global CORS: allows all origins/methods/headers

## Frontend
- React 19 (`graduation-frontend/`), Node.js 24, npm
- **Auth**: `keycloak-js` 26 (Keycloak OIDC)
- **Data fetching**: `@tanstack/react-query` 5
- **HTTP**: `axios`
- **Routing**: `react-router-dom` 7
- **Realtime**: `@stomp/stompjs` + `sockjs-client` (WebSocket)
- **Rendering**: `react-markdown`
- **Testing**: `@testing-library/react`
- Pages: ArticlesPage, ArticlePage, CreateArticlePage, EditArticlePage, SectionsPage, TagsPage, VectorSearchPage

## Docs
- VitePress (`docs-project/`)

## CI/CD
- GitHub Actions (`.github/workflows/ci.yml`): path-filter based (only changed services build)
- Per-service pipeline: test → build → docker image → push to ghcr.io
- Images tagged with `${GITHUB_SHA}`, pushed to `ghcr.io/<owner>/<repo>/<service>:<sha>`
- Java jobs: temurin JDK 21

# Architecture
```
Client → Gateway (:8033) → Article Service (:8057)
                                    ↓
                               RabbitMQ (outbox)
                                    ↓
                            RAG Service (:8094)
                                    ↓
                    chunk + vectorize (GigaChat Embeddings)
                                    ↓
                          store in pgvector (schema: rag)
```
Query flow: Client → Gateway → RAG Service → similarity search in pgvector → GigaChat LLM → answer

# Common Commands
```bash
# Run tests for a service
./gradlew :article:test
./gradlew :rag:test
./gradlew :gateway:test

# Build a service
./gradlew :article:build
./gradlew :rag:build
./gradlew :gateway:build

# Build fat jar (used in Dockerfiles)
./gradlew :article:bootJar
./gradlew :rag:bootJar
./gradlew :gateway:bootJar

# Lint check / format
./gradlew :article:ktlintCheck
./gradlew :rag:ktlintCheck
./gradlew :article:ktlintFormat
./gradlew :rag:ktlintFormat

# Docker builds (run from repo root — Dockerfiles copy all modules)
docker build -f article/Dockerfile -t article .
docker build -f gateway/Dockerfile -t gateway .
docker build -f rag/Dockerfile -t rag .

# Frontend (run from graduation-frontend/)
npm ci
npm test -- --watchAll=false
npm run build
```

# Database Schema

## Schema `article_service`
| Table | Key columns |
|-------|-------------|
| `a_section` | `id BIGSERIAL`, `name TEXT`, `parent_id → a_section` (self-referential tree) |
| `article` | `id UUID (PK)`, `title`, `description`, `body TEXT` (Markdown), `main_picture`, `source`, `created_at`, `updated_at`, `view_count`, `section_id → a_section` |
| `tag` | `id BIGSERIAL`, `name TEXT UNIQUE` |
| `article_tag` | `article_id UUID`, `tag_id BIGINT` (many-to-many) |
| `article_outbox` | `id UUID`, `article_id UUID`, `event_type` (`CREATED`/`UPDATED`), `status` (`PENDING`/`SENT`/`FAILED`), `body TEXT`, `attempt_count INT` |

## Schema `rag`
| Table | Key columns |
|-------|-------------|
| `articles` | `id UUID (PK)`, `external_article_id VARCHAR UNIQUE` (maps to article service UUID), `title`, `original_content`, `source` |
| `article_chunks` | `id UUID`, `article_id → articles`, `chunk_index INT`, `text_for_search TEXT`, `embedding VECTOR(2560)`, `processing_status` (`PENDING`/`PROCESSING`/`COMPLETED`/`FAILED`), `processing_attempts INT`, `chunk_metadata JSONB` |

> `VECTOR(2560)` — dimension matches `EmbeddingsGigaR` output. pgvector extension required.

# Important Notes
- Outbox pattern for reliable article → rag messaging
- Single PostgreSQL instance, schemas per service (`article_service` and `rag`)
- Dockerfiles do a full monorepo copy then build only the target module via `:service:bootJar`
- CI uses `dorny/paths-filter` to skip unchanged services; docs job only builds Docker image (no test/build step)
- RAG service has an `application-dev.yaml` for local development overrides
- GigaChat SSL uses a bundled Russian root CA (`russian-root-ca.crt`), configured in `GigachatSslConfig`
- Article IDs use time-ordered UUIDs (`TimeOrderedUuidGenerator`, UUID v7) in both services
- Integration tests use Testcontainers (`postgres:15`) — no mocking of the database
- Article body is stored as raw Markdown; rendered in the frontend via `react-markdown`
