# Phase 0 — Bootstrap: runbook

## What Phase 0 created
- `docker-compose.yml` → mongo:7 (27017), elasticsearch:8.11 (9200), eureka-server (8761), api-gateway (8080)
- `backend/pom.xml` (parent: Spring Boot 3.2.5, Cloud 2023.0.1, Java 17), `common-lib` (JwtUtil + ErrorResponse), `eureka-server`, `api-gateway` (all gateway routes pre-wired for Phase 1+)
- `seed/mongo_seed.js` → 5 categories + 20 products
- `postman/ecom-phase0.json` → health + auth skeleton

## This machine right now
- Java 25 LTS: OK (compiles `--release 17`)
- Node 24 + npm 11: OK
- Maven: MISSING — install: `winget install Apache.Maven` (then `mvn -version`)
- Docker: MISSING — install Docker Desktop: `winget install Docker.DockerDesktop`, reboot, then `docker compose version`

> Files above are complete without Docker/Maven; you only need them to RUN.

## Run (once Docker + Maven installed)
```powershell
# 1. infra only (no Java build needed)
docker compose up -d mongo elasticsearch
mongosh --file seed/mongo_seed.js
curl http://localhost:9200/_cluster/health

# 2. discovery + gateway
docker compose up -d --build eureka-server api-gateway
# Eureka UI: http://localhost:8761 | Gateway: http://localhost:8080/actuator/health

# OR run without docker (two terminals, needs Maven):
# mvn -q -pl backend/common-lib install
# mvn -q -pl backend/eureka-server spring-boot:run
# mvn -q -pl backend/api-gateway spring-boot:run

# 3. verify
# import postman/ecom-phase0.json → run "Infra health" (auth 404s until Phase 1 user-service — expected)
```

## Env
```powershell
$env:JWT_SECRET="change-me-dev-secret-min-32-chars-long"  # PowerShell
```
Min 32 chars. Same value for gateway + every service.

## Exit criteria
- [ ] `mongo` + `elasticsearch` healthy, seed counts: 5 categories / 20 products
- [ ] Eureka UI shows `API-GATEWAY` registered
- [ ] Gateway `/actuator/health` UP; unknown Phase-1 routes return 404 via gateway (proves routing file loads)

## Next → Phase 1 (core commerce)
Scaffold `user-service` (8081: register/login/JWT + wallet auto-create), `product-service` (8082 + ES sync), `search-service` (8083), `cart-service` (8085), `order-service` (8086 mock payment). Say the word and I'll scaffold them.
