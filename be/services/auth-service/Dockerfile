# Build jar trước: ./mvnw -pl services/auth-service -am package
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY target/auth-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
