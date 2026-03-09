package ru.dan.article.model.article

import io.swagger.v3.oas.annotations.media.Schema

@Schema(description = "Страница со списком коротких статей")
data class PagedShortArticles(
    @Schema(description = "Список статей на текущей странице")
    val content: List<ShortArticleDto>,
    @Schema(description = "Номер текущей страницы (начиная с 0)")
    val page: Int,
    @Schema(description = "Размер страницы")
    val size: Int,
    @Schema(description = "Общее количество статей")
    val totalElements: Long,
    @Schema(description = "Общее количество страниц")
    val totalPages: Int,
    @Schema(description = "Это последняя страница?")
    val last: Boolean,
)
