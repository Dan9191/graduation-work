package ru.dan.article.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "app.article")
data class ArticleProperties(
    var rabbit: RabbitConfig = RabbitConfig(),
    var flyway: FlywayConfig = FlywayConfig(),
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

    data class FlywayConfig(
        var dataSourceUrl: String = "jdbc:postgresql://localhost:5432/rag",
        var user: String = "rag_user",
        var password: String = "rag_pass",
        var schemas: String = "article_service",
        var locations: String = "classpath:db/migration",
        var baseLineOnMigrate: Boolean = true,
    )
}
