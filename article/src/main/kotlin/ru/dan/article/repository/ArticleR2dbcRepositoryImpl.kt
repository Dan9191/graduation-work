package ru.dan.article.repository

import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono
import ru.dan.article.entity.Article

/**
 * Реализация методов для работы со статьями.
 */
@Repository
class ArticleR2dbcRepositoryImpl(
    private val databaseClient: DatabaseClient,
) : ArticleR2dbcRepository {
    override fun insert(article: Article): Mono<Article> =
        databaseClient
            .sql(
                """
                INSERT INTO article (
                    id,
                    title,
                    description,
                    main_picture,
                    source,
                    body,
                    created_at,
                    updated_at,
                    view_count,
                    section_id
                ) VALUES (
                    :id, :title, :description, :mainPicture, :source,
                    :body, :createdAt, :updatedAt, :viewCount, :sectionId
                )
                """.trimIndent(),
            ).bindValues(
                mapOf(
                    "id" to article.id,
                    "title" to article.title,
                    "description" to article.description,
                    "mainPicture" to article.mainPicture,
                    "source" to article.source,
                    "body" to article.body,
                    "createdAt" to article.createdAt,
                    "updatedAt" to article.updatedAt,
                    "viewCount" to article.viewCount,
                    "sectionId" to article.sectionId,
                ),
            ).fetch()
            .rowsUpdated()
            .thenReturn(article)
}
