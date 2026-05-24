package ru.dan.article.service.outbox

import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.slf4j.MDC
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import ru.dan.article.config.ArticleProperties
import ru.dan.article.entity.ArticleOutbox
import ru.dan.article.filter.MdcWebFilter
import ru.dan.article.model.ArticleOutboxMessage
import ru.dan.article.repository.ArticleOutboxRepository
import java.util.UUID

private val logger = KotlinLogging.logger {}

@Service
class OutboxService(
    private val articleOutboxRepository: ArticleOutboxRepository,
    private val rabbitTemplate: RabbitTemplate,
    private val objectMapper: ObjectMapper,
    articleProperties: ArticleProperties,
) {
    private val maxAttempts = articleProperties.maxAttempts
    private val batchSize = articleProperties.scheduler.batchSize
    private val routingKey = articleProperties.rabbit.routingKey
    private val exchange = articleProperties.rabbit.exchange

    /**
     * Основной метод обработки: выборка записей, отправка, обновление.
     */
    fun processPendingMessages(): Mono<Void> =
        articleOutboxRepository
            .findPendingRecords(batchSize, maxAttempts)
            .flatMap { record -> processRecord(record) }
            .then()

    /**
     * Обработка одной записи. Устанавливает MDC на время выполнения реактивной цепочки.
     */
    private fun processRecord(record: ArticleOutbox): Mono<Void> {
        val operationId = record.operationId?.toString() ?: UUID.randomUUID().toString()
        val txName =
            when (record.eventType) {
                "CREATED" -> "CreateArticle"
                "UPDATED" -> "UpdateArticle"
                "DELETED" -> "DeleteArticle"
                else -> "ArticleEvent"
            }

        MDC.put("operationId", operationId)
        MDC.put("transactionName", txName)
        MDC.put("stepName", "PublishEvent")
        MDC.put("serviceName", MdcWebFilter.SERVICE_NAME)

        return sendToRabbit(record)
            .flatMap { success ->
                if (success) handleSuccess(record) else handleFailure(record)
            }.onErrorResume { handleFailure(record) }
            .doFinally {
                MDC.remove("operationId")
                MDC.remove("transactionName")
                MDC.remove("stepName")
                MDC.remove("serviceName")
            }
    }

    /**
     * Отправка в RabbitMQ (блокирующий вызов выполняется в отдельном потоке).
     */
    private fun sendToRabbit(record: ArticleOutbox): Mono<Boolean> =
        Mono
            .fromCallable {
                try {
                    val message = ArticleOutboxMessage.from(record)
                    val jsonMessage = objectMapper.writeValueAsString(message)
                    rabbitTemplate.convertAndSend(exchange, routingKey, jsonMessage)
                    logger.info { "Message successfully delivered to broker: recordId=${record.id}" }
                    true
                } catch (e: Exception) {
                    logger.warn(e) { "Broker send failed for record ${record.id}: ${e.message}" }
                    false
                }
            }.subscribeOn(Schedulers.boundedElastic())

    /**
     * Обработка успешной отправки.
     */
    private fun handleSuccess(record: ArticleOutbox): Mono<Void> {
        val newAttemptCount = record.attemptCount + 1
        return if (newAttemptCount < maxAttempts) {
            articleOutboxRepository.updateAttempt(record.id, newAttemptCount, "SENT")
        } else {
            articleOutboxRepository.markAsSent(record.id, newAttemptCount)
        }
    }

    /**
     * Обработка ошибки отправки.
     */
    private fun handleFailure(record: ArticleOutbox): Mono<Void> {
        val newAttemptCount = record.attemptCount + 1
        return if (newAttemptCount >= maxAttempts) {
            articleOutboxRepository.markAsFailed(record.id, newAttemptCount)
        } else {
            articleOutboxRepository.updateAttempt(record.id, newAttemptCount, "PENDING")
        }
    }
}
