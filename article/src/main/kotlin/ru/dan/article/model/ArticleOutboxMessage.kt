package ru.dan.article.model

import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.annotation.JsonNaming
import ru.dan.article.entity.ArticleOutbox
import java.util.UUID

/**
 * Модель сообщения для отправки в RabbitMQ
 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy::class)
data class ArticleOutboxMessage(
    val id: UUID,
    val articleId: UUID,
    val articleName: String,
    val eventType: String,
    val body: String,
    val source: String?,
) {
    companion object {
        fun from(articleOutbox: ArticleOutbox): ArticleOutboxMessage =
            ArticleOutboxMessage(
                id = articleOutbox.id,
                articleId = articleOutbox.articleId,
                articleName = articleOutbox.articleName,
                eventType = articleOutbox.eventType,
                body = articleOutbox.body,
                source = articleOutbox.source,
            )
    }
}
