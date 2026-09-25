# Setup Guide — No Docker

Run everything natively on your machine. No Docker needed.

## 1. Prerequisites

| Tool | This machine | Install / fix if missing |
|---|---|---|
| Java JDK 17+ | ✅ Java 25 (works, compiles `--release 17`) | — |
| Maven 3.9+ | ✅ 3.9.16 | `winget install Apache.Maven` |
| Node.js 20+ + npm | ✅ Node 24 + npm 11 | — |
| MongoDB | ✅ Server 8.3 installed, service `MongoDB` present but **Stopped** | Start it, **as Administrator** (see §2) or manual `mongod` |
| mongosh | ✅ Installed (`v2.11.1` in `%LOCALAPPDATA%\Programs\mongosh`, added to User PATH) | `mongosh --version` |
| Elasticsearch | ⚠️ 9.5.4 zip at `D:\elasticsearch-9.5.4`, no Windows service | Start manually (see §3), or skip — search falls back to MongoDB |

Defaults already point to localhost, so no config files need editing:

- Mongo: `mongodb://localhost:27017/ecom`
- Elasticsearch: `http://localhost:9200`
- Eureka: `http://localhost:8761/eureka/`
- Gateway: `http://localhost:8080`
- Frontend: `http://localhost:4200`

## 2. Start MongoDB (service-only, like MySQL)

> MongoDB must already be running before the backend — the backend only
> connects (`mongodb://localhost:27017/ecom`). `start-backend.ps1` no longer
> creates `D:\mongo-data`; it fails fast with the command below.
>
> The service **must be started from an Administrator PowerShell**.
> Confirm elevation first — this must print `admin=True`:
>
> ```powershell
> ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
> ```
>
> If `False`: Win+X → **Terminal (Admin)** (title bar shows `Administrator:`),
> then:

```powershell
# Run PowerShell AS ADMINISTRATOR (one time; then it stays Automatic):
Set-Service MongoDB -StartupType Automatic
Start-Service MongoDB
Get-Service MongoDB   # should say Running
# back in your normal terminal:
mongosh --eval "db.adminCommand('ping')"
```

> Opt-in manual fallback (recreates `D:\mongo-data`, empty DB — not recommended):
> `.\start-backend.ps1 -AllowManualMongo`. Prefer the service above.

> If `mongod` fails with `Address already in use` on 27017, a leftover
> `docker-desktop` WSL distro is holding the port — stop it once with
> `wsl --terminate docker-desktop` and retry. (`wslrelay` listeners on
> 27017 with no `mongod` behind them are this symptom.)

### mongosh: winget says installed but `mongosh` not found

A stale `MongoDB.Shell` registration with no binary on disk or PATH.
Reinstall it:

```powershell
winget uninstall MongoDB.Shell
winget install MongoDB.Shell
# close + reopen the terminal, then:
mongosh --version
```

> This installs per-user to `%LOCALAPPDATA%\Programs\mongosh\`
> (e.g. `C:\Users\<you>\AppData\Local\Programs\mongosh\mongosh.exe`)
> and does **not** add itself to PATH. Either reopen the terminal
> (installer updates PATH on login) or add it permanently:
>
> ```powershell
> setx PATH "$env:PATH;$env:LOCALAPPDATA\Programs\mongosh"
> # reopen terminal → mongosh --version → 2.x.x
> ```

Alternative: MongoDB Compass GUI, or the `.msi` from
https://www.mongodb.com/try/download/shell.

## 3. Start Elasticsearch (optional)

Skip this if you want — search still works via MongoDB fallback
(`source: mongodb-fallback` in search results).

This machine already has Elasticsearch **9.5.4** at `D:\elasticsearch-9.5.4`
(no Windows service — start it manually):

```powershell
D:\elasticsearch-9.5.4\bin\elasticsearch.bat
# verify in another terminal:
curl http://localhost:9200
```

> Note: the project targets Elasticsearch 8.11. Version 9.x may log
> warnings with Spring Data Elasticsearch — if search misbehaves,
> stop ES and rely on the MongoDB fallback.

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

## 6. Start backend

### Method A: Single Command Orchestrator (Recommended)

Run the automated orchestrator from the project root. It checks MongoDB, starts Eureka and API Gateway, launches all 7 core services with optimal memory flags (`-Xmx256m`), and logs to `backend/logs/`:

```powershell
cd D:\Project
.\start-backend.ps1
```

Options:
- `.\start-backend.ps1 -Mode jar` (Default, starts fast compiled JARs in ~10 seconds)
- `.\start-backend.ps1 -Mode maven` (Starts via `mvn spring-boot:run`)
- `.\start-backend.ps1 -KeepAlive` (Keeps terminal running as a daemon process)

To stop all backend services cleanly at any time:
```powershell
.\stop-backend.ps1                 # stops ports 8080-8087
.\stop-backend.ps1 -IncludeEureka  # stops ports 8080-8087 AND 8761
```

---

### Method B: Manual (One Terminal per Service)

If debugging a specific service in the foreground:

```powershell
cd D:\Project\backend
mvn -q install -DskipTests
```

Then one terminal each (with `$env:JWT_SECRET="ecom-secure-secret-key-production-min-32-chars"`):

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

Optional — rebuild search index (only if Elasticsearch is running):
```powershell
curl -X POST http://localhost:8083/api/search/reindex
```

## 7. Start frontend

```powershell
cd D:\Project\frontend
npm install   # first time only
npm start     # serves on http://localhost:4200
```

## 8. Verify

1. Eureka: http://localhost:8761 — all 8 services registered (`UP`).
2. Gateway: http://localhost:8080/actuator/health — `{"status":"UP"}`.
3. Products via Gateway: http://localhost:8080/api/products — returns 20 seeded products.
4. Categories via Gateway: http://localhost:8080/api/categories — returns 5 categories.
5. Login as admin: `admin@shop.com` / `Admin@123` via frontend or `POST /api/users/login`.
6. Search "headphones" → open product → recommendations update.
7. Add to cart → checkout (COD) → order placed.

## 9. Daily Use (1-Minute Launch)

```powershell
# In terminal 1 (Backend):
cd D:\Project
.\start-backend.ps1

# In terminal 2 (Frontend):
cd D:\Project\frontend
npm start
```

When finished:
```powershell
.\stop-backend.ps1
```

## 10. Troubleshooting & Architectural Fixes Applied

| Symptom | Cause / Fix |
|---|---|
| `Gateway 500: UnknownHostException: Failed to resolve <hostname>` | Fixed. On Windows, Eureka services registered machine hostname (`TRILOCHAN.mshome.net`). Added `eureka.instance.prefer-ip-address: true` across all services so Gateway resolves directly via IP. |
| `Gateway 404 for /api/products` | Fixed. Routes in `api-gateway/src/main/resources/application.yml` were improperly nested under `server.webflux` and used ANDed predicates. Fixed to standard `spring.cloud.gateway.routes` with comma-separated patterns. |
| `mongosh: command not found` | WinGet installed mongosh to `%LOCALAPPDATA%\Programs\mongosh`. Added permanently to User PATH. |
| `Cannot open MongoDB service` | Terminal is not admin. Start service via Admin PowerShell or run native `mongod` manually: `& "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\8.3\bin\mongod.cfg"`. |
| Port conflicts with old Docker | If Docker was previously running, its WSL relay may hold ports. Run `wsl --terminate docker-desktop` or quit Docker Desktop. |
| `Could not resolve common-lib` | Run `mvn clean install -DskipTests` from `backend/`. |

## 11. Verified on this machine

- ✅ Docker Desktop stopped and all backend ports cleanly released.
- ✅ Native MongoDB running on port `27017` (ping `{ ok: 1 }`).
- ✅ `mongosh` 2.11.1 in User PATH; database seeded with 5 categories & 20 products.
- ✅ All 8 Spring Boot microservices compiled into production JARs and registered in Eureka.
- ✅ `api-gateway` routes verified: `/api/products` (20 items), `/api/categories` (5 items), `/api/users/login` (JWT token issued).
- ✅ Angular 17 frontend serving on `http://localhost:4200` (HTTP 200 OK).
- ✅ Single-command orchestrator `start-backend.ps1` and shutdown script `stop-backend.ps1` operational.
