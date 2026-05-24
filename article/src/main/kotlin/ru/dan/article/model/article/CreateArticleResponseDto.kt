package ru.dan.article.model.article

data class CreateArticleResponseDto(
    val article: ArticleViewDto,
    val operationId: String,
)
