package ru.dan.article.config

import org.flywaydb.core.Flyway
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FlywayConfig(
    private val articleProperties: ArticleProperties,
) {
    @Bean(initMethod = "migrate")
    fun flyway(): Flyway {
        val config =
            Flyway
                .configure()
                .dataSource(
                    "jdbc:postgresql://localhost:5432/rag",
                    "rag_user",
                    "rag_pass",
                ).schemas("article_service")
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)

        return Flyway(config)
    }
}
