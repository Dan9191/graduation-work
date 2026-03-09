package ru.dan.article.repository

import reactor.core.publisher.Mono
import ru.dan.article.entity.Article

/**
 * Репозиторий для работы со статьями.
 */
interface ArticleR2dbcRepository {
    fun insert(article: Article): Mono<Article>
}
