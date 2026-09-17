FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -q -pl order-service -am -DskipTests package
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/order-service/target/order-service.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java","-jar","app.jar"]
