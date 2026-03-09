package ru.dan.article.model.topic

import com.fasterxml.jackson.annotation.JsonProperty

/**
 * Модель статьи для записи в брокера.
 */
data class ArticleMessage(
    @JsonProperty("message_id")
    val messageId: String,
    @JsonProperty("article_outbox_id")
    val articleOutboxId: String,
    @JsonProperty("content")
    val content: String,
    @JsonProperty("status")
    val status: String,
    @JsonProperty("metadata")
    val metadata: String,
)
