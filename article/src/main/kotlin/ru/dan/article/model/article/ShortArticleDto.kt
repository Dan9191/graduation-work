package ru.dan.article.model.article

import io.swagger.v3.oas.annotations.media.Schema
import ru.dan.article.model.section.ShortSectionDto
import ru.dan.article.model.tag.TagDto
import java.time.Instant
import java.util.UUID

@Schema(description = "DTO для создания статьи")
class ShortArticleDto(
    @Schema(description = "Уникальный идентификатор статьи")
    val id: UUID? = null,
    @Schema(description = "Ссылка на основное изображение статьи")
    val mainPicture: String,
    @Schema(description = "Заголовок статьи")
    val title: String,
    @Schema(description = "Описание статьи")
    val description: String,
    @Schema(description = "Список тегов, связанных со статьей")
    val tags: List<TagDto>,
    @Schema(description = "Краткое представление раздела, к которому относится статья")
    val section: ShortSectionDto,
    @Schema(description = "Дата создания статьи")
    val createdAt: Instant,
)
