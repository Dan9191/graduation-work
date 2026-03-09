package ru.dan.article.config

import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.amqp.core.DirectExchange
import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.QueueBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMQConfig(
    private val outboxProperties: OutboxProperties,
) {
    @Bean
    fun outboxQueue(): Queue = QueueBuilder.durable(outboxProperties.rabbit.queue).build()

    @Bean
    fun outboxExchange(): DirectExchange = DirectExchange(outboxProperties.rabbit.exchange)

    @Bean
    fun outboxBinding(): Binding =
        BindingBuilder
            .bind(outboxQueue())
            .to(outboxExchange())
            .with(outboxProperties.rabbit.routingKey)
}
