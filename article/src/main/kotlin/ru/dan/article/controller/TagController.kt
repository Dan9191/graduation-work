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
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import ru.dan.article.model.tag.TagCreateDto
import ru.dan.article.model.tag.TagDto
import ru.dan.article.service.TagService

@RestController
@RequestMapping("/api/v1/tags")
@Tag(name = "tag", description = "Operations related to Tag")
class TagController(
    private val tagService: TagService,
) {
    @PostMapping
    @Operation(summary = "Create new tag")
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "201",
                description = "Tag created successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = TagDto::class))],
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid request body or name is blank",
                content = [Content(mediaType = "application/json")],
            ),
        ],
    )
    fun createTag(
        @RequestBody dto: TagCreateDto,
    ): Mono<TagDto> = tagService.createTag(dto)

    @Operation(
        summary = "Get all tags",
        description = "Returns a stream of all tags in the system.",
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved list of tags",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = TagDto::class))],
            ),
        ],
    )
    @GetMapping
    fun getAllTags(): Flux<TagDto> = tagService.getAllTags()

    @Operation(summary = "Get tag by ID")
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Tag found successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = TagDto::class))],
            ),
            ApiResponse(
                responseCode = "400",
                content = [Content(mediaType = "application/json")],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Tag with specified ID not found",
                content = [Content(mediaType = "application/json")],
            ),
        ],
    )
    @GetMapping("/{id}")
    fun getTagsById(
        @PathVariable id: String,
    ): Mono<ResponseEntity<TagDto>> =
        tagService
            .getTagById(id)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tag")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @PathVariable id: Long,
    ): Mono<Void> = tagService.deleteTag(id)
}
