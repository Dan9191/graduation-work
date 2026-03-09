package ru.dan.article.repository

import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import ru.dan.article.entity.ArticleOutbox
import java.util.*

/**
 * Реализация паттерна outbox для контроля отправки статей на векторизацию: R2dbc репозиторий.
 */
interface ArticleOutboxR2dbcRepository {
    fun insert(article: ArticleOutbox): Mono<ArticleOutbox>

    fun findPendingRecords(
        limit: Int,
        maxAttempts: Int,
    ): Flux<ArticleOutbox>

    fun markAsSent(
        id: UUID,
        newAttemptCount: Int,
    ): Mono<Void>

    fun markAsFailed(
        id: UUID,
        newAttemptCount: Int,
    ): Mono<Void>

    fun updateAttempt(
        id: UUID,
        newAttemptCount: Int,
        status: String,
    ): Mono<Void>
}
