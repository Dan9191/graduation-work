package ru.dan.article.config

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient

private val logger = KotlinLogging.logger {}

@Component
class StepRegistrar(
    @Value("\${observer.service-url:http://localhost:8033}") private val observerUrl: String,
) {
    @EventListener(ApplicationReadyEvent::class)
    fun registerSteps() {
        WebClient
            .create(observerUrl)
            .post()
            .uri("/api/v1/steps/register")
            .bodyValue(STEPS)
            .retrieve()
            .bodyToMono(Void::class.java)
            .subscribe(
                { logger.info { "Steps registered with observer-service" } },
                { e -> logger.warn { "Failed to register steps with observer-service: ${e.message}" } },
            )
    }

    companion object {
        private val STEPS =
            listOf(
                Step("CreateArticle", "CreateArticle", "article-service"),
                Step("CreateArticle", "PublishEvent", "article-service"),
                Step("UpdateArticle", "UpdateArticle", "article-service"),
                Step("UpdateArticle", "PublishEvent", "article-service"),
                Step("DeleteArticle", "DeleteArticle", "article-service"),
                Step("DeleteArticle", "PublishEvent", "article-service"),
            )
    }

    data class Step(
        val transactionName: String,
        val stepName: String,
        val serviceName: String,
    )
}
