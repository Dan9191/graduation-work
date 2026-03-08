package ru.dan.rag.service

import com.fasterxml.uuid.Generators
import com.fasterxml.uuid.NoArgGenerator
import org.springframework.stereotype.Component
import java.util.*

@Component
class TimeOrderedUuidGenerator {
    private val generator: NoArgGenerator = Generators.timeBasedGenerator()

    /**
     * Генерация UUIDv7
     */
    fun generateUUID(): UUID = generator.generate()
}
