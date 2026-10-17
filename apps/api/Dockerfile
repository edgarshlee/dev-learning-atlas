FROM gradle:9.1.0-jdk21-alpine AS build
WORKDIR /workspace
COPY settings.gradle.kts build.gradle.kts ./
COPY src ./src
RUN gradle clean test bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S atlas && adduser -S atlas -G atlas
WORKDIR /app
COPY --from=build /workspace/build/libs/*.jar app.jar
USER atlas
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

