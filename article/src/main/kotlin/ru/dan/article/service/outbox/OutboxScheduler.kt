package ru.dan.article.service.outbox

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono
import ru.dan.article.config.OutboxProperties

@Component
class OutboxScheduler(
    private val outboxService: OutboxService,
    private val outboxProperties: OutboxProperties,
) {
    @Scheduled(cron = "#{@outboxProperties.scheduler.cron}")
    fun processOutbox() {
        if (outboxProperties.scheduler.enabled) {
            outboxService
                .processPendingMessages()
                .onErrorResume { Mono.empty() }
                .subscribe()
        }
    }
}
