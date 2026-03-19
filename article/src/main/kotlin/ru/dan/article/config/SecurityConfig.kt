package ru.dan.article.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.web.server.SecurityWebFilterChain
import reactor.core.publisher.Mono

@Configuration
class SecurityConfig {
    @Bean
    fun securityWebFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain =
        http
            .csrf { it.disable() }
            .authorizeExchange { exchanges ->
                exchanges
                    // Sections
                    .pathMatchers(HttpMethod.GET, "/api/v1/sections/**")
                    .permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/v1/sections/tree")
                    .permitAll()
                    .pathMatchers(HttpMethod.PUT, "/api/v1/sections/**")
                    .hasAuthority("ROLE_graduation.admin")
                    .pathMatchers(HttpMethod.DELETE, "/api/v1/sections/**")
                    .hasAuthority("ROLE_graduation.admin")
                    .pathMatchers(HttpMethod.POST, "/api/v1/sections")
                    .hasAuthority("ROLE_graduation.admin")
                    // Tag
                    .pathMatchers(HttpMethod.GET, "/api/v1/tags/**")
                    .permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/v1/tags")
                    .permitAll()
                    .pathMatchers(HttpMethod.DELETE, "/api/v1/tags/**")
                    .hasAuthority("ROLE_graduation.admin")
                    .pathMatchers(HttpMethod.POST, "/api/v1/tags")
                    .hasAuthority("ROLE_graduation.admin")
                    // Articles
                    .pathMatchers(HttpMethod.GET, "/api/v1/articles/**")
                    .permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/v1/articles/all")
                    .permitAll()
                    .pathMatchers(HttpMethod.PUT, "/api/v1/articles/**")
                    .hasAuthority("ROLE_graduation.admin")
                    .pathMatchers(HttpMethod.DELETE, "/api/v1/articles/**")
                    .hasAuthority("ROLE_graduation.admin")
                    .pathMatchers(HttpMethod.POST, "/api/v1/articles/**")
                    .hasAuthority("ROLE_graduation.admin")
                    // Other
                    .pathMatchers("/actuator/**")
                    .permitAll()
                    .pathMatchers(
                        "/api/swagger-ui.html",
                        "/api/swagger-ui/**",
                        "/api/v3/api-docs",
                        "/api/v3/api-docs/**",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/api/webjars/**",
                        "/webjars/**",
                    ).permitAll()
                    .anyExchange()
                    .authenticated()
            }.oauth2ResourceServer { oauth ->
                oauth.jwt { jwt ->
                    jwt.jwtAuthenticationConverter(reactiveJwtConverter())
                }
            }.build()

    fun reactiveJwtConverter(): (Jwt) -> Mono<AbstractAuthenticationToken> {
        val delegate = JwtAuthenticationConverter()

        delegate.setJwtGrantedAuthoritiesConverter { jwt ->
            val roles = extractRealmRoles(jwt)
            roles.map { SimpleGrantedAuthority("ROLE_$it") }
        }

        return { jwt ->
            Mono.just(delegate.convert(jwt)!!)
        }
    }

    private fun extractRealmRoles(jwt: Jwt): List<String> {
        val realmAccess = jwt.getClaimAsMap("realm_access") ?: return emptyList()

        val roles = realmAccess["roles"]

        return if (roles is List<*>) {
            roles.filterIsInstance<String>()
        } else {
            emptyList()
        }
    }
}
