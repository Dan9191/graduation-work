package ru.dan.rag.service

import mu.KotlinLogging
import org.springframework.stereotype.Service
import ru.dan.rag.client.GigachatModelsClient

private val logger = KotlinLogging.logger {}

/**
 * Сервис формирования читаемого ответа.
 */
@Service
class LlmService(
    private val gigachatModelsClient: GigachatModelsClient,
) {
    fun generateResponse(
        query: String,
        context: String,
    ): String {
        val startTime = System.currentTimeMillis()
        logger.info { "Generating LLM response for query: $query" }
        val messages =
            listOf(
                GigachatModelsClient.Message(
                    role = "system",
                    content =
                        """
                        Ты — RAG ассистент.
                        Используй только переданный контекст.
                        Если ответа в переданном контексте нет — напиши "Информация отсутствует".
                        Ответ должен быть на русском языке.
                        Форматируй ответ в Markdown.
                        """.trimIndent(),
                ),
                GigachatModelsClient.Message(
                    role = "user",
                    content =
                        """
                        Контекст:
                        $context
                        
                        Вопрос:
                        $query
                        """.trimIndent(),
                ),
            )

        val result = gigachatModelsClient.generateText(messages)
            ?: "Ошибка генерации ответа"
        logger.info { "LLM response generated, took ${System.currentTimeMillis() - startTime}ms" }
        return result
    }
}
