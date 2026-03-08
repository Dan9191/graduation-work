## RAG
### Сборка
```shell
./gradlew :rag:clean build
```

### Запуск
```shell
./gradlew :rag:bootRun
```
**Код-стайл:**
- Для форматирования кода и проверки стиля используется [ktlint](https://ktlint.github.io/)
- Запуск проверки стиля: `./gradlew :rag:ktlintCheck`
- Автоматическое форматирование: `./gradlew :rag:ktlintFormat`
- Сборка проекта с проверкой стиля: `./gradlew :rag:build`

## Service-redis
### Сборка
```shell
./gradlew :service-redis:clean build
```

### Запуск
```shell
./gradlew :service-redis:bootRun