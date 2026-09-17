# Phase 3 — Condition-Based Return & Reward: runbook

## What was scaffolded
`return-reward-service:8087` (gateway routes `/api/returns/**`, `/api/wallet/**`, `/api/rewards/**` already existed — no gateway change).

| Endpoint | Purpose (SRS) |
|---|---|
| POST /api/returns {userId,orderId,productId,quantity,reason,claimedCondition} | Eligibility verify + estimated reward + REQUESTED (§3.1.13–3.1.14) |
| GET /api/returns/user/{userId}, GET /api/returns?status=, GET /api/returns/{id} | Return tracking (§3.1.29) |
| PUT /api/returns/{id}/status {status,adminNote} | State machine driver (illegal jumps → 422) |
| PUT /api/returns/{id}/evaluate {verifiedCondition,adminNote} (`X-Role: ADMIN`) | Condition eval + final reward + wallet credit, exactly once (§3.1.15–3.1.16) |
| GET /api/wallet/{userId} | Balance (§3.1.17) |
| GET /api/rewards/transactions/{userId} | EARNED/USED history (§3.1.30) |
| GET /api/rewards/estimate?productId=&quantity=&condition= | Pre-submit preview with disclaimer |

**Eligibility (all must pass):** order exists + belongs to user + PAID + DELIVERED + within 14-day window + product in order + qty ≤ purchased + `isEligibleForReturn` + no active (non-REJECTED) return for same item. External-platform products are ineligible by construction — only platform orders exist.

**Rewards:** `LIKE_NEW 80% / GOOD 60% / FAIR 40% / POOR 10% / NOT_ELIGIBLE 0%` × price × qty (`reward.*` in application.yml). Estimated uses claimed condition; final uses verified. NOT_ELIGIBLE → REJECTED + 0 pts.

**States:** `REQUESTED → APPROVED → PRODUCT_RECEIVED → UNDER_INSPECTION → APPROVED_FOR_REWARD|REJECTED → COMPLETED`. Direct jump to APPROVED_FOR_REWARD via status endpoint is blocked (must evaluate); re-evaluate after finalization → 409.

## Run (native)
```powershell
mvn -q -pl backend/return-reward-service spring-boot:run
# import postman/ecom-phase3.json → run folders 1→5 in order
```

## Manual E2E (SRS §6.2, mirrors the 5-min acceptance demo)
1. Buy P-1001 (cart → checkout COD), mark order DELIVERED, preview estimate for LIKE_NEW (≈1999).
2. Submit return claiming LIKE_NEW → `estimatedReward` + disclaimer, status REQUESTED. Duplicate → 409.
3. Admin: APPROVED → PRODUCT_RECEIVED → UNDER_INSPECTION (jump straight to COMPLETED → 422).
4. Evaluate GOOD (admin) → final < estimated, status APPROVED_FOR_REWARD, wallet +EARNED tx. Re-evaluate → 409.
5. Wallet shows balance; redeem 100 pts on next checkout (payable −₹100, USED tx).

## Exit criteria
- [ ] Non-DELIVERED / ineligible / duplicate / over-qty submits rejected (422/409)
- [ ] Estimated shown with disclaimer; final differs by verified condition; NOT_ELIGIBLE → 0 + REJECTED
- [ ] Wallet credited exactly once; history shows EARNED then USED after redeem
- [ ] Status timeline traverses all 7 states to COMPLETED

## Next → Phase 4 (frontend + admin console)
Angular SPA: auth, home with "Recommended for You" / "Based on Your Activity" rails (POST VIEW on detail open, `X-User-Id` on search), cart/checkout with points widget, orders with per-item Return button, return-status timeline, wallet page, admin dashboard + CRUD + condition evaluator. All APIs already live.
