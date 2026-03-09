package ru.dan.article.repository

import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import ru.dan.article.entity.Tag
import java.util.UUID

interface TagRepository : ReactiveCrudRepository<Tag, Long> {
    /**
     * Проверка существования тега по имени.
     */
    @Query("SELECT EXISTS(SELECT 1 FROM tag WHERE name = :name)")
    fun existsByName(name: String): Mono<Boolean>

    /**
     * Получение тегов по id статьи.
     */
    @Query(
        """
        SELECT t.id, t.name
        FROM tag t
        INNER JOIN article_tag at ON t.id = at.tag_id
        WHERE at.article_id = :articleId
    """,
    )
    fun findAllByArticleId(articleId: UUID): Flux<Tag>

    /**
     * Получение тегов по id раздела.
     */
    @Query(
        """
        SELECT t.id, t.name
        FROM tag t
        INNER JOIN article_section_tag st ON t.id = st.tag_id
        WHERE st.section_id = :sectionId
    """,
    )
    fun findAllBySectionId(sectionId: Long): Flux<Tag>
}
