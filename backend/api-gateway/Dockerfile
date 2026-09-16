FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY ../pom.xml ../pom.xml
COPY ../common-lib ../common-lib
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8761 8080 8081 8082 8083 8084 8085 8086 8087
ENTRYPOINT ["java","-jar","app.jar"]
