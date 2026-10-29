# Build jar trước: ./mvnw -pl services/voting-service -am package
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY target/voting-service-*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
