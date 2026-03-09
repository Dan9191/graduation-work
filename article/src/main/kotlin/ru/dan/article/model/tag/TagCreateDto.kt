package ru.dan.article.model.tag

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class TagCreateDto(
    @field:NotBlank(message = "Name cannot be blank")
    @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    val name: String,
)
