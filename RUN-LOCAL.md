# ⚡ Run Locally — Quick Reference

> Full setup details → [`SETUP.md`](./SETUP.md)

---

## 🚀 Daily Start (2 terminals)

### Terminal 1 — Backend
```powershell
cd D:\Project
.\start-backend.ps1
```

### Terminal 2 — Frontend
```powershell
cd D:\Project\frontend
npm start
```

---

## 🛑 Stop Everything

```powershell
cd D:\Project
.\stop-backend.ps1                 # stops API Gateway + all services (8080–8087)
.\stop-backend.ps1 -IncludeEureka  # also stops Eureka (8761)
```

---

## 🔧 Start-Backend Options

| Command | Description |
|---|---|
| `.\start-backend.ps1` | Default — runs compiled JARs (~10 s startup) |
| `.\start-backend.ps1 -Mode jar` | Explicit JAR mode (same as default) |
| `.\start-backend.ps1 -Mode maven` | Runs via `mvn spring-boot:run` (slower) |
| `.\start-backend.ps1 -KeepAlive` | Keeps terminal alive as a daemon |

---

## 📋 Service Port Map

| Service | Port |
|---|---|
| Eureka Server | 8761 |
| API Gateway | 8080 |
| User Service | 8081 |
| Product Service | 8082 |
| Search Service | 8083 |
| Recommendation Service | 8084 |
| Cart Service | 8085 |
| Order Service | 8086 |
| Return & Reward Service | 8087 |
| Frontend (Angular) | 4200 |

---

## ✅ Quick Verify URLs

| Check | URL |
|---|---|
| Eureka Dashboard | http://localhost:8761 |
| Gateway Health | http://localhost:8080/actuator/health |
| Products (via Gateway) | http://localhost:8080/api/products |
| Categories (via Gateway) | http://localhost:8080/api/categories |
| Frontend | http://localhost:4200 |

---

## ⚠️ Prerequisites (first time only)

1. **MongoDB** must be running on port `27017` (service-only — backend just connects)
   ```powershell
   # Admin PowerShell (one time; stays Automatic after):
   Set-Service MongoDB -StartupType Automatic
   Start-Service MongoDB
   ```

2. **Seed the database** (once):
   ```powershell
   cd D:\Project
   mongosh --file seed/mongo_seed.js
   ```

3. **Build JARs** (once, or after code changes):
   ```powershell
   cd D:\Project\backend
   mvn clean install -DskipTests
   ```

---

## 🪵 Logs

Backend logs live in `backend/logs/<service-name>.log`.

```powershell
# Tail a specific service log, e.g. api-gateway:
Get-Content D:\Project\backend\logs\api-gateway.log -Wait -Tail 50
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@shop.com | Admin@123 |
