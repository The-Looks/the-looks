# Build jar trước: ./mvnw -pl services/identity-service -am package
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY target/identity-service-*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
