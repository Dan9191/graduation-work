package ru.dan.rag.service

import mu.KotlinLogging
import org.slf4j.MDC
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.dan.rag.client.GigachatModelsClient
import ru.dan.rag.filter.MdcFilter
import ru.dan.rag.model.ChunkForProcessing
import ru.dan.rag.repository.ArticleChunkRepository
import java.util.UUID
import kotlin.math.sqrt

private val logger = KotlinLogging.logger {}

/**
 * Сервис работы с векторизацией.
 */
@Service
class ChunkEmbeddingService(
    private val articleChunkRepository: ArticleChunkRepository,
    private val gigaEmbeddingClient: GigachatModelsClient,
) {
    /**
     * Задача для отправки чанк на векторизацию.
     */
    @Scheduled(fixedDelayString = "#{@ragPropertiesConfig.embeddingDelay}")
    @Transactional
    fun processPendingChunks() {
        MDC.put("operationId", UUID.randomUUID().toString())
        MDC.put("transactionName", "ProcessEmbedding")
        MDC.put("stepName", "GenerateEmbedding")
        MDC.put("serviceName", MdcFilter.SERVICE_NAME)
        try {
            val startTime = System.currentTimeMillis()
            logger.info { "Starting processing of pending chunks" }

            val pendingChunks = articleChunkRepository.findPendingChunks(100)
            if (pendingChunks.isEmpty()) {
                logger.info { "No pending chunks found" }
                return
            }

            logger.info { "Found ${pendingChunks.size} chunks to process" }

            for (chunk in pendingChunks) {
                processSingleChunk(chunk)
            }

            logger.info { "Finished processing chunks, took ${System.currentTimeMillis() - startTime}ms" }
        } finally {
            MDC.remove("operationId")
            MDC.remove("transactionName")
            MDC.remove("stepName")
            MDC.remove("serviceName")
        }
    }

    /**
     * Сохранение вектора в БД.
     */
    private fun processSingleChunk(chunk: ChunkForProcessing) {
        try {
            val embedding = fetchEmbedding(chunk.text)
            articleChunkRepository.updateWithEmbedding(chunk.id, embedding)
        } catch (e: Exception) {
            logger.error(e) { "Failed to process chunk id=${chunk.id}" }
        }
    }

    /**
     * Обращение к сервису векторизации.
     */
    fun fetchEmbedding(text: String): List<Float> {
        val response: List<Float> =
            gigaEmbeddingClient.getVector(text)
                ?: throw RuntimeException("Embedding service returned empty data list")

        return normalizeEmbedding(response)
    }

    /**
     * Нормализация вектора.
     */
    private fun normalizeEmbedding(embedding: List<Float>): List<Float> {
        val norm = sqrt(embedding.map { it * it }.sum())
        return embedding.map { it / norm }
    }
}
