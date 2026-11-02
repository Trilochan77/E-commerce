package com.ecom.reward.service;

import com.ecom.reward.config.SpinProperties;
import com.ecom.reward.entity.Coupon;
import com.ecom.reward.entity.CouponRedemption;
import com.ecom.reward.repository.CouponRedemptionRepository;
import com.ecom.reward.repository.CouponRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Coupons are created by the Spin & Win wheel and validated/redeemed here.
 * Checkout reserves a coupon before charging and confirms it only once the
 * order exists, so failed payments never consume a coupon.
 */
@Service
public class CouponService {

  private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMM yyyy")
      .withZone(ZoneId.of("Asia/Kolkata"));

  private final CouponRepository coupons;
  private final CouponRedemptionRepository redemptions;
  private final SpinProperties spinProps;
  /** Serialises usage checks + counter updates inside this service instance. */
  private final Object lock = new Object();

  public CouponService(CouponRepository coupons, CouponRedemptionRepository redemptions,
      SpinProperties spinProps) {
    this.coupons = coupons;
    this.redemptions = redemptions;
    this.spinProps = spinProps;
  }

  public record Reservation(String reservationId, String couponId, String code, String title,
      double discount, Instant expiresAt) {}

  private record Quote(Coupon coupon, double discount) {}

  /* ------------------------------------------------------------------ */
  /* Public catalogue / preview                                          */
  /* ------------------------------------------------------------------ */

  public Map<String, Object> validate(String userId, String code, double subTotal) {
    synchronized (lock) {
      Quote q = quote(userId, code, subTotal);
      return couponView(q.coupon(), q.discount());
    }
  }

  public List<Map<String, Object>> couponsForUser(String userId) {
    List<Coupon> owned = coupons.findByOwnerUserIdOrderByCreatedAtDesc(userId);
    List<Map<String, Object>> out = new ArrayList<>();
    Instant now = Instant.now();
    for (Coupon c : owned) {
      String status;
      if (!"ACTIVE".equals(c.getStatus())) {
        status = "DISABLED";
      } else if (c.getValidUntil() != null && !now.isBefore(c.getValidUntil())) {
        status = "EXPIRED";
      } else if (redemptions.existsByCouponIdAndUserIdAndStatus(c.getId(), userId, "REDEEMED")) {
        status = "USED";
      } else {
        status = "ACTIVE";
      }
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("couponId", c.getId());
      m.put("code", c.getCode());
      m.put("title", c.getTitle());
      m.put("description", c.getDescription());
      m.put("discountLabel", discountLabel(c));
      m.put("type", c.getType());
      m.put("value", c.getValue());
      m.put("maxDiscount", c.getMaxDiscount());
      m.put("minOrderValue", c.getMinOrderValue());
      m.put("validUntil", c.getValidUntil());
      m.put("validUntilLabel", c.getValidUntil() == null ? "" : DATE.format(c.getValidUntil()));
      m.put("createdAt", c.getCreatedAt());
      m.put("source", c.getSource());
      m.put("status", status);
      out.add(m);
    }
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Checkout lifecycle: reserve -> confirm (or release)                 */
  /* ------------------------------------------------------------------ */

  public Reservation reserve(String userId, String code, double subTotal) {
    synchronized (lock) {
      Quote q = quote(userId, code, subTotal);
      Coupon c = q.coupon();
      Instant now = Instant.now();
      CouponRedemption r = new CouponRedemption();
      r.setId("RDM-" + token(8));
      r.setCouponId(c.getId());
      r.setCode(c.getCode());
      r.setUserId(userId);
      r.setDiscountAmount(q.discount());
      r.setStatus("RESERVED");
      r.setReservedAt(now);
      r.setExpiresAt(now.plus(Duration.ofMinutes(Math.max(1, spinProps.getReservationMinutes()))));
      redemptions.save(r);

      c.setReservedCount(c.getReservedCount() + 1);
      coupons.save(c);
      return new Reservation(r.getId(), c.getId(), c.getCode(), c.getTitle(), q.discount(),
          r.getExpiresAt());
    }
  }

  public Map<String, Object> confirm(String reservationId, String orderId) {
    synchronized (lock) {
      CouponRedemption r = redemptions.findById(reservationId)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
              "Coupon reservation not found"));
      if ("REDEEMED".equals(r.getStatus())) {
        if (orderId.equals(r.getOrderId())) {
          return confirmationView(r, true);
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Coupon reservation was already used by another order");
      }
      if (!"RESERVED".equals(r.getStatus())) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Coupon reservation is no longer active (" + r.getStatus() + ")");
      }
      Instant now = Instant.now();
      if (r.getExpiresAt() != null && now.isAfter(r.getExpiresAt())) {
        r.setStatus("EXPIRED");
        r.setReleasedAt(now);
        redemptions.save(r);
        decrementReserved(r.getCouponId());
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Coupon reservation expired — please retry checkout");
      }
      r.setStatus("REDEEMED");
      r.setOrderId(orderId);
      r.setRedeemedAt(now);
      redemptions.save(r);

      coupons.findById(r.getCouponId()).ifPresent(c -> {
        c.setReservedCount(Math.max(0, c.getReservedCount() - 1));
        c.setUsedCount(c.getUsedCount() + 1);
        coupons.save(c);
      });
      return confirmationView(r, false);
    }
  }

  public Map<String, Object> release(String reservationId) {
    synchronized (lock) {
      Optional<CouponRedemption> found = redemptions.findById(reservationId);
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("reservationId", reservationId);
      if (found.isEmpty()) {
        m.put("released", false);
        m.put("reason", "not found");
        return m;
      }
      CouponRedemption r = found.get();
      if (!"RESERVED".equals(r.getStatus())) {
        m.put("released", false);
        m.put("reason", "reservation is " + r.getStatus());
        return m;
      }
      r.setStatus("RELEASED");
      r.setReleasedAt(Instant.now());
      redemptions.save(r);
      decrementReserved(r.getCouponId());
      m.put("released", true);
      m.put("code", r.getCode());
      return m;
    }
  }

  /** Releases abandoned checkout holds so the coupon becomes usable again. */
  @Scheduled(fixedDelay = 60_000)
  public void releaseExpiredReservations() {
    List<CouponRedemption> stale =
        redemptions.findByStatusAndExpiresAtBefore("RESERVED", Instant.now());
    for (CouponRedemption r : stale) {
      release(r.getId());
    }
  }

  /* ------------------------------------------------------------------ */
  /* Creation (called by the wheel)                                      */
  /* ------------------------------------------------------------------ */

  public Coupon createSpinCoupon(String userId, SpinProperties.Prize prize, String spinResultId) {
    Instant now = Instant.now();
    int days = prize.getValidityDays() > 0 ? prize.getValidityDays() : spinProps.getCouponValidityDays();
    Coupon c = new Coupon();
    c.setId("CPN-" + token(8));
    c.setCode(newUniqueCode());
    c.setTitle(prize.getLabel() + " coupon");
    c.setDescription(describe(prize));
    c.setType(prize.getCouponType());
    c.setValue(prize.getValue());
    c.setMaxDiscount(prize.getMaxDiscount());
    c.setMinOrderValue(prize.getMinOrderValue());
    c.setMaxUses(prize.getMaxUses() > 0 ? prize.getMaxUses() : 1);
    c.setPerUserLimit(prize.getPerUserLimit() > 0 ? prize.getPerUserLimit() : 1);
    c.setOwnerUserId(userId);
    c.setStatus("ACTIVE");
    c.setSource("SPIN");
    c.setSpinResultId(spinResultId);
    c.setValidFrom(now);
    c.setValidUntil(now.plus(Duration.ofDays(Math.max(1, days))));
    coupons.save(c);
    return c;
  }

  public Map<String, Object> couponSummary(Coupon c) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("couponId", c.getId());
    m.put("code", c.getCode());
    m.put("title", c.getTitle());
    m.put("description", c.getDescription());
    m.put("discountLabel", discountLabel(c));
    m.put("minOrderValue", c.getMinOrderValue());
    m.put("validUntil", c.getValidUntil());
    m.put("validUntilLabel", DATE.format(c.getValidUntil()));
    return m;
  }

  /* ------------------------------------------------------------------ */
  /* Internals                                                           */
  /* ------------------------------------------------------------------ */

  private Quote quote(String userId, String code, double subTotal) {
    String normalized = code == null ? "" : code.trim().toUpperCase();
    if (normalized.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Coupon code is required");
    }
    Coupon c = coupons.findByCode(normalized)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Coupon code not found: " + normalized));
    Instant now = Instant.now();
    if (!"ACTIVE".equals(c.getStatus())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "This coupon is no longer active");
    }
    if (c.getValidFrom() != null && now.isBefore(c.getValidFrom())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "This coupon is not active yet");
    }
    if (c.getValidUntil() != null && !now.isBefore(c.getValidUntil())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "This coupon expired on " + DATE.format(c.getValidUntil()));
    }
    if (c.getOwnerUserId() != null && !c.getOwnerUserId().equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "This coupon is linked to a different account");
    }
    if (subTotal < c.getMinOrderValue()) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Minimum order of ₹" + money(c.getMinOrderValue()) + " required for this coupon"
              + " (current subtotal ₹" + money(subTotal) + ")");
    }
    long userUses = redemptions.countByCouponIdAndUserIdAndStatusIn(
        c.getId(), userId, List.of("RESERVED", "REDEEMED"));
    if (c.getPerUserLimit() > 0 && userUses >= c.getPerUserLimit()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "You have already used this coupon");
    }
    if (c.getMaxUses() > 0 && c.getUsedCount() + c.getReservedCount() >= c.getMaxUses()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "This coupon has reached its usage limit");
    }
    double discount = discountFor(c, subTotal);
    if (discount <= 0) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "This coupon does not apply to the current cart");
    }
    return new Quote(c, discount);
  }

  private double discountFor(Coupon c, double subTotal) {
    double d = "FLAT".equals(c.getType()) ? c.getValue() : subTotal * c.getValue() / 100.0;
    if ("PERCENT".equals(c.getType()) && c.getMaxDiscount() > 0) {
      d = Math.min(d, c.getMaxDiscount());
    }
    return round2(Math.max(0, Math.min(d, subTotal)));
  }

  private Map<String, Object> couponView(Coupon c, double discount) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("couponId", c.getId());
    m.put("code", c.getCode());
    m.put("title", c.getTitle());
    m.put("description", c.getDescription());
    m.put("type", c.getType());
    m.put("value", c.getValue());
    m.put("maxDiscount", c.getMaxDiscount());
    m.put("minOrderValue", c.getMinOrderValue());
    m.put("discount", discount);
    m.put("discountLabel", discountLabel(c));
    m.put("validUntil", c.getValidUntil());
    m.put("validUntilLabel", DATE.format(c.getValidUntil()));
    m.put("source", c.getSource());
    return m;
  }

  private Map<String, Object> confirmationView(CouponRedemption r, boolean alreadyConfirmed) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("reservationId", r.getId());
    m.put("couponId", r.getCouponId());
    m.put("code", r.getCode());
    m.put("orderId", r.getOrderId());
    m.put("discount", r.getDiscountAmount());
    m.put("status", r.getStatus());
    m.put("alreadyConfirmed", alreadyConfirmed);
    return m;
  }

  private void decrementReserved(String couponId) {
    coupons.findById(couponId).ifPresent(c -> {
      c.setReservedCount(Math.max(0, c.getReservedCount() - 1));
      coupons.save(c);
    });
  }

  private String newUniqueCode() {
    for (int attempt = 0; attempt < 12; attempt++) {
      String code = "WIN-" + token(8);
      if (coupons.findByCode(code).isEmpty()) return code;
    }
    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
        "Could not generate a unique coupon code");
  }

  private static String token(int length) {
    StringBuilder sb = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
    }
    return sb.toString();
  }

  private static String describe(SpinProperties.Prize p) {
    String base;
    if ("PERCENT".equals(p.getCouponType())) {
      base = money(p.getValue()) + "% off";
      if (p.getMaxDiscount() > 0) base += " up to ₹" + money(p.getMaxDiscount());
    } else {
      base = "₹" + money(p.getValue()) + " off";
    }
    if (p.getMinOrderValue() > 0) base += " on orders above ₹" + money(p.getMinOrderValue());
    return base;
  }

  private static String discountLabel(Coupon c) {
    if ("PERCENT".equals(c.getType())) {
      String s = money(c.getValue()) + "% off";
      if (c.getMaxDiscount() > 0) s += " (up to ₹" + money(c.getMaxDiscount()) + ")";
      return s;
    }
    return "₹" + money(c.getValue()) + " off";
  }

  private static double round2(double v) {
    return Math.round(v * 100.0) / 100.0;
  }

  private static String money(double v) {
    return BigDecimal.valueOf(v).stripTrailingZeros().toPlainString();
  }

  /* ------------------------------------------------------------------ */
  /* Admin management                                                    */
  /* ------------------------------------------------------------------ */

  public List<Coupon> allCoupons() {
    return coupons.findAllByOrderByCreatedAtDesc();
  }

  public Coupon createAdminCoupon(Coupon c) {
    if (c.getCode() == null || c.getCode().isBlank()) {
      c.setCode("PROMO-" + token(6));
    } else {
      c.setCode(c.getCode().trim().toUpperCase());
    }
    if (coupons.findByCode(c.getCode()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists");
    }
    c.setSource("PROMO");
    if (c.getStatus() == null || c.getStatus().isBlank()) {
      c.setStatus("ACTIVE");
    }
    if (c.getType() == null || c.getType().isBlank()) {
      c.setType("PERCENT");
    }
    Instant now = Instant.now();
    if (c.getCreatedAt() == null) c.setCreatedAt(now);
    if (c.getValidFrom() == null) c.setValidFrom(now);
    if (c.getValidUntil() == null) c.setValidUntil(now.plus(Duration.ofDays(30)));
    return coupons.save(c);
  }

  public void deleteCoupon(String id) {
    coupons.deleteById(id);
  }
}
