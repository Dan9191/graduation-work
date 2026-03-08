package ru.dan.rag.repository

import org.springframework.data.repository.CrudRepository
import ru.dan.rag.entity.ArticleChunk
import java.util.*

/**
 * Репозиторий для работы с чанками.
 */
interface ArticleChunkRepository :
    CrudRepository<ArticleChunk, UUID>,
    ArticleChunkJdbcRepository
