
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
**Код-стайл:**
- Для форматирования кода и проверки стиля используется [ktlint](https://ktlint.github.io/)
- Запуск проверки стиля: `./gradlew :rag:ktlintCheck`
- Автоматическое форматирование: `./gradlew :rag:ktlintFormat`
- Сборка проекта с проверкой стиля: `./gradlew :rag:build`

## Article
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
**Код-стайл:**
- Для форматирования кода и проверки стиля используется [ktlint](https://ktlint.github.io/)
- Запуск проверки стиля: `./gradlew :article:ktlintCheck`
- Автоматическое форматирование: `./gradlew :article:ktlintFormat`
- Сборка проекта с проверкой стиля: `./gradlew :article:build`