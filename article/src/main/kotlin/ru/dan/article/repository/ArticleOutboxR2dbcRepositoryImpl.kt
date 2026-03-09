package ru.dan.article.repository

import org.springframework.r2dbc.core.DatabaseClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import ru.dan.article.entity.ArticleOutbox
import java.time.Instant
import java.util.*

/**
 * Реализация паттерна outbox для контроля отправки статей на векторизацию: R2dbc репозиторий.
 */
class ArticleOutboxR2dbcRepositoryImpl(
    private val databaseClient: DatabaseClient,
) : ArticleOutboxR2dbcRepository {
    override fun insert(article: ArticleOutbox): Mono<ArticleOutbox> =
        databaseClient
            .sql(
                """
                INSERT INTO article_outbox (
                    id,
                    article_id,
                    article_name,
                    event_type,
                    status, 
                    body,
                    source,
                    attempt_count,
                    created_at
                ) VALUES (
                    :id, :articleId, :articleName, :eventType, :status,
                    :body, :source, :attemptCount, :createdAt
                )
                """.trimIndent(),
            ).bindValues(
                mapOf(
                    "id" to article.id,
                    "articleId" to article.articleId,
                    "articleName" to article.articleName,
                    "eventType" to article.eventType,
                    "status" to article.status,
                    "body" to article.body,
                    "source" to article.source,
                    "attemptCount" to article.attemptCount,
                    "createdAt" to article.createdAt,
                ),
            ).fetch()
            .rowsUpdated()
            .thenReturn(article)

    override fun findPendingRecords(
        limit: Int,
        maxAttempts: Int,
    ): Flux<ArticleOutbox> =
        databaseClient
            .sql(
                """
                SELECT id, article_id, article_name, event_type, status, body, 
                       source, attempt_count, created_at, updated_at
                FROM article_outbox
                WHERE status = 'PENDING' AND attempt_count < :maxAttempts
                ORDER BY created_at
                LIMIT :limit
                FOR UPDATE SKIP LOCKED
                """.trimIndent(),
            ).bind("maxAttempts", maxAttempts)
            .bind("limit", limit)
            .map { row, _ ->
                ArticleOutbox(
                    id = row.get("id", UUID::class.java)!!,
                    articleId = row.get("article_id", UUID::class.java)!!,
                    articleName = row.get("article_name", String::class.java)!!,
                    eventType = row.get("event_type", String::class.java)!!,
                    status = row.get("status", String::class.java)!!,
                    body = row.get("body", String::class.java)!!,
                    source = row.get("source", String::class.java)!!,
                    attemptCount = row.get("attempt_count", Int::class.java)!!,
                    createdAt = row.get("created_at", Instant::class.java)!!,
                )
            }.all()

    override fun markAsSent(
        id: UUID,
        newAttemptCount: Int,
    ): Mono<Void> =
        databaseClient
            .sql(
                """
                UPDATE article_outbox
                SET status = 'SENT',
                    attempt_count = :attemptCount,
                    updated_at = :updatedAt
                WHERE id = :id
                """.trimIndent(),
            ).bind("id", id)
            .bind("attemptCount", newAttemptCount)
            .bind("updatedAt", Instant.now())
            .fetch()
            .rowsUpdated()
            .then()

    override fun markAsFailed(
        id: UUID,
        newAttemptCount: Int,
    ): Mono<Void> =
        databaseClient
            .sql(
                """
                UPDATE article_outbox
                SET status = 'FAILED',
                    attempt_count = :attemptCount,
                    updated_at = :updatedAt
                WHERE id = :id
                """.trimIndent(),
            ).bind("id", id)
            .bind("attemptCount", newAttemptCount)
            .bind("updatedAt", Instant.now())
            .fetch()
            .rowsUpdated()
            .then()

    override fun updateAttempt(
        id: UUID,
        newAttemptCount: Int,
        status: String,
    ): Mono<Void> =
        databaseClient
            .sql(
                """
                UPDATE article_outbox
                SET status = :status,
                    attempt_count = :attemptCount,
                    updated_at = :updatedAt
                WHERE id = :id
                """.trimIndent(),
            ).bind("id", id)
            .bind("status", status)
            .bind("attemptCount", newAttemptCount)
            .bind("updatedAt", Instant.now())
            .fetch()
            .rowsUpdated()
            .then()
}
