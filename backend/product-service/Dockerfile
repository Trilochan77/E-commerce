FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -q -pl product-service -am -DskipTests package
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/product-service/target/product-service.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","app.jar"]
