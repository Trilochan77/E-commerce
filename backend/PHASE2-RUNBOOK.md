# Phase 2 — Personalized Recommendations: runbook

## What was scaffolded
`recommendation-service:8084` (gateway routes `/api/recommendations/**`, `/api/activity/**` already existed — no gateway change).

| Endpoint | Purpose (SRS) |
|---|---|
| POST /api/activity {userId, type: VIEW\|SEARCH\|PURCHASE, productId?, keyword?, categoryId?, orderId?} | Activity collector (§3.1.24); VIEW auto-enriched with product category |
| GET /api/recommendations/{userId}?limit=&includePurchased= | Personalized list with `score` + `reasons` per item (§3.1.10, §3.1.25) |
| GET /api/activity/history/{userId}?limit= | Browsing history, VIEW events enriched with name/price/image (§3.1.7) |

**Scoring (IMPLEMENTATION.md §5.1):** `score = 3×purchaseCategoryMatch + 2×viewCount + 2×searchKeywordMatch + 1×popularity` (popularity = # PAID orders containing product, global). Out-of-stock excluded; purchased items excluded by default (`includePurchased=true` overrides); no activity → `coldStart: true`, popularity fallback.

**Auto-wiring already live:** search-service logs SEARCH when `X-User-Id` header present; order-service logs PURCHASE on checkout — both fire-and-forget, no-ops until this service runs.

## Run (native)
```powershell
mvn -q -pl backend/recommendation-service spring-boot:run
# import postman/ecom-phase2.json → run folders 1→5 in order
```

## Manual E2E (maps to SRS §6.1 steps 3-4)
1. Fresh user → `recommendations` returns `coldStart: true`, strategy `popularity-fallback`.
2. Log VIEW P-1001 ×2 + SEARCH "headphones" → recommendations flip to `personalized`; P-1001 (or same-category C-01 items) tops with reasons `viewed-2x`, `matches-search`.
3. History shows 2 VIEW entries with product details.
4. Buy P-1002 (cart add → checkout COD) → recommendations exclude P-1002, boost C-01 (`same-category-as-purchases`); `includePurchased=true` brings it back.
5. `GET /api/search?q=laptop` with `X-User-Id` → subsequent recommendations gain `matches-search` for laptops without any manual POST.

## Exit criteria
- [ ] Cold-start returns popular in-stock items with `coldStart: true`
- [ ] VIEW/SEARCH change ranking + reasons; invalid type → 422; VIEW without productId → 422
- [ ] Purchase excludes bought item and boosts its category
- [ ] History endpoint returns enriched VIEWs newest-first

## Next → Phase 3 (return & reward)
`return-reward-service` (8087): eligibility check, estimated vs final reward by condition multiplier, 7-state status flow, wallet credit + EARNED tx, redemption already works via order-service. Then Phase 4: Angular frontend + admin UI.
