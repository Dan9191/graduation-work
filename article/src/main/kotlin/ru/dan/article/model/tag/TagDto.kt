package ru.dan.article.model.tag

import io.swagger.v3.oas.annotations.media.Schema

/**
 * DTO для тегов.
 */
@Schema(description = "DTO для тегов")
data class TagDto(
    @Schema(description = "Уникальный идентификатор тега")
    val id: Long?,
    @Schema(description = "Название тега")
    val name: String,
)
