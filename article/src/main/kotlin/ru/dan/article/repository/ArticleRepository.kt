package ru.dan.article.repository

import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import ru.dan.article.entity.Article
import java.util.UUID

interface ArticleRepository :
    ReactiveCrudRepository<Article, UUID>,
    ArticleR2dbcRepository {
    @Query(
        """
    INSERT INTO article_tag (article_id, tag_id)
    SELECT :articleId, t.id
    FROM unnest(:tagIds::bigint[]) AS ids(id)
    JOIN tag t ON t.id = ids.id
    ON CONFLICT DO NOTHING
""",
    )
    fun linkTagsToArticle(
        articleId: UUID,
        tagIds: Array<Long>,
    ): Mono<Void>

    @Query("UPDATE article SET view_count = view_count + 1 WHERE id = :id")
    fun incrementViewCount(id: UUID): Mono<Void>

    @Query("DELETE FROM article_tag WHERE article_id = :articleId")
    fun deleteArticleTagRelations(articleId: UUID): Mono<Void>

    @Query(
        """
    SELECT DISTINCT a.*
    FROM article a
    LEFT JOIN article_tag at ON at.article_id = a.id
    WHERE (:sectionId IS NULL OR a.section_id = :sectionId)
      AND (:tagId IS NULL OR at.tag_id = :tagId)
    ORDER BY created_at DESC
    LIMIT :limit OFFSET :offset
    """,
    )
    fun findFiltered(
        sectionId: Long?,
        tagId: Long?,
        limit: Int,
        offset: Long,
    ): Flux<Article>

    @Query(
        """
    SELECT COUNT(DISTINCT a.id)
    FROM article a
    LEFT JOIN article_tag at ON at.article_id = a.id
    WHERE (:sectionId IS NULL OR a.section_id = :sectionId)
      AND (:tagId IS NULL OR at.tag_id = :tagId)
    """,
    )
    fun countFiltered(
        sectionId: Long?,
        tagId: Long?,
    ): Mono<Long>
}
