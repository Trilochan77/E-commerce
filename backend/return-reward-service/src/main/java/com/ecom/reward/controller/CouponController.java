package com.ecom.reward.controller;

import com.ecom.reward.dto.CouponConfirmRequest;
import com.ecom.reward.dto.CouponQuoteRequest;
import com.ecom.reward.service.CouponService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards/coupons")
public class CouponController {

  private final CouponService svc;

  public CouponController(CouponService svc) {
    this.svc = svc;
  }

  /** Preview a code for the current cart subtotal (no usage is consumed). */
  @PostMapping("/validate")
  public Map<String, Object> validate(@Valid @RequestBody CouponQuoteRequest req) {
    return svc.validate(req.userId().trim(), req.code(), req.subTotal());
  }

  /** Hold the coupon while payment is in flight. Called by order-service. */
  @PostMapping("/reserve")
  public CouponService.Reservation reserve(@Valid @RequestBody CouponQuoteRequest req) {
    return svc.reserve(req.userId().trim(), req.code(), req.subTotal());
  }

  /** Consume the hold after the order has been saved. */
  @PostMapping("/{reservationId}/confirm")
  public Map<String, Object> confirm(@PathVariable String reservationId,
      @Valid @RequestBody CouponConfirmRequest req) {
    return svc.confirm(reservationId, req.orderId());
  }

  /** Drop the hold after a failed payment / abandoned checkout. */
  @PostMapping("/{reservationId}/release")
  public Map<String, Object> release(@PathVariable String reservationId) {
    return svc.release(reservationId);
  }

  @GetMapping("/user/{userId}")
  public List<Map<String, Object>> mine(@PathVariable String userId) {
    return svc.couponsForUser(userId);
  }

  /* ------------------------------------------------------------------ */
  /* Admin Coupon Management                                            */
  /* ------------------------------------------------------------------ */

  @GetMapping("/admin/all")
  public List<com.ecom.reward.entity.Coupon> adminAll() {
    return svc.allCoupons();
  }

  @PostMapping("/admin/create")
  public com.ecom.reward.entity.Coupon adminCreate(@RequestBody com.ecom.reward.entity.Coupon c) {
    return svc.createAdminCoupon(c);
  }

  @DeleteMapping("/admin/{id}")
  public Map<String, Object> adminDelete(@PathVariable String id) {
    svc.deleteCoupon(id);
    return Map.of("status", "DELETED", "id", id);
  }
}
