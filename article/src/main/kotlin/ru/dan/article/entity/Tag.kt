package ru.dan.article.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

/**
 * Тег.
 */
@Table("tag")
class Tag(
    @Id
    val id: Long? = null,
    @Column("name")
    val name: String,
)
