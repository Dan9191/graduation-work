package ru.dan.article

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.transaction.annotation.EnableTransactionManagement
import reactor.core.publisher.Hooks

@SpringBootApplication
@EnableScheduling
@EnableTransactionManagement
@ConfigurationPropertiesScan
class ArticleApplication

fun main(args: Array<String>) {
    Hooks.enableAutomaticContextPropagation()
    runApplication<ArticleApplication>(*args)
}
