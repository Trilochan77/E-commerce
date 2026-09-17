# Phase 1 — Core Commerce: runbook

## What was scaffolded
| Service | Port | Endpoints |
|---|---|---|
| user-service | 8081 | POST /api/users/register (409 on duplicate, auto-creates wallet), POST /api/users/login (auto-creates demo admin `admin@shop.com/Admin@123`), GET+PUT /api/users/me (Bearer JWT) |
| product-service | 8082 | GET /api/products?category=, GET /api/products/{id}, POST/PUT/DELETE (header `X-Role: ADMIN`), GET /{id}/availability, PUT /{id}/stock {delta}, /api/categories CRUD |
| search-service | 8083 | GET /api/search?q=&category=&minPrice=&maxPrice=&sort=price_asc\|price_desc&page=&size= (+ `X-User-Id` header feeds Phase-2 activity), POST /api/search/reindex (Mongo→ES bulk) |
| cart-service | 8085 | GET /api/cart/{userId}, POST /{userId}/items {productId,quantity} (409 if qty>stock), PUT /{userId}/items/{productId}, DELETE .../clear |
| order-service | 8086 | POST /api/orders/checkout {userId,paymentMethod,pointsToUse} (402 on mock-pay fail, NO order; validates stock, wallet cap 20%), GET /api/orders/user/{userId}, GET /api/orders/{orderId}, PUT /{orderId}/status |

MVP simplifications (documented, split in later phases):
- Shared `ecom` Mongo DB across services (no Feign auth); product/cart read via REST, wallet/cart read directly from collections.
- Admin guard = `X-Role: ADMIN` header (gateway JWT role-check lands in Phase 2).
- `1 point = ₹1`, max 20% of subtotal redeemable (`reward.max-redeem-percent`).
- ES calls are best-effort with Mongo fallback — search works even with ES down.

## Run (native, one terminal per service)
```powershell
# needs: Maven + running MongoDB + Elasticsearch (winget install Apache.Maven)
mvn -q -pl backend/common-lib install
# then in separate terminals:
# mvn -q -pl backend/eureka-server spring-boot:run
# mvn -q -pl backend/api-gateway spring-boot:run
# mvn -q -pl backend/user-service spring-boot:run
# mvn -q -pl backend/product-service spring-boot:run
# ... repeat for search-service, cart-service, order-service
mongosh --file seed/mongo_seed.js
curl -X POST http://localhost:8083/api/search/reindex
# import postman/ecom-phase1.json → run folders 1→4 in order
```

## Manual E2E (5 min, maps to SRS §6.1 steps 1-10)
1. Register → copy `userId` + `token` into Postman vars.
2. `GET /api/products` → pick `productId` (e.g. P-1001, stock 50).
3. `GET /api/search?q=headphones` → `source: elasticsearch` (or `mongodb-fallback` if ES down — still passes).
4. Cart add qty 2 → get cart → total = 2×price.
5. Checkout COD → order `PAID/PLACED`, cart empty, product stock −2.
6. Order history shows order; `FAIL` checkout returns 402 and creates no PAID order.
7. Exceed stock (qty 9999) → 409. Duplicate register → 409. Bad login → 401.

## Exit criteria
- [ ] Register/login/me round-trip; duplicate → 409
- [ ] Search returns ranked hits; reindex reports `indexed: 20`
- [ ] Cart blocks over-stock; checkout decrements stock, clears cart, deducts wallet + writes USED tx when points used
- [ ] Payment FAIL → 402, no PAID order (SRS §3.1.28)

## Next → Phase 2 (recommendations)
`recommendation-service` (8084): `POST /api/activity` collector (VIEW/SEARCH/PURCHASE), `GET /api/recommendations/{userId}`, browsing-history endpoint, Home rails "Recommended for You". Search + order services already emit activity events (currently fire-and-forget, no-op until then).
