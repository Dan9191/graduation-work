package ru.dan.article.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import ru.dan.article.model.article.ArticleViewDto
import ru.dan.article.model.article.CreateArticleDto
import ru.dan.article.model.article.PagedShortArticles
import ru.dan.article.model.article.UpdateArticleRequestDto
import ru.dan.article.service.ArticleService
import java.util.UUID

@RestController
@RequestMapping("/api/v1/articles")
@Tag(name = "articles", description = "Operations related to articles")
class ArticleController(
    private val articleService: ArticleService,
) {
    @Operation(summary = "Get article by ID", description = "Get a specific article by its ID")
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Article found",
                content = [Content(schema = Schema(implementation = ArticleViewDto::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Article not found",
                content = [Content()],
            ),
        ],
    )
    @GetMapping("/{id}")
    fun getArticle(
        @PathVariable id: UUID,
    ): Mono<ArticleViewDto> = articleService.getArticleById(id)

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete article by ID")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @PathVariable id: UUID,
    ): Mono<Void> = articleService.deleteArticle(id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create article")
    fun createSection(
        @RequestBody request: CreateArticleDto,
    ): Mono<ArticleViewDto> = articleService.createArticle(request)

    @PutMapping("/{id}")
    @Operation(summary = "Обновление статьи")
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Article found",
                content = [Content(schema = Schema(implementation = ArticleViewDto::class))],
            ),
            ApiResponse(
                responseCode = "404",
                description = "Article not found",
                content = [Content()],
            ),
        ],
    )
    fun update(
        @PathVariable id: UUID,
        @RequestBody request: UpdateArticleRequestDto,
    ): Mono<ResponseEntity<ArticleViewDto>> =
        articleService
            .updateArticle(id, request)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())

    @GetMapping("/all")
    @Operation(summary = "Страница статей")
    fun getArticles(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "createdAt") sortBy: String,
        @RequestParam(defaultValue = "DESC") direction: String,
        @RequestParam(required = false) sectionId: Long?,
        @RequestParam(required = false) tagId: Long?,
    ): Mono<PagedShortArticles> {
        val dir =
            if (direction.uppercase() == "ASC") {
                Sort.Direction.ASC
            } else {
                Sort.Direction.DESC
            }

        return articleService.getArticlesPageFiltered(
            page,
            size,
            sortBy,
            dir,
            sectionId,
            tagId,
        )
    }
}
