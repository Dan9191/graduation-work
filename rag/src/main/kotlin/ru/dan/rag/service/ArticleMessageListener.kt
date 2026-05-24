package ru.dan.rag.service

import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.slf4j.MDC
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Component
import ru.dan.rag.filter.MdcFilter
import ru.dan.rag.model.ArticleMessage
import java.util.UUID

private val logger = KotlinLogging.logger {}

@Component
class ArticleMessageListener(
    private val articleProcessingService: ArticleProcessingService,
    private val objectMapper: ObjectMapper,
) {
    @RabbitListener(queues = ["\${app.rag.rabbit.queue}"])
    fun processMessage(message: String) {
        val startTime = System.currentTimeMillis()
        val articleMessage = objectMapper.readValue(message, ArticleMessage::class.java)

        val operationId = articleMessage.operationId?.toString() ?: UUID.randomUUID().toString()
        val (txName, stepName) = resolveOperation(articleMessage.eventType)

        MDC.put("operationId", operationId)
        MDC.put("transactionName", txName)
        MDC.put("stepName", stepName)
        MDC.put("serviceName", MdcFilter.SERVICE_NAME)

        try {
            logger.info { "Processing article id=${articleMessage.articleId}, event=${articleMessage.eventType}" }
            when (articleMessage.eventType) {
                "DELETED" -> {
                    articleProcessingService.deleteArticle(articleMessage)
                    logger.info { "Article deleted: id=${articleMessage.articleId}, took ${elapsed(startTime)}ms" }
                }
                else -> {
                    val resultId = articleProcessingService.processArticle(articleMessage)
                    logger.info { "Article processed: result=$resultId, took ${elapsed(startTime)}ms" }
                }
            }
        } catch (e: Exception) {
            logger.error(e) { "Failed to process message after ${elapsed(startTime)}ms" }
            throw e
        } finally {
            MDC.remove("operationId")
            MDC.remove("transactionName")
            MDC.remove("stepName")
            MDC.remove("serviceName")
        }
    }

    private fun resolveOperation(eventType: String): Pair<String, String> =
        when (eventType) {
            "CREATED" -> "CreateArticle" to "ProcessArticleCreation"
            "UPDATED" -> "UpdateArticle" to "ProcessArticleUpdate"
            "DELETED" -> "DeleteArticle" to "ProcessArticleDeletion"
            else -> "ArticleEvent" to "ProcessArticleEvent"
        }

    private fun elapsed(startTime: Long) = System.currentTimeMillis() - startTime
}
