package ru.dan.article.model.article

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "DTO для создания статьи")
class CreateArticleDto(
    @Schema(description = "Заголовок статьи")
    val title: String,
    @Schema(description = "Описание статьи")
    val description: String,
    @Schema(description = "Ссылка на основное изображение статьи")
    val mainPicture: String,
    @Schema(description = "Источник статьи")
    val source: String?,
    @Schema(description = "Содержимое статьи в формате Markdown")
    val body: String,
    @Schema(description = "Идентификатор раздела, к которому относится статья")
    val sectionId: Long,
    @Schema(description = "Список тегов, связанных со статьей")
    val tags: List<Long> = emptyList(),
)
