package ru.dan.article.service.outbox

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import ru.dan.article.config.ArticleProperties

@Component
class OutboxScheduler(
    private val outboxService: OutboxService,
    private val articleProperties: ArticleProperties,
) {
    @Scheduled(cron = "#{@articleProperties.scheduler.cron}")
    fun processOutbox() {
        if (articleProperties.scheduler.enabled) {
            outboxService
                .processPendingMessages()
                .onErrorResume { Mono.empty() }
                .subscribe()
        }
    }
}
