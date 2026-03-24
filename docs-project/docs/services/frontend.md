# Frontend

Frontend — это клиентское приложение, через которое пользователь взаимодействует с системой.

## Основные функции

- отображение UI
- работа с API через Gateway
- авторизация через Keycloak

## Переменные конфигурации

| Название          | Значение по умолчанию  | Описание     |
|-------------------|------------------------|--------------|
| apiUrl            | http://localhost:8033  | URL Gateway  |
| keycloak.url      | http://localhost:9090  | URL Keycloak |
| keycloak.realm    | graduation             | Realm        |
| keycloak.clientId | graduation-frontend    | Client ID    |