package ru.dan.rag.filter

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.util.UUID

@Component
class MdcFilter : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val operationId = request.getHeader("X-Operation-Id") ?: UUID.randomUUID().toString()
        val (txName, stepName) = resolveOperation(request)
        try {
            MDC.put("operationId", operationId)
            MDC.put("transactionName", txName)
            MDC.put("stepName", stepName)
            MDC.put("serviceName", SERVICE_NAME)
            filterChain.doFilter(request, response)
        } finally {
            MDC.remove("operationId")
            MDC.remove("transactionName")
            MDC.remove("stepName")
            MDC.remove("serviceName")
        }
    }

    private fun resolveOperation(request: HttpServletRequest): Pair<String, String> {
        val path = request.requestURI
        return when {
            path.endsWith("/answer") -> "RagAnswer" to "RagAnswer"
            path.endsWith("/search") -> "RagSearch" to "RagSearch"
            else -> "RagOperation" to "RagOperation"
        }
    }

    companion object {
        const val SERVICE_NAME = "rag-service"
    }
}
