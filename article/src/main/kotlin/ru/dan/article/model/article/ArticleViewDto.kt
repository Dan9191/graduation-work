package ru.dan.article.model.article

import io.swagger.v3.oas.annotations.media.Schema
import ru.dan.article.model.section.ShortSectionDto
import ru.dan.article.model.tag.TagDto
import java.time.Instant
import java.util.*

@Schema(description = "DTO для представления статьи")
data class ArticleViewDto(
    @Schema(description = "Уникальный идентификатор статьи")
    val id: UUID,
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
    @Schema(description = "Дата создания статьи")
    val createdAt: Instant,
    @Schema(description = "Дата последнего обновления статьи")
    val updatedAt: Instant?,
    @Schema(description = "Количество просмотров статьи")
    val viewCount: Long,
    @Schema(description = "Краткое представление раздела, к которому относится статья")
    val section: ShortSectionDto,
    @Schema(description = "Список тегов, связанных со статьей")
    val tags: List<TagDto> = emptyList(),
)
