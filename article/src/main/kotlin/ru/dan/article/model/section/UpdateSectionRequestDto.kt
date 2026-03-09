package ru.dan.article.model.section

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Запрос на обновление секции")
data class UpdateSectionRequestDto(
    @Schema(description = "Новое название секции")
    val name: String,
    @Schema(description = "Новое описание")
    val description: String? = null,
    @Schema(description = "Новый родитель (null — корень)")
    val parentId: Long? = null,
)
