FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -q -pl user-service -am -DskipTests package
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/user-service/target/user-service.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]
