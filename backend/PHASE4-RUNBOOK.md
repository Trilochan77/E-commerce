# Phase 4 — Angular Storefront + Admin Console: runbook

## What was scaffolded
`frontend/` — Angular 17 standalone-components SPA (no NgModules), all screens from SRS §4.1:

| Route | Component | Backend used |
|---|---|---|
| `/register`, `/login` | Register/Login (+ demo admin hint) | user-service; JWT in localStorage, admin → `/admin` |
| `/` | Home: category chips, product grid, **Recommended for You** rail | product-service, recommendation-service |
| `/products`, `/products/:id` | Search + category filter + sort; detail logs **VIEW** activity, **Based on Your Activity** rail | search-service (`X-User-Id` auto-logs SEARCH), activity API |
| `/cart`, `/checkout` | Qty edit/remove; wallet balance + points input + COD/UPI/CARD mock pay | cart-service, order-service, wallet API |
| `/orders` | History with per-item **Return** link on DELIVERED orders | order-service |
| `/returns/new`, `/returns` | Estimate preview + disclaimer → submit; status timeline (7 states, est vs final) | return-reward-service |
| `/wallet` | Balance + EARNED/USED history | return-reward-service |
| `/profile` | View/edit profile, browsing history | user-service, activity API |
| `/admin` (ADMIN only) | Tabs: Products CRUD, Categories, Orders (+status → DELIVERED unlocks returns), Returns (+advance + evaluate & credit), Users | product/order/return/user services |

**Supporting backend additions (Phase 4):** `GET /api/users` (ADMIN list, no password hashes) and `GET /api/orders` (ADMIN list) — both already covered by gateway route predicates, no gateway change.

## Run (dev)
```powershell
cd frontend
npm install
npm start   # http://localhost:4200 — gateway must run on :8080
```
Full stack (native): start MongoDB + Elasticsearch, then run each backend service with `mvn -q -pl backend/<svc> spring-boot:run` (eureka first, gateway last), then frontend below on :4200.

## Manual E2E (mirrors the 5-min acceptance demo + SRS §6)
1. Register customer → search "headphones" → open product → recommendations update on Home.
2. Add to cart → checkout (optionally apply points) → pay → order in history, stock drops.
3. Admin (`admin@shop.com / Admin@123`): Products → add item; Orders → set DELIVERED.
4. Customer: Orders → Return → claim LIKE_NEW → estimated → submit → track in Returns.
5. Admin: Returns → advance to UNDER_INSPECTION → Evaluate as GOOD → wallet credited.
6. Customer: Wallet shows EARNED; redeem on next checkout (USED tx).

## Notes
- API base is hardcoded to `http://localhost:8080` in `shop.service.ts` / `auth.service.ts` (MVP; move to `environment.ts` for staging/prod).
- Admin writes send `X-Role: ADMIN` (gateway JWT role-check is future hardening).
- Node 20 LTS recommended (`nvm use 20`); Node 24 works for `ng serve` in most cases.

## Exit criteria
- [ ] `npm install && npm run build` succeeds
- [ ] Login/register/me round-trip; admin sees Admin tab, customer doesn't
- [ ] Search → detail → Home recommendations change; cold-start shows popular
- [ ] Cart → checkout → order → DELIVERED → return → evaluate → wallet → redeem, all in UI

## Project status — ALL PHASES COMPLETE
Phase 0 infra/discovery/gateway → Phase 1 commerce → Phase 2 recommendations → Phase 3 return & reward → Phase 4 storefront. Remaining future work per SRS §8: ML recommendations, AI image condition eval, mobile app, analytics, notifications.
