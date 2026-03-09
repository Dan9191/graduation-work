package ru.dan.article.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import ru.dan.article.model.article.ArticleViewDto
import ru.dan.article.model.section.CreateSectionDto
import ru.dan.article.model.section.SectionTreeDto
import ru.dan.article.model.section.SectionViewDto
import ru.dan.article.model.section.UpdateSectionRequestDto
import ru.dan.article.service.SectionService

@RestController
@RequestMapping("/api/v1/sections")
@Tag(name = "sections", description = "Контроллер для работы с секциями")
class SectionController(
    private val sectionService: SectionService,
) {
    @Operation(summary = "Поиск секции по id")
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Section found",
                content = [Content(schema = Schema(implementation = ArticleViewDto::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Section not found",
                content = [Content()],
            ),
        ],
    )
    @GetMapping("/{id}")
    fun getSection(
        @PathVariable id: Long,
    ): Mono<ResponseEntity<SectionViewDto>> =
        sectionService
            .getSectionById(id)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())

    @Operation(summary = "Получение дерева секций")
    @GetMapping("/tree")
    fun getSectionTree(): Mono<List<SectionTreeDto>> = sectionService.getSectionTree()

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создание секции")
    fun createSection(
        @RequestBody request: CreateSectionDto,
    ): Mono<SectionTreeDto> = sectionService.createSection(request)

    @DeleteMapping("/{id}")
    @Operation(summary = "Удаление секции")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @PathVariable id: Long,
    ): Mono<Void> = sectionService.deleteSection(id)

    @PutMapping("/{id}")
    @Operation(summary = "Обновление секции")
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Section found",
                content = [Content(schema = Schema(implementation = ArticleViewDto::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Section not found",
                content = [Content()],
            ),
        ],
    )
    fun update(
        @PathVariable id: Long,
        @RequestBody request: UpdateSectionRequestDto,
    ): Mono<ResponseEntity<SectionViewDto>> =
        sectionService
            .updateSection(id, request)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())
}
