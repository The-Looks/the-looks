# Build jar trước: ./mvnw -pl services/outfit-service -am package
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY target/outfit-service-*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
