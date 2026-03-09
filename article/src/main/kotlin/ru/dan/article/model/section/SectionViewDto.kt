package ru.dan.article.model.section

import io.swagger.v3.oas.annotations.media.Schema

/**
 * DTO для представления дерева секции.
 */
@Schema(description = "DTO для представления секции")
data class SectionViewDto(
    @Schema(description = "Уникальный идентификатор секции")
    val id: Long?,
    @Schema(description = "Название секции")
    val name: String,
    @Schema(description = "Описание секции")
    val description: String? = null,
    @Schema(description = "Родительский узел")
    val parent: ParentSectionDto?,
)

@Schema(description = "Родительская секция")
data class ParentSectionDto(
    @Schema(description = "Уникальный идентификатор родительской секции")
    val id: Long,
    @Schema(description = "Название родительской секции")
    val name: String,
)
