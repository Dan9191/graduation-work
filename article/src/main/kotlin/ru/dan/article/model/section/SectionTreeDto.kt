package ru.dan.article.model.section

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "DTO для представления секции")
data class SectionTreeDto(
    @Schema(description = "Уникальный идентификатор секции")
    val id: Long?,
    @Schema(description = "Название секции")
    val name: String,
    @Schema(description = "Описание секции")
    val description: String? = null,
    @Schema(description = "Описание секции")
    val children: List<SectionTreeDto> = emptyList(),
)
