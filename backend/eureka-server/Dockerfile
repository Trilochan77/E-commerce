FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -q -pl eureka-server -am -DskipTests package
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/eureka-server/target/eureka-server.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java","-jar","app.jar"]
