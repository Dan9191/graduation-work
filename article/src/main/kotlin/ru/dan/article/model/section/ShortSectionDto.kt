package ru.dan.article.model.section

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "DTO для короткого представления секции")
data class ShortSectionDto(
    @Schema(description = "Уникальный идентификатор секции")
    val id: Long?,
    @Schema(description = "Название секции")
    val name: String,
)
