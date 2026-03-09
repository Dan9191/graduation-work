package ru.dan.article.model.section

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Запрос на создание секции")
data class CreateSectionDto(
    @Schema(description = "Название секции")
    val name: String,
    @Schema(description = "Описание секции")
    val description: String? = null,
    @Schema(description = "ID родительской секции(null — корень)")
    val parentId: Long? = null,
)
