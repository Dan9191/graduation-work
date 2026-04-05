package ru.dan.article.service

import mu.KotlinLogging
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import reactor.core.publisher.Mono
import ru.dan.article.entity.Section
import ru.dan.article.model.section.CreateSectionDto
import ru.dan.article.model.section.ParentSectionDto
import ru.dan.article.model.section.SectionTreeDto
import ru.dan.article.model.section.SectionViewDto
import ru.dan.article.model.section.UpdateSectionRequestDto
import ru.dan.article.repository.SectionRepository

private val logger = KotlinLogging.logger {}

/**
 * Сервис работы с секциями.
 */
@Service
class SectionService(
    private val sectionRepository: SectionRepository,
) {
    /**
     * Поиск секции по id.
     *
     * @param id идентификатор секции
     * @return Mono<SectionViewDto> — либо секция, либо пустой Mono, если не найдено
     */
    @Transactional
    fun getSectionById(id: Long): Mono<SectionViewDto> =
        sectionRepository
            .findById(id)
            .flatMap { section ->
                when (section.parentId) {
                    null -> Mono.just(section to null)
                    else ->
                        sectionRepository
                            .findById(section.parentId)
                            .map { parent -> section to parent as Section? }
                            .defaultIfEmpty(section to null)
                }
            }.map { (section, parent) ->
                SectionViewDto(
                    id = section.id,
                    name = section.name,
                    description = section.description,
                    parent =
                        parent?.let { p ->
                            ParentSectionDto(
                                id = p.id!!,
                                name = p.name,
                            )
                        },
                )
            }

    /**
     * Построение дерева секций.
     */
    @Transactional
    fun getSectionTree(): Mono<List<SectionTreeDto>> =
        sectionRepository
            .findAll()
            .collectList()
            .map { sections -> buildTree(sections) }

    private fun buildTree(sections: List<Section>): List<SectionTreeDto> {
        val byParent = sections.groupBy { it.parentId }

        fun build(parentId: Long?): List<SectionTreeDto> =
            byParent[parentId]
                ?.map { section ->
                    SectionTreeDto(
                        id = section.id!!,
                        name = section.name,
                        description = section.description,
                        children = build(section.id),
                    )
                }
                ?: emptyList()

        return build(null)
    }

    /**
     * Создание секции.
     */
    @Transactional
    fun createSection(request: CreateSectionDto): Mono<SectionTreeDto> {
        val parentCheck: Mono<Boolean> =
            request.parentId
                ?.let { sectionRepository.existsById(it) }
                ?: Mono.just(true)

        return parentCheck
            .flatMap { parentExists ->
                if (!parentExists) {
                    Mono.error(
                        IllegalArgumentException("Parent section not found: ${request.parentId}"),
                    )
                } else {
                    sectionRepository.existsByParentIdAndName(request.parentId, request.name)
                }
            }.flatMap { exists ->
                if (exists) {
                    Mono.error(
                        IllegalStateException("Section with name '${request.name}' already exists"),
                    )
                } else {
                    sectionRepository.save(
                        Section(
                            name = request.name,
                            description = request.description,
                            parentId = request.parentId,
                        ),
                    )
                }
            }.map { saved ->
                SectionTreeDto(
                    id = saved.id!!,
                    name = saved.name,
                    description = saved.description,
                    children = emptyList(),
                )
            }
    }

    /**
     * Удаление секции.
     */
    @Transactional
    fun deleteSection(id: Long): Mono<Void> =
        sectionRepository
            .findById(id)
            .switchIfEmpty(Mono.error(NoSuchElementException("Section not found: $id")))
            .flatMap {
                sectionRepository
                    .findAllByParentId(id)
                    .hasElements()
                    .flatMap { hasChildren ->
                        if (hasChildren) {
                            Mono.error(IllegalStateException("Cannot delete section with children"))
                        } else {
                            sectionRepository.deleteById(id)
                        }
                    }
            }

    /**
     * Обновление секции.
     */
    @Transactional
    fun updateSection(
        id: Long,
        request: UpdateSectionRequestDto,
    ): Mono<SectionViewDto> {
        logger.info("Start of section update ID: {}", id)

        return sectionRepository
            .findById(id)
            .flatMap { existingSection ->
                sectionRepository
                    .existsByParentIdAndName(request.parentId, request.name)
                    .flatMap { exists ->
                        if (exists && (existingSection.name != request.name || existingSection.parentId != request.parentId)) {
                            logger.error(
                                "Section with the name'{}' already exists in the parent section ID: {}",
                                request.name,
                                request.parentId,
                            )
                            Mono.error(IllegalArgumentException("Секция с таким именем уже существует в указанной родительской секции"))
                        } else {
                            if (request.parentId != null && request.parentId != existingSection.parentId) {
                                sectionRepository
                                    .existsById(request.parentId)
                                    .flatMap { parentExists ->
                                        if (!parentExists) {
                                            logger.error("Parent section ID: {} not found", request.parentId)
                                            Mono.error(IllegalArgumentException("Родительская секция с ID ${request.parentId} не найдена"))
                                        } else {
                                            updateAndSaveSection(existingSection, request)
                                        }
                                    }
                            } else {
                                updateAndSaveSection(existingSection, request)
                            }
                        }
                    }
            }.flatMap { updatedSection ->
                logger.debug("Section updated successfully: {}", updatedSection)
                if (updatedSection.parentId != null) {
                    sectionRepository
                        .findById(updatedSection.parentId)
                        .map { parent ->
                            SectionViewDto(
                                id = updatedSection.id,
                                name = updatedSection.name,
                                description = updatedSection.description,
                                parent =
                                    ParentSectionDto(
                                        id = parent.id!!,
                                        name = parent.name,
                                    ),
                            )
                        }
                } else {
                    Mono.just(
                        SectionViewDto(
                            id = updatedSection.id,
                            name = updatedSection.name,
                            description = updatedSection.description,
                            parent = null,
                        ),
                    )
                }
            }.doOnError { error ->
                logger.error("Error updating section with ID: {}: {}", id, error.message)
            }
    }

    /**
     * Сохранение секции.
     */

    private fun updateAndSaveSection(
        existingSection: Section,
        request: UpdateSectionRequestDto,
    ): Mono<Section> {
        logger.debug("Updating section ${existingSection.id}")

        val updatedSection =
            Section(
                id = existingSection.id,
                name = request.name,
                description = request.description ?: existingSection.description,
                parentId = request.parentId,
            )

        return sectionRepository.save(updatedSection)
    }
}
