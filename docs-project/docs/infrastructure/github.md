# Monorepository

Основной репозиторий проекта: [https://github.com/Dan9191/graduation-work](https://github.com/Dan9191/graduation-work)

## Структура

Monorepo содержит:

* backend сервисы:

    * article
    * gateway
    * rag
* frontend
* документацию

## CI/CD — GitHub Actions

При каждом push в ветки `main` / `master` запускается pipeline.

### Основные этапы

#### 1. Определение изменений

Используется `paths-filter`:

* собираются только изменённые сервисы

#### 2. Тестирование

* Java сервисы — Gradle (JDK 21)
* frontend — Node.js

#### 3. Сборка

* backend: `gradlew build`
* frontend: `npm build`

#### 4. Docker сборка и публикация

* образы публикуются в `ghcr.io`
* тег: `GITHUB_SHA`

Пример:

```
ghcr.io/<repo>/article:<commit-sha>
```

## Особенности pipeline

* условный запуск jobs (только при изменениях)
* параллельная сборка сервисов
* единый registry

## Ограничения (текущее состояние)

* теги образов обновляются вручную в Kubernetes манифестах
* отсутствует автоматическая синхронизация версий

## Планируемые улучшения

* внедрение Argo CD Image Updater
* автоматическое обновление тегов образов
* полноценный GitOps flow без ручных изменений
