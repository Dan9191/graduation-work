package ru.dan.article.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.*

/**
 * Реализация паттерна outbox для контроля отправки статей на векторизацию: сущность.
 */
@Table("article_outbox")
data class ArticleOutbox(
    @Id
    val id: UUID,
    @Column("article_id")
    val articleId: UUID,
    @Column("article_name")
    val articleName: String,
    @Column("event_type")
    val eventType: String,
    val source: String?,
    val body: String,
    /**
     * Событие для отправки: "CREATED" / "UPDATED"
     */
    val status: String = "PENDING",
    /**
     * Отправляемое сообщение ArticleMessage в виде Json
     */
    val attemptCount: Int = 0,
    val createdAt: Instant = Instant.now(),
)
