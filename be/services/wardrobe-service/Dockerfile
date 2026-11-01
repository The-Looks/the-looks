# Build context là thư mục be/ (cần pom cha và packages/):
#   docker build -f services/wardrobe-service/Dockerfile .
FROM eclipse-temurin:25-jdk AS build
WORKDIR /src
COPY . .
RUN sh mvnw -q -B -pl services/wardrobe-service -am package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /src/services/wardrobe-service/target/wardrobe-service-*.jar app.jar
# Máy free chỉ có 512 MB RAM: cho heap dùng 75% thay vì 25% mặc định
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
