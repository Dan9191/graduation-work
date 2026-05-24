package ru.dan.rag.config

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

private val logger = KotlinLogging.logger {}

@Component
class StepRegistrar(
    @Value("\${observer.service-url:http://localhost:8033}") private val observerUrl: String,
) {
    private val restClient = RestClient.create()

    @EventListener(ApplicationReadyEvent::class)
    fun registerSteps() {
        try {
            restClient
                .post()
                .uri("$observerUrl/api/v1/steps/register")
                .body(STEPS)
                .retrieve()
                .toBodilessEntity()
            logger.info { "Steps registered with observer-service" }
        } catch (e: Exception) {
            logger.warn { "Failed to register steps with observer-service: ${e.message}" }
        }
    }

    companion object {
        private val STEPS =
            listOf(
                Step("RagAnswer", "SearchChunks", "rag-service"),
                Step("RagAnswer", "GenerateLlmResponse", "rag-service"),
                Step("RagSearch", "RagSearch", "rag-service"),
                Step("CreateArticle", "ProcessArticleCreation", "rag-service"),
                Step("CreateArticle", "ChunkArticle", "rag-service"),
                Step("UpdateArticle", "ProcessArticleUpdate", "rag-service"),
                Step("UpdateArticle", "ChunkArticle", "rag-service"),
                Step("DeleteArticle", "ProcessArticleDeletion", "rag-service"),
                Step("ProcessEmbedding", "GenerateEmbedding", "rag-service"),
            )
    }

    data class Step(
        val transactionName: String,
        val stepName: String,
        val serviceName: String,
    )
}
