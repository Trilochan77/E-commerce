# Setup Guide — No Docker

Run everything natively on your machine. No Docker needed.

## 1. Prerequisites

| Tool | This machine | Install / fix if missing |
|---|---|---|
| Java JDK 17+ | ✅ Java 25 (works, compiles `--release 17`) | — |
| Maven 3.9+ | ✅ 3.9.16 | `winget install Apache.Maven` |
| Node.js 20+ + npm | ✅ Node 24 + npm 11 | — |
| MongoDB | ✅ Server 8.3 installed, service `MongoDB` present but **Stopped** | Start it, **as Administrator** (see §2) |
| mongosh | ❌ **Missing** | `winget install MongoDB.Shell` (reopen terminal after) |
| Elasticsearch | ⚠️ 9.5.4 zip at `D:\elasticsearch-9.5.4`, no Windows service | Start manually (see §3), or skip — search falls back to MongoDB |

Defaults already point to localhost, so no config files need editing:

- Mongo: `mongodb://localhost:27017/ecom`
- Elasticsearch: `http://localhost:9200`
- Eureka: `http://localhost:8761/eureka/`
- Gateway: `http://localhost:8080`
- Frontend: `http://localhost:4200`

## 2. Start MongoDB

> The service **must be started from an Administrator PowerShell**.
> A normal terminal fails with `Cannot open MongoDB service` (verified).
> Confirm elevation first — this must print `admin=True`:
>
> ```powershell
> ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
> ```
>
> If `False`: Win+X → **Terminal (Admin)** (title bar shows `Administrator:`),
> then:

```powershell
# Run PowerShell AS ADMINISTRATOR:
Start-Service MongoDB
Get-Service MongoDB   # should say Running
# back in your normal terminal:
mongosh --eval "db.adminCommand('ping')"
```

No admin rights? Or the service won't start? Run `mongod` manually instead
(no admin needed, `D:\mongo-data` already created — **verified working**):

```powershell
Start-Process -FilePath "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" -ArgumentList "--dbpath","D:\mongo-data","--port","27017","--bind_ip","127.0.0.1","--logpath","D:\mongo-data\mongod.log"
# verify:
mongosh --eval "db.adminCommand('ping')"   # → { ok: 1 }
# logs: D:\mongo-data\mongod.log. Stop it via Task Manager (mongod.exe) when done.
```

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
| `mongosh: command not found` | `winget install MongoDB.Shell`, reopen terminal — if winget claims it's already installed but the command still missing, `winget uninstall` + reinstall (stale registration) |
| `Cannot open MongoDB service` | Terminal is not admin — check the one-liner in §2; right-click PowerShell → Run as administrator, then `Start-Service MongoDB` |
| Mongo ping fails | Service not running (see §2), or `mongod --dbpath` terminal was closed |
| `Could not resolve common-lib` | From `backend/`, run `mvn -q -pl common-lib install` first |
| `401` everywhere | JWT secret missing or different between terminals |
| Search shows `mongodb-fallback` | Normal — Elasticsearch is down, search still works |
| Port already in use | Old `java.exe` / `ng serve` still running — stop it or kill in Task Manager |
| ES 9.x errors on search | Version mismatch (project targets 8.11) — stop ES, use MongoDB fallback |

## 11. Verified on this machine (2026-09-17)

- ✅ `mvn -DskipTests compile` in `backend/` — all 10 modules compile.
- ✅ `ng serve` in `frontend/` — app serves on http://localhost:4200 (Angular `app-root` confirmed).
- ✅ No Docker files or references left in the repo.
- ✅ MongoDB 8.3 running manually (`--dbpath D:\mongo-data`), ping `{ ok: 1 }`.
- ✅ `mongosh --file seed/mongo_seed.js` — Seeded categories: 5, products: 20.
- ✅ `mongosh` 2.11.1 installed per-user + added to user PATH (reopen terminal to use bare `mongosh`).
- ⬜ Gateway/Eureka/microservices not started yet — next step is §5 (JWT secret + `mvn spring-boot:run`, eureka first).
