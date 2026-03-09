package ru.dan.article.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

/**
 * Сущность главы/секции.
 */
@Table("a_section")
class Section(
    @Id
    val id: Long? = null,
    val name: String,
    val description: String? = null,
    @Column("parent_id")
    val parentId: Long? = null,
)
