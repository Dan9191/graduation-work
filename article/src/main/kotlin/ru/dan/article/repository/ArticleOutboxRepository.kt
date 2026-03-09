package ru.dan.article.repository

import org.springframework.data.repository.reactive.ReactiveCrudRepository
import ru.dan.article.entity.ArticleOutbox
import java.util.*

interface ArticleOutboxRepository :
    ReactiveCrudRepository<ArticleOutbox, UUID>,
    ArticleOutboxR2dbcRepository
