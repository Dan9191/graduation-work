package ru.dan.article.config

import jakarta.annotation.PostConstruct
import org.slf4j.MDC
import org.springframework.context.annotation.Configuration
import reactor.core.scheduler.Schedulers

@Configuration
class MdcContextConfig {
    @PostConstruct
    fun registerMdcSchedulerHook() {
        Schedulers.onScheduleHook("mdc") { runnable ->
            val capturedMdc = MDC.getCopyOfContextMap() ?: emptyMap()
            Runnable {
                val previousMdc = MDC.getCopyOfContextMap()
                try {
                    if (capturedMdc.isNotEmpty()) MDC.setContextMap(capturedMdc)
                    runnable.run()
                } finally {
                    if (previousMdc != null) MDC.setContextMap(previousMdc) else MDC.clear()
                }
            }
        }
    }
}
