# Setup Guide — No Docker

Run everything natively on your machine. No Docker needed.

## 1. Prerequisites

| Tool | Check | Install if missing |
|---|---|---|
| Java JDK 17+ | `java -version` | Already OK (Java 25 works with `--release 17`) |
| Maven 3.9+ | `mvn -version` | `winget install Apache.Maven` |
| Node.js 20+ + npm | `node --version`, `npm --version` | Already OK (Node 24 works) |
| MongoDB 7+ | Windows Service `MongoDB` | Install MongoDB Community Server |
| mongosh | `mongosh --version` | `winget install MongoDB.Shell` |
| Elasticsearch 8.11+ | `curl http://localhost:9200` | Optional — search falls back to MongoDB |

Defaults already point to localhost, so no config files need editing:

- Mongo: `mongodb://localhost:27017/ecom`
- Elasticsearch: `http://localhost:9200`
- Eureka: `http://localhost:8761/eureka/`
- Gateway: `http://localhost:8080`
- Frontend: `http://localhost:4200`

## 2. Start MongoDB

```powershell
Start-Service MongoDB
Get-Service MongoDB   # should say Running
mongosh --eval "db.adminCommand('ping')"
```

## 3. Start Elasticsearch (optional)

Skip this if you want — search still works via MongoDB fallback
(`source: mongodb-fallback` in search results).

If you want full search:

1. Download Elasticsearch 8.11, unzip, run `bin\elasticsearch.bat`.
2. Verify: `curl http://localhost:9200/_cluster/health`

## 4. Seed the database

```powershell
cd D:\Project
mongosh --file seed/mongo_seed.js
# expected: Seeded categories: 5, Seeded products: 20
```

## 5. Set JWT secret (every terminal)

Run this in **each** PowerShell terminal you open for this project:

```powershell
$env:JWT_SECRET="ecom-secure-secret-key-production-min-32-chars"
```

Must be identical everywhere, minimum 32 characters.

## 6. Start backend (one terminal per service, in order)

```powershell
cd D:\Project\backend
mvn -q -pl common-lib install
```

Then one terminal each (keep the JWT line in every terminal):

```powershell
cd D:\Project\backend
mvn -q -pl eureka-server spring-boot:run            # :8761 — FIRST
mvn -q -pl api-gateway spring-boot:run              # :8080 — SECOND
mvn -q -pl user-service spring-boot:run             # :8081
mvn -q -pl product-service spring-boot:run          # :8082
mvn -q -pl search-service spring-boot:run           # :8083
mvn -q -pl recommendation-service spring-boot:run   # :8084
mvn -q -pl cart-service spring-boot:run             # :8085
mvn -q -pl order-service spring-boot:run            # :8086
mvn -q -pl return-reward-service spring-boot:run    # :8087
```

First build takes 2–5 minutes.

Optional — rebuild search index (only if Elasticsearch is running):

```powershell
curl -X POST http://localhost:8083/api/search/reindex
```

## 7. Start frontend (last terminal)

```powershell
cd D:\Project\frontend
npm install   # first time only
npm start
# open http://localhost:4200
```

## 8. Verify

1. Eureka: http://localhost:8761 — all services UP.
2. Gateway: http://localhost:8080/actuator/health — `{"status":"UP"}`.
3. Login as admin: `admin@shop.com` / `Admin@123`.
4. Search "headphones" → open a product → Home recommendations update.
5. Add to cart → checkout (COD) → order appears in Orders.

Postman collections in `postman/` cover the same flows
(Phase 1 → commerce, Phase 2 → recommendations, Phase 3 → returns).

## 9. Daily use

```powershell
Start-Service MongoDB
$env:JWT_SECRET="ecom-secure-secret-key-production-min-32-chars"
# start: eureka → gateway → other services → npm start
```

Stop: `Ctrl+C` in each terminal.

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| `mongosh: command not found` | `winget install MongoDB.Shell`, reopen terminal |
| Mongo ping fails | `Start-Service MongoDB` |
| `Could not resolve common-lib` | Run `mvn -q -pl backend/common-lib install` first |
| `401` everywhere | JWT secret missing or different between terminals |
| Search shows `mongodb-fallback` | Normal — Elasticsearch is down, search still works |
| Port already in use | Old `java.exe` still running — stop it in Task Manager |
