# AI-Powered Personalized E-Commerce Recommendation System — Implementation Guide

> Derived from SRS v1.0 dated 2026-08-21 (CUTM BBSR). Stack: Angular + Spring Boot Microservices + MongoDB + Elasticsearch.

---

## 1. Project Overview

Build a web-based e-commerce platform with two differentiators:

1. **Personalized Recommendations** based on browsing history + search activity + purchase history, with fallback to popularity / category-based for cold-start users.
2. **Condition-Based Product Return & Reward System** — only for products purchased **through this platform** and flagged `isEligibleForReturn=true`. Shows **estimated reward** at request time, **final reward** after admin inspects and verifies condition. Points go to a **Reward Wallet** and can be redeemed on future purchases.

### 1.1 Actors
- **Customer:** register/login, browse/search/filter/sort, view recommendations, cart, checkout+payment, order history/tracking, return request, return status, wallet + transactions, use points, profile.
- **Administrator:** manage users, products, categories, orders, returns, condition evaluation, approve/reject rewards, view reward transactions.

### 1.2 Tech Stack (per SRS §5.2)
| Layer | Technology |
|---|---|
| Frontend | Angular 17+ (SPA), Node.js 20+, Angular Material / Bootstrap |
| Backend | Java 17+, Spring Boot 3.x, Spring Cloud Gateway, Spring Cloud Eureka, Spring Security + JWT, Spring Data MongoDB, Spring Data Elasticsearch |
| DB | MongoDB 7+ (port 27017) |
| Search | Elasticsearch 8+ (port 9200) |
| Auth | JWT (access + refresh), BCrypt |
| Payment | Mock/Strategy interface (COD + UPI/Card mock, pluggable Razorpay/Stripe later) |
| DevOps | Git, Postman, Maven, npm |
| IDE | VS Code (frontend), IntelliJ IDEA (backend) |
| Min HW | i3+, 4GB RAM (8GB+ recommended for all microservices), 10GB disk |

---

## 2. System Architecture (SRS §7.7, 7.8, 7.9)

```
[ Angular SPA (Browser) ]
        | HTTPS / REST / JSON
        v
[ Spring Cloud API Gateway :8080 — routing, JWT validation, CORS, rate-limit ]
        |
        +---> user-service        :8081
        +---> product-service     :8082
        +---> search-service      :8083
        +---> recommendation-svc  :8084
        +---> cart-service        :8085
        +---> order-service       :8086
        +---> return-reward-svc   :8087
        +---> admin-service       :8088 (or collapse into respective services + ADMIN role guard)
        +---> eureka-server       :8761
              |
              +---> MongoDB (27017): users, products, categories, carts, orders, browsing_history, search_activity, return_requests, reward_wallets, reward_transactions
              +---> Elasticsearch (9200): products index
```

**Deployment (SRS §7.9):**
- Node 1 — Client Workstation: browser + Angular SPA (`ng serve` on :4200).
- Node 2 — Application Server Cluster (JVM, Maven): Gateway + 7-8 Spring Boot services (each `mvn spring-boot:run`) + Eureka.
- Node 3 — Database Server: MongoDB (native install or Atlas).
- Node 4 — Search Server: Elasticsearch cluster (native install or Elastic Cloud).

---

## 3. Monorepo Layout

```
/
├── IMPLEMENTATION.md              # this file
├── frontend/                      # Angular app
│   └── src/app/
│       ├── core/ (auth.guard, jwt.interceptor, api.service)
│       ├── features/
│       │   ├── auth/ (register, login)
│       │   ├── home/ (Recommended for You, Based on Your Activity)
│       │   ├── catalog/ (product-list, product-detail, search-filter-sort)
│       │   ├── cart/ checkout/ orders/ (history, tracking)
│       │   ├── returns/ (return-request, return-status)
│       │   ├── wallet/ (reward-wallet, reward-transactions)
│       │   ├── profile/ (profile, browsing-history)
│       │   └── admin/ (dashboard, products, categories, users, orders, returns, condition-eval, rewards)
│       └── shared/ (product-card, reward-badge, status-chip)
├── backend/
│   ├── eureka-server/
│   ├── api-gateway/               # application.yml routes per service
│   ├── user-service/
│   ├── product-service/
│   ├── search-service/
│   ├── recommendation-service/
│   ├── cart-service/
│   ├── order-service/
│   ├── return-reward-service/
│   └── common-lib/                # shared DTOs, JWT util, exceptions, Feign clients
├── postman/                       # collection per service
└── seed/                          # mongo seed (users, categories, products), ES bulk index script
```

Each Spring Boot service standard layout:
```
src/main/java/com/ecom/<svc>/{controller,service,dto,entity,repository,config,exception,client}
src/main/resources/application.yml
```

---

## 4. Data Model (SRS §7.3, 7.6, 7.10)

MongoDB collections (logical ER — implement as `@Document`):

### 4.1 `users`
```js
{ _id: "U-102", name, email: unique+indexed, passwordHash, phone, address,
  role: "CUSTOMER|ADMIN", createdAt }
```

### 4.2 `categories`
```js
{ _id: "C-01", name: unique, description }
```

### 4.3 `products`
```js
{ _id: "P-1003", name, description, price: Number, categoryId: FK,
  images: [url], stockQuantity: Number, availability: bool (derived stock>0),
  isEligibleForReturn: bool, createdAt, updatedAt }
```
- On create/update/delete → publish event / sync to Elasticsearch (SRS §3.1.20).

### 4.4 Elasticsearch `products` index
```json
{ "product_id": "P-1003", "name": "", "description": "", "category": "",
  "price": 0, "availability": true, "popularityScore": 0 }
```
Use edge-ngram + standard analyzer for keyword search, term+range filters, sort by `price | popularity | newest`.

### 4.5 `carts`
```js
{ _id: "C-501", userId: FK unique, items: [{ productId: FK, quantity, unitPrice }], totalAmount, updatedAt }
```

### 4.6 `orders`
```js
{ _id: "ORD-9021", userId: FK, items: [{ productId, quantity, price }],
  subTotal, pointsUsed, discountValue, payableAmount, paymentMethod, paymentStatus: "PENDING|PAID|FAILED",
  orderStatus: "PLACED|SHIPPED|DELIVERED|CANCELLED",
  orderDate, purchaseDate }
```

### 4.7 `browsing_history` + `search_activity` (can be one `user_activities`)
```js
// browsing_history
{ _id, userId: FK indexed, productId: FK, viewedAt }
// search_activity
{ _id, userId: FK indexed, keyword, filters, createdAt }
// unified alternative recommended for Recommendation Service:
{ _id, userId, type: "VIEW|SEARCH|PURCHASE", productId?, keyword?, categoryId?, timestamp }
```

### 4.8 `return_requests`
```js
{ _id: "RET-301", userId: FK, orderId: FK, productId: FK, quantity,
  reason, claimedCondition: "LIKE_NEW|GOOD|FAIR|POOR",
  estimatedReward: Number,
  verifiedCondition: "LIKE_NEW|GOOD|FAIR|POOR|NOT_ELIGIBLE|null",
  finalReward: Number|null,
  status: "REQUESTED|APPROVED|PRODUCT_RECEIVED|UNDER_INSPECTION|APPROVED_FOR_REWARD|REJECTED|COMPLETED",
  adminNote, createdAt, updatedAt }
```

### 4.9 `reward_wallets`
```js
{ _id: "W-102", userId: FK unique, pointBalance: Number, updatedAt }
```

### 4.10 `reward_transactions`
```js
{ _id: "TX-7712", walletId: FK indexed, userId: FK, type: "EARNED|USED",
  points: Number, relatedOrderId?, relatedReturnId?, createdAt }
```

**Relationships:** User 1—N Orders, User 1—1 Wallet, Wallet 1—N Transactions, User 1—1 Cart, Cart N—N Products (via items), Order N—N Products, Return N—1 Order+Product, Category 1—N Products.

---

## 5. Business Rules (must enforce)

### 5.1 Recommendation Engine (SRS §3.1.10, 3.1.24, 3.1.25)
1. Collect VIEW + SEARCH + PURCHASE events (async POST from frontend on view/search; order-service emits PURCHASE event on order success).
2. Scoring (v1, no ML lib required — explainable, satisfies SRS):
   - `score(p) = 3×purchaseCategoryMatch + 2×viewCount + 2×searchKeywordMatch + 1×popularity`
   - Exclude out-of-stock and already-purchased (optional toggle).
   - Cold start (no activity): return top-N by `popularityScore` (order count) + same-category sampling.
3. API: `GET /api/recommendations/{userId}?limit=10` → returns products with name/image/price/category.
4. Display slots: Home → "Recommended for You", Product Detail → "Based on Your Activity". Refresh on new activity.
5. Future (SRS §8): collaborative filtering / ML, real-time streaming.

### 5.2 Condition-Based Return & Reward (SRS §3.1.13–3.1.18, 3.1.29–3.1.30)
**Eligibility check (reject otherwise):**
- Order exists, belongs to user, status DELIVERED, within return window (e.g., 14 days — define in `application.yml`), product.`isEligibleForReturn==true`, no prior non-rejected return for same order+product.

**Condition categories (define once, use everywhere):**
| Condition | Meaning | Reward multiplier (of product price) |
|---|---|---|
| LIKE_NEW | unused, sealed/packed | 80% |
| GOOD | light use, fully functional | 60% |
| FAIR | visible wear, functional | 40% |
| POOR | heavy wear, partial function | 10% |
| NOT_ELIGIBLE (admin only) | damaged/ineligible/fake | 0% |

**Formulas (configurable `reward.rules.*`):**
- `estimatedReward = floor(price × qty × multiplier(claimedCondition) × pointRate)` where `pointRate` e.g. 1 pt per ₹1 (1:1). Show disclaimer: *"Estimated only, may change after inspection."*
- `finalReward = floor(price × qty × multiplier(verifiedCondition) × pointRate)`; if `NOT_ELIGIBLE` → 0.
- On `APPROVED_FOR_REWARD` → credit wallet + insert `EARNED` transaction. Wallet update must be transactional/idempotent.

**Status flow:** `REQUESTED → APPROVED → PRODUCT_RECEIVED → UNDER_INSPECTION → APPROVED_FOR_REWARD|REJECTED → COMPLETED` (SRS §3.1.29).

### 5.3 Reward Wallet & Redemption (SRS §3.1.11, 3.1.17, 3.1.18, 3.1.28)
- `1 point = ₹1` (configurable `reward.pointValueRupees=1`). Cap usage e.g. max 20% of order subtotal (configurable).
- Checkout shows balance, input for points to apply; validate `0 < points ≤ balance` and `≤ cap`; compute `payable = subTotal − points×value`.
- On order `PAID` → deduct wallet + insert `USED` transaction. Never allow negative balance (optimistic lock / atomic `$inc` with `balance >= points` guard).
- Cart must re-validate stock (`qty ≤ stockQuantity`) on add/update/checkout; decrement stock on order success.

---

## 6. API Contracts (via Gateway :8080)

### user-service `/api/users`
- `POST /register {name,email,password,phone,address}` → 201 + wallet auto-create
- `POST /login {email,password}` → `{token, refreshToken, userId, role}`
- `GET /me` (JWT), `PUT /me`, `GET /{id}/orders-summary` (profile shows orders+rewards — call order/reward services or aggregate in frontend)

### product-service `/api/products` + `/api/categories`
- `GET /?category=&minPrice=&maxPrice=&sort=&page=&size=` (fallback when ES down)
- `GET /{id}`, `POST /` (ADMIN), `PUT /{id}` (ADMIN), `DELETE /{id}` (ADMIN) + ES reindex hook
- `GET /{id}/availability`, `PUT /{id}/stock {delta}` (internal, called by order-service)
- Categories: `GET /api/categories`, `POST /` (ADMIN), `PUT /{id}` (ADMIN), `DELETE /{id}` (ADMIN)

### search-service `/api/search` (Elasticsearch)
- `GET /search?q=&category=&minPrice=&maxPrice=&sort=price_asc|price_desc|popular&page=&size=`
- Logs `SEARCH` activity → recommendation-service (async, fire-and-forget).
- Filtering + sorting per SRS §3.1.6.

### recommendation-service `/api/recommendations`
- `POST /activity {userId,type,productId?,keyword?}` (internal, from UI/gateway)
- `GET /{userId}?limit=10`
- `GET /browsing-history/{userId}` (for profile page)

### cart-service `/api/cart`
- `GET /{userId}`, `POST /{userId}/items {productId,quantity}`, `PUT /{userId}/items/{productId} {quantity}`, `DELETE /{userId}/items/{productId}`, `DELETE /{userId}/clear`, returns `totalAmount` + reward-discount preview if `?applyPoints=N`

### order-service `/api/orders`
- `POST /checkout {userId,paymentMethod,pointsToUse}` → validates cart+stock+wallet cap → mock payment → creates order (unique ID `ORD-xxxx`), decrements stock, clears cart, deducts wallet+`USED` tx, emits PURCHASE activity. Returns order.
- `GET /user/{userId}` (history), `GET /{orderId}` (tracking), `PUT /{orderId}/status` (ADMIN)

### return-reward-service `/api/returns` + `/api/wallet` + `/api/rewards`
- `POST /returns {userId,orderId,productId,quantity,reason,claimedCondition}` → eligibility check → returns `{returnId, estimatedReward, disclaimer}` + status REQUESTED
- `GET /returns/user/{userId}`, `GET /returns/{id}`, `GET /returns?status=` (ADMIN)
- `PUT /returns/{id}/status {status, adminNote}` (ADMIN workflow driver)
- `PUT /returns/{id}/evaluate {verifiedCondition, adminNote}` (ADMIN) → computes finalReward; if APPROVED_FOR_REWARD → credit wallet + EARNED tx
- `GET /wallet/{userId}` → `{balance}`, `GET /rewards/transactions/{userId}`, `GET /rewards/estimate?productId=&condition=` (pre-submit preview)

All error bodies: `{ timestamp, status, error, message, path }`. Use `401/403/404/409/422` correctly. Paginate lists.

---

## 7. Frontend Pages & Routes (SRS §4.1)

| Route | Component | Key features |
|---|---|---|
| `/register`, `/login` | Auth | validation, duplicate-email guard, JWT store, role redirect |
| `/` | Home | hero, category chips, product grid, "Recommended for You" (auth), "Based on Your Activity" |
| `/products?q=&category=` | Product List | ES search bar, filters (category, price), sort, stock badge |
| `/products/:id` | Product Detail | name/desc/price/category/stock/images, qty stepper, Add to Cart, recommendations rail, logs VIEW activity |
| `/cart` | Cart | qty edit/remove, total, points preview |
| `/checkout` | Checkout | items, subtotal, wallet balance + apply-points, payment method select, payable, Pay |
| `/orders`, `/orders/:id` | Orders | ID/items/amount/date/status, "Return" button per eligible item |
| `/returns/new?order=&product=` | Return Request | reason + claimed condition select → estimated reward preview + disclaimer → submit |
| `/returns`, `/returns/:id` | Return Status | status timeline (REQUESTED…COMPLETED), estimated vs final |
| `/wallet` | Wallet | balance, EARNED/USED history table |
| `/profile` | Profile | view/edit, order + reward shortcuts, browsing history |
| `/admin` | Dashboard | counts (users/products/orders/pending returns/points issued) |
| `/admin/products`, `/admin/categories`, `/admin/users`, `/admin/orders`, `/admin/returns`, `/admin/rewards` | Admin CRUD | product form (incl. `isEligibleForReturn`, stock), condition evaluator (`verifiedCondition` + approve/reject), reward tx viewer |

Guards: `AuthGuard` (all except browse/search), `AdminGuard` (`/admin/**`). Interceptor attaches JWT, handles 401. Toasts for success/error/invalid.

---

## 8. Workflows to Implement (SRS §6)

**E-commerce:** Register/Login → Browse/Search (log activity) → Recommendations → Add to Cart → Checkout (apply points) → Mock Payment → Create Order → Update purchase history → feed Recommendation Service.
**Return & Reward:** Pick eligible item from Order History → Submit return (claimed condition) → eligibility verify → show estimated → confirm → warehouse receives → admin evaluates actual condition → compute final → credit wallet → redeem on future purchase → record in tx history.

---

## 9. Build Order (phased, demo-safe)

**Phase 0 — Bootstrap (0.5 day):** git repo, native Mongo + Elasticsearch setup, eureka, gateway routes, JWT in `common-lib`, Postman collection skeleton, seed data (5 categories, 20+ products, 1 admin + 2 customers).
**Phase 1 — Core commerce:** user-service (auth+wallet auto-create) → product-service (+ ES index job) → search-service → cart-service → order-service (mock payment + stock + wallet deduct).
**Phase 2 — Intelligence:** activity logging (view/search/purchase) → recommendation-service scoring + cold-start + UI rails.
**Phase 3 — Return & Reward:** return-reward-service (eligibility, estimate, evaluate, final, wallet credit, tx history) + customer + admin UI + status tracker.
**Phase 4 — Admin + polish:** admin dashboard/CRUD, validation, error toasts, pagination, NFRs (caching, indexes, rate-limit), README + demo script.

**MVP cut (if short on time):** merge cart+order into one service, merge admin into gateway role-checks, mock payment = always succeed with `FAILED` toggle for testing §3.1.28.

---

## 10. Config & Dev Commands

Native service config essentials: MongoDB 7, Elasticsearch 8.11 (`discovery.type=single-node`, `xpack.security.enabled=false` for dev), eureka, gateway, each `*-service` with `SPRING_DATA_MONGODB_URI`, `ELASTICSEARCH_URIS`, `JWT_SECRET`, `REWARD_*` props.

```bash
# infra (native mongod + elasticsearch running locally)
mongosh --eval "db.adminCommand('ping')"
curl http://localhost:9200/_cluster/health
# backend (per service, one terminal each)
./mvnw spring-boot:run   # or: mvn spring-boot:run -pl user-service
# frontend
cd frontend; npm install; ng serve   # http://localhost:4200
# seed
mongosh < seed/mongo_seed.js
curl -X POST localhost:8083/api/search/reindex
```

Default ports: gateway 8080, user 8081, product 8082, search 8083, recommendation 8084, cart 8085, order 8086, return-reward 8087, eureka 8761, frontend 4200.

Reward tuning (`application.yml` in return-reward-service):
```yaml
reward:
  point-value-rupees: 1
  max-redeem-percent: 20
  return-window-days: 14
  multipliers: { LIKE_NEW: 0.8, GOOD: 0.6, FAIR: 0.4, POOR: 0.1, NOT_ELIGIBLE: 0.0 }
```

Seed admin: `admin@shop.com / Admin@123 (ADMIN)`; customers for demo.

---

## 11. Testing Checklist (traceable to SRS §3.1.1–3.1.30)

- [ ] Register duplicate email → 409; login wrong pwd → 401; non-admin hits `/admin` → 403.
- [ ] Search via ES returns ranked results; filter/sort correct; product CRUD reindexes.
- [ ] VIEW/SEARCH logged; recommendations change after activity; cold-start user gets popular items.
- [ ] Cart blocks `qty > stock`; checkout with points reduces payable; wallet deducted + USED tx; stock decremented; purchase history updated.
- [ ] Payment failure → order NOT created, user notified.
- [ ] Return for external/non-eligible product → rejected; estimated shown + disclaimer stored; admin verifies GOOD after LIKE_NEW claim → final < estimated; NOT_ELIGIBLE → 0 pts, REJECTED.
- [ ] Wallet: cannot spend > balance; EARNED on approval; history shows type/points/date/order.
- [ ] Status timeline traverses all 7 states; user sees estimated vs final.

---

## 12. NFR Notes (SRS §3.2)
Performance (ES + Mongo indexes on `email, userId, productId, categoryId`), usability (responsive Angular), reliability (Bean Validation + atomic wallet ops), security (BCrypt, JWT, role guards, no stack traces to client), scalability/maintainability (independent services), availability (health checks `/actuator/health`), portability (Chrome/Firefox/Edge).

## 13. Out of Scope / Constraints
Internet required; only registered users order/earn; only platform purchases eligible; estimated ≠ final until inspection; manual admin inspection in v1 (no AI image eval — listed as future work with mobile app, analytics, notifications, advanced ML).

---

## 14. Acceptance Demo Script (5 min)
1. Login as customer → search "headphones" → open product (logs activity) → see recommendations update.
2. Add to cart → checkout applying 200 pts → pay → order appears in history + stock drops.
3. From order history → Return → claim LIKE_NEW → see estimated (e.g., 350) → submit.
4. Login as admin → Returns → evaluate as GOOD → approve → final (e.g., 300) credited.
5. As customer → Wallet shows +300 EARNED, usable on next checkout.
