# Build jar trước: ./mvnw -pl services/billing-service -am package
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY target/billing-service-*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
