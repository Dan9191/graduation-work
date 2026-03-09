package ru.dan.article.service

import com.fasterxml.uuid.Generators
import com.fasterxml.uuid.NoArgGenerator
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class TimeOrderedUuidGenerator {
    private val generator: NoArgGenerator = Generators.timeBasedGenerator()

    /**
     * Generate UUIDv7.
     */
    fun generateUUID(): UUID = generator.generate()
}
