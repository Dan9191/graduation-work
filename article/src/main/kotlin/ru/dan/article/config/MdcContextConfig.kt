package ru.dan.article.config

import io.micrometer.context.ContextRegistry
import io.micrometer.context.ThreadLocalAccessor
import jakarta.annotation.PostConstruct
import org.slf4j.MDC
import org.springframework.context.annotation.Configuration
import reactor.core.publisher.Hooks

@Configuration
class MdcContextConfig {
    @PostConstruct
    fun registerMdcAccessor() {
        Hooks.enableAutomaticContextPropagation()
        ContextRegistry.getInstance().registerThreadLocalAccessor(MdcThreadLocalAccessor())
    }
}

class MdcThreadLocalAccessor : ThreadLocalAccessor<Map<String, String>> {
    companion object {
        const val KEY = "slf4j.mdc"
    }

    override fun key(): Any = KEY

    override fun getValue(): Map<String, String> = MDC.getCopyOfContextMap() ?: emptyMap()

    override fun setValue(value: Map<String, String>) = MDC.setContextMap(value)

    override fun setValue() = MDC.clear()
}
