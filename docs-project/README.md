# Документация

Сайт документации проекта на базе VitePress. Содержит описание архитектуры, сервисов, инфраструктуры и пользовательских сценариев.

## Структура

```
docs/
├── index.md          # Главная страница
├── architecture/     # Архитектура системы
├── services/         # Описание сервисов
├── infrastructure/   # Инфраструктура и деплой
├── project/          # Общее описание проекта
└── user-story/       # Пользовательские сценарии
```

## Команды

```shell
npm install              # установка зависимостей
npm run docs:dev         # dev-сервер (http://localhost:5173)
npm run docs:build       # production-сборка в .vitepress/dist/
npm run docs:preview     # превью production-сборки
```
