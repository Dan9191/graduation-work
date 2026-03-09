package ru.dan.article.service

import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import ru.dan.article.entity.Tag
import ru.dan.article.model.tag.TagCreateDto
import ru.dan.article.model.tag.TagDto
import ru.dan.article.repository.TagRepository

private val logger = KotlinLogging.logger {}

@Service
class TagService(
    private val tagRepository: TagRepository,
) {
    /**
     * Creates a new tag in the database.
     *
     * @param tagDto the [TagDto] entity to persist
     * @return [Mono] emitting the saved [Tag] with generated ID
     */
    @Transactional
    fun createTag(tagDto: TagCreateDto): Mono<TagDto> {
        logger.debug("Started to create tag")
        val trimmedName = tagDto.name.trim()

        if (trimmedName.isEmpty()) {
            return Mono.error(IllegalArgumentException("Tag name cannot be empty after trimming"))
        }

        return tagRepository
            .existsByName(trimmedName)
            .flatMap { exists ->
                if (exists) {
                    Mono.error(IllegalArgumentException("Tag with name '$trimmedName' already exists"))
                } else {
                    val tag = Tag(id = null, name = trimmedName)
                    tagRepository
                        .save(tag)
                        .map { savedTag -> TagDto(id = savedTag.id, name = savedTag.name) }
                }
            }.doOnSuccess { dto -> logger.debug("Tag created successfully: id=${dto!!.id}") }
            .doOnError { error -> logger.debug("Failed to create tag: ${error.message}") }
    }

    /**
     * Retrieves all tags from the database.
     *
     * @return [Flux] emitting all [TagDto] entities
     */
    @Transactional
    fun getAllTags(): Flux<TagDto> {
        logger.info { "Fetching all tags" }
        return tagRepository
            .findAll()
            .map { entity ->
                TagDto(
                    id = entity.id,
                    name = entity.name,
                )
            }.doOnError { e -> logger.debug(e) { "Error fetching tags" } }
    }

    /**
     * Retrieves a tag by its unique identifier.
     *
     * @param idStr the ID of the tag to retrieve
     * @return [Mono] emitting the [TagDto] if found, or empty if not
     */
    @Transactional
    fun getTagById(idStr: String): Mono<TagDto> {
        logger.info { "Fetching tag by id: $idStr" }

        val id =
            try {
                idStr.toLong()
            } catch (e: NumberFormatException) {
                logger.debug { "Invalid ID format: '$idStr'" }
                throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ID format")
            }

        if (id <= 0) {
            logger.debug { "ID must be positive: $id" }
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "ID must be positive")
        }

        logger.info { "Fetching tag by id: $id" }
        return tagRepository
            .findById(id)
            .map { entity ->
                TagDto(
                    id = entity.id,
                    name = entity.name,
                )
            }.doOnError { e -> logger.error(e) { "Error fetching tag by id: $id-" } }
    }

    /**
     * Retrieves a tag by its unique identifier.
     *
     * @param idStr the ID of the tag to retrieve
     * @return [Mono] emitting the [TagDto] if found, or empty if not
     */
    @Transactional
    fun deleteTag(id: Long): Mono<Void> = tagRepository.deleteById(id)
}
