package ru.dan.rag.repository

import org.springframework.data.repository.CrudRepository
import ru.dan.rag.entity.Article
import java.util.UUID

/**
 * Репозиторий для работы со статьями.
 */
interface ArticleRepository :
    CrudRepository<Article, UUID>,
    ArticleJdbcRepository {
    fun findByExternalArticleId(externalArticleId: String): Article?
}
