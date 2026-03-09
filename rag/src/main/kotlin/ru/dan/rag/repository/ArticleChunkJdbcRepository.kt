package ru.dan.rag.repository

import ru.dan.rag.entity.ArticleChunk
import ru.dan.rag.model.ChunkForProcessing
import java.util.UUID

/**
 * Репозиторий для работы с чанками.
 */
interface ArticleChunkJdbcRepository {
    fun batchInsert(elements: List<ArticleChunk>)

    fun findPendingChunks(limit: Int): List<ChunkForProcessing>

    fun updateWithEmbedding(
        chunkId: UUID,
        embedding: List<Float>,
    )
}
