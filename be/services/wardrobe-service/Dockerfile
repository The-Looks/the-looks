# Build jar trước: ./mvnw -pl services/wardrobe-service -am package
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY target/wardrobe-service-*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
