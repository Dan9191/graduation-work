### 1. Инициализация проекта
### Команды для создания, выполняемые из корня проекта
### `npx create-react-app graduation-frontend`
### `cd graduation-frontend`
### `npm install axios keycloak-js @tanstack/react-query`
### `npm install -D tailwindcss@3 postcss@8 autoprefixer@10`
### `npx tailwindcss init -p`
### `npm install sockjs-client @stomp/stompjs`
### `npm install react-markdown`
### `npm start`

# Frontend

Frontend — это клиентское приложение, через которое пользователь взаимодействует с системой.

## Основные функции

- отображение UI
- работа с API через Gateway
- авторизация через Keycloak

## Переменные конфигурации

| Название          | Значение по умолчанию   | Описание     |
|-------------------|-------------------------|--------------|
| apiUrl            | `http://localhost:8033` | URL Gateway  |
| keycloak.url      | `http://localhost:9090` | URL Keycloak |
| keycloak.realm    | graduation              | Realm        |
| keycloak.clientId | graduation-frontend     | Client ID    |