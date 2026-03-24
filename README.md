
## GATEWAY
### Сборка
```shell
./gradlew :gateway:clean build
```

### Запуск
```shell
./gradlew :gateway:bootRun
```

## RAG
Сервис, для векторизации статей и формирования ответа.
### Тест
```shell
./gradlew :rag:test
```
### Сборка
```shell
./gradlew :rag:clean build
```

### Запуск
```shell
./gradlew :rag:bootRun
```

### Запуск проверки стиля
- Для форматирования кода и проверки стиля используется [ktlint](https://ktlint.github.io/)
```shell
./gradlew :rag:ktlintCheck
```

### Автоматическое форматирование
```shell
./gradlew :rag:ktlintFormat
```

## Article
Сервис, для хранения статей.
### Тест
```shell
./gradlew :article:test
```

### Сборка
```shell
./gradlew :article:clean build
```

### Запуск
```shell
./gradlew :article:bootRun
```

### Запуск проверки стиля
- Для форматирования кода и проверки стиля используется [ktlint](https://ktlint.github.io/)
```shell
./gradlew :article:ktlintCheck
```

### Автоматическое форматирование
```shell
./gradlew :article:ktlintFormat
```
