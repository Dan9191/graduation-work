package ru.dan.article.repository

import org.springframework.data.repository.reactive.ReactiveCrudRepository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import ru.dan.article.entity.Section

interface SectionRepository : ReactiveCrudRepository<Section, Long> {
    fun existsByParentIdAndName(
        parentId: Long?,
        name: String,
    ): Mono<Boolean>

    fun findAllByParentId(parentId: Long?): Flux<Section>
}
