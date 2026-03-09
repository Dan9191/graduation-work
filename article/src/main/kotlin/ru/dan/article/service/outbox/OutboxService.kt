package ru.dan.article.service.outbox

import com.fasterxml.jackson.databind.ObjectMapper
import mu.KotlinLogging
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import ru.dan.article.config.OutboxProperties
import ru.dan.article.entity.ArticleOutbox
import ru.dan.article.model.ArticleOutboxMessage
import ru.dan.article.repository.ArticleOutboxRepository

private val logger = KotlinLogging.logger {}

@Service
class OutboxService(
    private val articleOutboxRepository: ArticleOutboxRepository,
    private val rabbitTemplate: RabbitTemplate,
    private val objectMapper: ObjectMapper,
    outboxProperties: OutboxProperties,
) {
    private val maxAttempts = outboxProperties.maxAttempts
    private val batchSize = outboxProperties.scheduler.batchSize
    private val routingKey = outboxProperties.rabbit.routingKey
    private val exchange = outboxProperties.rabbit.exchange

    /**
     * Основной метод обработки: выборка записей, отправка, обновление.
     */
    fun processPendingMessages(): Mono<Void> =
        articleOutboxRepository
            .findPendingRecords(batchSize, maxAttempts)
            .flatMap { record -> processRecord(record) }
            .then()

    /**
     * Обработка одной записи.
     */
    private fun processRecord(record: ArticleOutbox): Mono<Void> =
        sendToRabbit(record)
            .flatMap { success ->
                if (success) {
                    handleSuccess(record)
                } else {
                    handleFailure(record)
                }
            }.onErrorResume { handleFailure(record) }

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
