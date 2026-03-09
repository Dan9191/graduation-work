package ru.dan.article.excption

class SectionNotFoundException(
    message: String,
) : RuntimeException(message)
