package ru.dan.article.filter

import org.slf4j.MDC
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono
import java.util.UUID

@Component
class MdcWebFilter : WebFilter {

    override fun filter(
        exchange: ServerWebExchange,
        chain: WebFilterChain,
    ): Mono<Void> {
        val request = exchange.request
        val operationId = request.headers.getFirst("X-Operation-Id") ?: UUID.randomUUID().toString()
        val (txName, stepName) = resolveOperation(request)

        return chain.filter(exchange)
            .doFirst {
                MDC.put("operationId", operationId)
                MDC.put("transactionName", txName)
                MDC.put("stepName", stepName)
                MDC.put("serviceName", SERVICE_NAME)
            }
            .doFinally {
                MDC.remove("operationId")
                MDC.remove("transactionName")
                MDC.remove("stepName")
                MDC.remove("serviceName")
            }
    }

    private fun resolveOperation(request: ServerHttpRequest): Pair<String, String> {
        val method = request.method.name()
        val path = request.path.value()
        return when {
            method == "POST"   && path.contains("/articles") -> "CreateArticle" to "CreateArticle"
            method == "PUT"    && path.contains("/articles") -> "UpdateArticle" to "UpdateArticle"
            method == "DELETE" && path.contains("/articles") -> "DeleteArticle" to "DeleteArticle"
            method == "GET"    && path.contains("/articles") -> "ReadArticle"   to "ReadArticle"
            method == "POST"   && path.contains("/sections") -> "CreateSection" to "CreateSection"
            method == "PUT"    && path.contains("/sections") -> "UpdateSection" to "UpdateSection"
            method == "DELETE" && path.contains("/sections") -> "DeleteSection" to "DeleteSection"
            method == "GET"    && path.contains("/sections") -> "ReadSection"   to "ReadSection"
            method == "POST"   && path.contains("/tags")     -> "CreateTag"     to "CreateTag"
            method == "DELETE" && path.contains("/tags")     -> "DeleteTag"     to "DeleteTag"
            method == "GET"    && path.contains("/tags")     -> "ReadTag"       to "ReadTag"
            else -> "ArticleOperation" to "ArticleOperation"
        }
    }

    companion object {
        const val SERVICE_NAME = "article-service"
    }
}
