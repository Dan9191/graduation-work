package ru.dan.article.service

import mu.KotlinLogging
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Mono
import ru.dan.article.entity.Article
import ru.dan.article.entity.ArticleOutbox
import ru.dan.article.model.article.ArticleViewDto
import ru.dan.article.model.article.CreateArticleDto
import ru.dan.article.model.article.PagedShortArticles
import ru.dan.article.model.article.ShortArticleDto
import ru.dan.article.model.article.UpdateArticleRequestDto
import ru.dan.article.model.section.ShortSectionDto
import ru.dan.article.model.tag.TagDto
import ru.dan.article.repository.ArticleOutboxRepository
import ru.dan.article.repository.ArticleRepository
import ru.dan.article.repository.SectionRepository
import ru.dan.article.repository.TagRepository
import java.time.Instant
import java.util.*

private val logger = KotlinLogging.logger {}

/**
 * Сервис работы со статьями
 */
@Suppress("NAME_SHADOWING")
@Service
class ArticleService(
    private val articleRepository: ArticleRepository,
    private val outboxRepository: ArticleOutboxRepository,
    private val sectionRepository: SectionRepository,
    private val tagRepository: TagRepository,
    private val uuidGenerator: TimeOrderedUuidGenerator,
) {
    /**
     * Поиск статьи по id.
     * @param id идентификатор статьи
     * @return Mono<[ArticleViewDto]> — либо статья, либо пустой Mono, если не найдено
     */
    @Transactional
    fun getArticleById(id: UUID): Mono<ArticleViewDto> =
        articleRepository
            .findById(id)
            .switchIfEmpty(Mono.error(ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found")))
            .flatMap { article ->
                articleRepository
                    .incrementViewCount(id)
                    .then(
                        Mono.zip(
                            tagRepository
                                .findAllByArticleId(article.id!!)
                                .map { TagDto(it.id!!, it.name) }
                                .collectList(),
                            sectionRepository
                                .findById(article.sectionId)
                                .map { ShortSectionDto(it.id, it.name) }
                                .defaultIfEmpty(ShortSectionDto(null, "—")),
                        ),
                    ).map { tuple ->
                        val tags = tuple.t1
                        val sectionDto = tuple.t2

                        ArticleViewDto(
                            id = id,
                            title = article.title,
                            description = article.description,
                            mainPicture = article.mainPicture,
                            source = article.source,
                            body = article.body,
                            createdAt = article.createdAt,
                            updatedAt = article.updatedAt,
                            viewCount = article.viewCount + 1,
                            section = sectionDto,
                            tags = tags,
                        )
                    }
            }

    @Transactional
    fun deleteArticle(id: UUID): Mono<Void> = articleRepository.deleteById(id)

    @Transactional
    fun createArticle(dto: CreateArticleDto): Mono<ArticleViewDto> {
        val article =
            Article(
                id = uuidGenerator.generateUUID(),
                title = dto.title.trim(),
                description = dto.description.trim(),
                mainPicture = dto.mainPicture.trim(),
                source = dto.source?.trim() ?: "",
                body = dto.body.trim(),
                createdAt = Instant.now(),
                updatedAt = Instant.now(),
                viewCount = 0,
                sectionId = dto.sectionId,
            )

        return articleRepository
            .insert(article)
            .flatMap { saved ->
                val outbox =
                    ArticleOutbox(
                        id = uuidGenerator.generateUUID(),
                        articleId = saved.id!!,
                        articleName = saved.title.trim(),
                        eventType = "CREATED",
                        body = saved.body.trim(),
                        source = saved.source,
                        status = "PENDING",
                        attemptCount = 0,
                        createdAt = Instant.now(),
                    )

                outboxRepository
                    .insert(outbox)
                    .then(Mono.just(saved))
            }.flatMap { saved ->
                val tagIds = dto.tags.toSet()

                val tagsMono =
                    if (tagIds.isEmpty()) {
                        Mono.just(emptyList())
                    } else {
                        tagRepository
                            .findAllById(tagIds)
                            .collectList()
                            .flatMap { existingTags ->
                                if (existingTags.size != tagIds.size) {
                                    Mono.error(
                                        ResponseStatusException(HttpStatus.BAD_REQUEST, "Some tag ids do not exist"),
                                    )
                                } else {
                                    articleRepository
                                        .linkTagsToArticle(
                                            saved.id!!,
                                            tagIds.toTypedArray(),
                                        ).then(Mono.just(existingTags))
                                }
                            }
                    }

                val sectionDto =
                    sectionRepository
                        .findById(article.sectionId)
                        .map { ShortSectionDto(it.id, it.name) }
                        .defaultIfEmpty(ShortSectionDto(null, "—"))

                Mono
                    .zip(tagsMono, sectionDto)
                    .map { tuple ->
                        val tags = tuple.t1
                        val sectionDto = tuple.t2
                        ArticleViewDto(
                            id = saved.id!!,
                            title = saved.title,
                            description = saved.description,
                            mainPicture = saved.mainPicture,
                            source = saved.source,
                            body = saved.body,
                            createdAt = saved.createdAt,
                            updatedAt = saved.updatedAt,
                            viewCount = saved.viewCount,
                            section = sectionDto,
                            tags = tags.map { TagDto(it.id!!, it.name) },
                        )
                    }
            }.doOnSuccess { a -> logger.debug("Article created successfully: id={}", a!!.id) }
            .doOnError { e -> logger.warn("Failed to create article: {}", e.message) }
    }

    @Transactional
    fun updateArticle(
        id: UUID,
        request: UpdateArticleRequestDto,
    ): Mono<ArticleViewDto> =
        articleRepository
            .findById(id)
            .switchIfEmpty(Mono.error(ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found")))
            .flatMap { existing ->
                val outbox =
                    ArticleOutbox(
                        id = uuidGenerator.generateUUID(),
                        articleId = id,
                        articleName = request.title.trim(),
                        eventType = "UPDATED",
                        body = request.body.trim(),
                        source = request.source,
                        status = "PENDING",
                        attemptCount = 0,
                        createdAt = Instant.now(),
                    )

                outboxRepository
                    .insert(outbox)
                    .then(Mono.just(existing))
            }.flatMap { existing ->
                val updatedArticle =
                    existing.copy(
                        title = request.title.trim(),
                        description = request.description.trim(),
                        mainPicture = request.mainPicture.trim(),
                        source = request.source?.trim() ?: existing.source,
                        body = request.body.trim(),
                        sectionId = request.sectionId,
                        updatedAt = Instant.now(),
                    )

                articleRepository
                    .save(updatedArticle)
                    .then(
                        Mono.defer {
                            val newTagIds = request.tags.toSet()
                            articleRepository
                                .deleteArticleTagRelations(id)
                                .then(
                                    if (newTagIds.isNotEmpty()) {
                                        tagRepository
                                            .findAllById(newTagIds)
                                            .collectList()
                                            .flatMap { foundTags ->
                                                if (foundTags.size != newTagIds.size) {
                                                    Mono.error(
                                                        ResponseStatusException(
                                                            HttpStatus.BAD_REQUEST,
                                                            "One or more tag IDs do not exist",
                                                        ),
                                                    )
                                                } else {
                                                    articleRepository.linkTagsToArticle(
                                                        id,
                                                        newTagIds.toTypedArray(),
                                                    )
                                                }
                                            }
                                    } else {
                                        Mono.empty()
                                    },
                                )
                        },
                    ).then(
                        Mono.zip(
                            tagRepository
                                .findAllByArticleId(id)
                                .map { TagDto(it.id!!, it.name) }
                                .collectList(),
                            sectionRepository
                                .findById(updatedArticle.sectionId)
                                .map { ShortSectionDto(it.id!!, it.name) }
                                .defaultIfEmpty(ShortSectionDto(null, "—")),
                        ),
                    ).map { tuple ->
                        val tags = tuple.t1
                        val sectionDto = tuple.t2

                        ArticleViewDto(
                            id = updatedArticle.id!!,
                            title = updatedArticle.title,
                            description = updatedArticle.description,
                            mainPicture = updatedArticle.mainPicture,
                            source = updatedArticle.source,
                            body = updatedArticle.body,
                            createdAt = updatedArticle.createdAt,
                            updatedAt = updatedArticle.updatedAt,
                            viewCount = updatedArticle.viewCount,
                            section = sectionDto,
                            tags = tags,
                        )
                    }
            }.doOnSuccess { a -> logger.debug("Article updated successfully: id={}", a!!.id) }
            .doOnError { e -> logger.warn("Failed to update article id={}: {}", id, e.message) }

    @Transactional(readOnly = true)
    fun getArticlesPaged(
        page: Int = 0,
        size: Int = 20,
        sortBy: String = "createdAt",
        direction: Sort.Direction = Sort.Direction.DESC,
    ): Mono<PagedShortArticles> {
        val pageable = PageRequest.of(page, size, Sort.by(direction, sortBy))

        return Mono
            .zip(
                articleRepository
                    .findAllBy(pageable)
                    .flatMap { article ->
                        Mono
                            .zip(
                                tagRepository
                                    .findAllByArticleId(article.id!!)
                                    .map { TagDto(it.id!!, it.name) }
                                    .collectList(),
                                sectionRepository
                                    .findById(article.sectionId)
                                    .map { ShortSectionDto(it.id!!, it.name) }
                                    .defaultIfEmpty(ShortSectionDto(null, "—")),
                            ).map { tuple ->
                                val tags = tuple.t1
                                val sectionDto = tuple.t2

                                ShortArticleDto(
                                    id = article.id,
                                    mainPicture = article.mainPicture,
                                    title = article.title,
                                    description = article.description,
                                    tags = tags,
                                    section = sectionDto,
                                    createdAt = article.createdAt,
                                )
                            }
                    }.collectList(),
                articleRepository.countAll(),
            ).map { tuple ->
                val articles = tuple.t1
                val total = tuple.t2
                val totalPages = if (size > 0) ((total + size - 1) / size).toInt() else 0

                PagedShortArticles(
                    content = articles,
                    page = page,
                    size = size,
                    totalElements = total,
                    totalPages = totalPages,
                    last = page >= totalPages - 1 || articles.isEmpty(),
                )
            }
    }
}
