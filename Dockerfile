FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /repo
COPY . .

# pom.xml nerede ise bul, orada build al
RUN set -eux; \
  POM_DIR="$(dirname "$(find /repo -maxdepth 6 -name pom.xml | head -n 1)")"; \
  echo "POM_DIR=$POM_DIR"; \
  cd "$POM_DIR"; \
  mvn -DskipTests package; \
  echo "=== JARS FOUND ==="; \
  find . -maxdepth 6 -type f -name "*.jar" -print

FROM eclipse-temurin:17-jre
WORKDIR /app

# Build aşamasında üretilen jar'ı nerdeyse ordan al
RUN true
COPY --from=build /repo /repo
RUN set -eux; \
  JAR_PATH="$(find /repo -maxdepth 8 -type f -name "*.jar" | head -n 1)"; \
  echo "USING JAR: $JAR_PATH"; \
  cp "$JAR_PATH" /app/app.jar; \
  ls -lah /app

EXPOSE 8080
CMD ["sh","-c","java -jar /app/app.jar --server.port=${PORT:-8080}"]
