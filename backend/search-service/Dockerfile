FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -q -pl search-service -am -DskipTests package
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/search-service/target/search-service.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar","app.jar"]
