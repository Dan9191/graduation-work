# Frontend

React SPA — клиентское приложение базы знаний. Общается с бэкендом через Gateway, авторизуется через Keycloak.

## Технологии

- **React 19**, React Router 7
- **TanStack Query 5** — серверное состояние и кэширование
- **Keycloak-js 26** — OIDC аутентификация
- **Axios** — HTTP-клиент
- **STOMP / SockJS** — WebSocket
- **react-markdown** — рендеринг Markdown-контента статей

## Страницы

| Страница             | Описание                          |
|----------------------|-----------------------------------|
| `ArticlesPage`       | Список статей с фильтрацией       |
| `ArticlePage`        | Просмотр статьи                   |
| `CreateArticlePage`  | Создание статьи                   |
| `EditArticlePage`    | Редактирование статьи             |
| `SectionsPage`       | Управление разделами              |
| `TagsPage`           | Управление тегами                 |
| `VectorSearchPage`   | Семантический RAG-поиск           |

## Команды

```shell
npm ci              # установка зависимостей
npm start           # dev-сервер (http://localhost:3000)
npm test            # тесты
npm run build       # production-сборка в build/
```

## Конфигурация

Параметры подключения задаются в `public/config.json` (загружается в runtime, не зашита в сборку):

```json
{
  "apiUrl": "http://localhost:8033",
  "keycloak": {
    "url": "http://localhost:9090",
    "realm": "graduation",
    "clientId": "graduation-frontend"
  }
}
```

| Параметр            | По умолчанию            | Описание             |
|---------------------|-------------------------|----------------------|
| `apiUrl`            | `http://localhost:8033` | URL Gateway          |
| `keycloak.url`      | `http://localhost:9090` | URL Keycloak         |
| `keycloak.realm`    | `graduation`            | Realm                |
| `keycloak.clientId` | `graduation-frontend`   | Client ID            |
