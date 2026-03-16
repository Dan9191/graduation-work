package ru.dan.article

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers

@SpringBootTest
@Testcontainers
class ArticleApplicationTests {
    companion object {
        @Container
        @JvmStatic
        @ServiceConnection
        val postgres: PostgreSQLContainer<*> =
            PostgreSQLContainer("postgres:15")
                .withDatabaseName("testdb")
                .withUsername("test")
                .withPassword("test")

        @JvmStatic
        @DynamicPropertySource
        fun configureProperties(registry: DynamicPropertyRegistry) {
            val jdbcUrl = "jdbc:postgresql://${postgres.host}:${postgres.firstMappedPort}/${postgres.databaseName}"

            registry.add("app.article.flyway.data-source-url") { jdbcUrl }
            registry.add("app.article.flyway.user") { postgres.username }
            registry.add("app.article.flyway.password") { postgres.password }

            registry.add("app.article.flyway.schemas") { "article_service" }
            registry.add("app.article.flyway.locations") { "classpath:db/migration" }
            registry.add("app.article.flyway.baseline-on-migrate") { "true" }
        }
    }

    @Test
    fun contextLoads() {
    }
}
