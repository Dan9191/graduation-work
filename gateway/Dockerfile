FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /build

COPY gradlew .
COPY gradle gradle
COPY settings.gradle.kts .
COPY build.gradle.kts .

COPY article article
COPY gateway gateway
COPY rag rag

RUN chmod +x gradlew
RUN ./gradlew :gateway:bootJar --no-daemon

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /build/gateway/build/libs/*.jar app.jar

EXPOSE 8033

ENTRYPOINT ["java","-jar","/app/app.jar"]