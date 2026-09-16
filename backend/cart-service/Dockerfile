FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY common-lib ./common-lib
COPY cart-service/pom.xml ./cart-service/pom.xml
COPY cart-service/src ./cart-service/src
RUN mvn -q -pl cart-service -am -DskipTests package
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/cart-service/target/*.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","app.jar"]
