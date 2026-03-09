
**Swagger**

Доступен при запуске

http://localhost:8057/webjars/swagger-ui/index.html#/

**Код-стайл:**
- Для форматирования кода и проверки стиля используется [ktlint](https://ktlint.github.io/)
- Запуск проверки стиля: `./gradlew ktlintCheck`
- Автоматическое форматирование: `./gradlew ktlintFormat`
- Сборка проекта с проверкой стиля: `./gradlew build`

**Анализ качества кода:**
- Для анализа качества кода, обнаружения потенциальных проблем и код-дубликатов используется [detekt](https://detekt.dev/)
- Запуск анализа: `./gradlew detekt`
- Сборка проекта с анализом качества: `./gradlew build`