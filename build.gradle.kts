plugins {
    id("org.springframework.boot") version "4.0.1" apply false
    id("io.spring.dependency-management") version "1.1.7" apply false
    kotlin("jvm") version "2.2.21" apply false
    kotlin("plugin.spring") version "2.2.21" apply false
    kotlin("plugin.jpa") version "2.2.21" apply false
}

group = "ru.dan.graduation"
version = "0.0.1-SNAPSHOT"
description = "graduation"

repositories {
    mavenCentral()
}

tasks.withType<Test> {
    useJUnitPlatform()
}
