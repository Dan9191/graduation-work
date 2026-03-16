package ru.dan.article.config

import org.flywaydb.core.Flyway
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class FlywayConfig {
    @Bean(initMethod = "migrate")
    fun flyway(articleProperties: ArticleProperties): Flyway =
        Flyway
            .configure()
            .dataSource(
                articleProperties.flyway.dataSourceUrl,
                articleProperties.flyway.user,
                articleProperties.flyway.password,
            ).schemas(articleProperties.flyway.schemas)
            .locations(articleProperties.flyway.locations)
            .baselineOnMigrate(articleProperties.flyway.baseLineOnMigrate)
            .load()
}
