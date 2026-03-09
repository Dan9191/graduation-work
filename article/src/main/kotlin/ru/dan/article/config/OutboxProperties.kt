package ru.dan.article.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "app.outbox")
data class OutboxProperties(
    var rabbit: RabbitConfig = RabbitConfig(),
    var scheduler: SchedulerConfig = SchedulerConfig(),
    var maxAttempts: Int = 3,
    var retryDelay: Long = 5000,
) {
    data class RabbitConfig(
        var exchange: String = "",
        var routingKey: String = "",
        var queue: String = "",
    )

    data class SchedulerConfig(
        var cron: String = "0/30 * * * * ?",
        var batchSize: Int = 10,
        var enabled: Boolean = true,
    )
}
