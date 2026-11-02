package com.ecom.reward.service;

import com.ecom.reward.config.SpinProperties;
import com.ecom.reward.entity.Coupon;
import com.ecom.reward.entity.RewardTransaction;
import com.ecom.reward.entity.RewardWallet;
import com.ecom.reward.entity.SpinResult;
import com.ecom.reward.repository.RewardTransactionRepository;
import com.ecom.reward.repository.RewardWalletRepository;
import com.ecom.reward.repository.SpinResultRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Server-authoritative Spin & Win wheel.
 *
 * <p>Anti-abuse rules:
 * <ul>
 *   <li>Exactly one spin per user per calendar day in {@code spin.zone} (default Asia/Kolkata).</li>
 *   <li>A unique Mongo index on {@code (userId, spinDate)} blocks concurrent double spins.</li>
 *   <li>The prize is selected on the server; the browser only receives the winning index.</li>
 *   <li>Coupons are bound to the winner, expire, and have total + per-user usage limits.</li>
 * </ul>
 */
@Service
public class SpinService {

  private static final DateTimeFormatter NEXT_SPIN =
      DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
  private static final String TOKEN_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final SecureRandom RANDOM = new SecureRandom();

  private final SpinResultRepository results;
  private final CouponService coupons;
  private final RewardWalletRepository wallets;
  private final RewardTransactionRepository transactions;
  private final SpinProperties props;

  private final Object spinLock = new Object();
  private final Object walletLock = new Object();

  private final java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
      .connectTimeout(java.time.Duration.ofSeconds(2))
      .build();

  @org.springframework.beans.factory.annotation.Value("${notification-service.url:http://localhost:8088}")
  private String notificationUrl;

  private void notifyOffer(String userId, String type, String category, String title, String message, String link, String icon) {
    if (userId == null || userId.isBlank()) return;
    try {
      String json = String.format(
          "{\"userId\":\"%s\",\"type\":\"%s\",\"category\":\"%s\",\"title\":\"%s\",\"message\":\"%s\",\"link\":\"%s\",\"icon\":\"%s\"}",
          userId, type, category, title, message, link, icon);
      java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
          .uri(java.net.URI.create(notificationUrl + "/api/notifications"))
          .header("Content-Type", "application/json")
          .POST(java.net.http.HttpRequest.BodyPublishers.ofString(json))
          .timeout(java.time.Duration.ofSeconds(2))
          .build();
      httpClient.sendAsync(request, java.net.http.HttpResponse.BodyHandlers.discarding());
    } catch (Exception ignored) {}
  }

  public SpinService(SpinResultRepository results, CouponService coupons,
      RewardWalletRepository wallets, RewardTransactionRepository transactions, SpinProperties props) {
    this.results = results;
    this.coupons = coupons;
    this.wallets = wallets;
    this.transactions = transactions;
    this.props = props;
  }

  public List<Map<String, Object>> prizes() {
    return props.getPrizes().stream()
        .sorted(Comparator.comparingInt(SpinProperties.Prize::getIndex))
        .map(this::publicPrize)
        .toList();
  }

  public Map<String, Object> status(String userId) {
    requireUser(userId);
    ZoneId zone = zone();
    LocalDate today = LocalDate.now(zone);
    Optional<SpinResult> todayResult = results.findByUserIdAndSpinDate(userId, today.toString());
    Instant next = nextSpin(today, zone);

    Map<String, Object> m = new LinkedHashMap<>();
    m.put("userId", userId);
    m.put("spinDate", today.toString());
    m.put("timezone", zone.getId());
    m.put("canSpin", todayResult.isEmpty());
    m.put("nextSpinAt", next.toString());
    m.put("nextSpinLabel", NEXT_SPIN.format(next.atZone(zone)));
    m.put("prizes", prizes());
    m.put("lastResult", todayResult.map(this::view).orElse(null));
    return m;
  }

  public Map<String, Object> spin(String userId) {
    requireUser(userId);
    synchronized (spinLock) {
      ZoneId zone = zone();
      LocalDate today = LocalDate.now(zone);
      String spinDate = today.toString();
      if (results.findByUserIdAndSpinDate(userId, spinDate).isPresent()) {
        Instant next = nextSpin(today, zone);
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "You have already spun today. Next spin opens " + NEXT_SPIN.format(next.atZone(zone)));
      }

      SpinProperties.Prize prize = pick();
      String resultId = "SPIN-" + token(8);
      Coupon coupon = null;
      int points = 0;
      if ("COUPON".equals(prize.getType())) {
        coupon = coupons.createSpinCoupon(userId, prize, resultId);
        notifyOffer(userId, "OFFER_COUPON", "OFFERS", "New Coupon Won! 🎟️",
            "You won a " + prize.getLabel() + " coupon (" + coupon.getCode() + ") from Spin & Win! Valid for 7 days.",
            "/spin", "🎟️");
      } else if ("POINTS".equals(prize.getType())) {
        points = prize.getPoints();
        creditPoints(userId, points, resultId);
        notifyOffer(userId, "OFFER_COUPON", "OFFERS", "Reward Points Won! 🌟",
            "You won " + points + " reward points from Daily Spin!",
            "/wallet", "🌟");
      }

      String message = messageFor(prize, coupon);
      SpinResult r = new SpinResult();
      r.setId(resultId);
      r.setUserId(userId);
      r.setSpinDate(spinDate);
      r.setWheelIndex(prize.getIndex());
      r.setPrizeKey(prize.getKey());
      r.setPrizeLabel(prize.getLabel());
      r.setPrizeType(prize.getType());
      r.setCouponCode(coupon == null ? null : coupon.getCode());
      r.setPoints(points);
      r.setMessage(message);
      r.setCreatedAt(Instant.now());
      try {
        results.save(r);
      } catch (DuplicateKeyException e) {
        // A concurrent request won the race — the unique (userId, spinDate) index held.
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "A spin for today has already been recorded for this account");
      }

      Instant next = nextSpin(today, zone);
      Map<String, Object> out = new LinkedHashMap<>();
      out.put("result", view(r));
      out.put("wheelIndex", prize.getIndex());
      out.put("prize", publicPrize(prize));
      out.put("coupon", coupon == null ? null : coupons.couponSummary(coupon));
      out.put("points", points);
      out.put("message", message);
      out.put("canSpin", false);
      out.put("nextSpinAt", next.toString());
      out.put("nextSpinLabel", NEXT_SPIN.format(next.atZone(zone)));
      out.put("walletBalance", balance(userId));
      return out;
    }
  }

  /* ------------------------------------------------------------------ */

  private Map<String, Object> publicPrize(SpinProperties.Prize p) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("index", p.getIndex());
    m.put("key", p.getKey());
    m.put("label", p.getLabel());
    m.put("shortLabel", p.getShortLabel());
    m.put("emoji", p.getEmoji());
    m.put("type", p.getType());
    m.put("color", p.getColor());
    m.put("hint", hint(p));
    return m;
  }

  private String hint(SpinProperties.Prize p) {
    if ("COUPON".equals(p.getType())) {
      if ("PERCENT".equals(p.getCouponType())) {
        String s = money(p.getValue()) + "% off";
        if (p.getMaxDiscount() > 0) s += " up to ₹" + money(p.getMaxDiscount());
        if (p.getMinOrderValue() > 0) s += " · min ₹" + money(p.getMinOrderValue());
        return s;
      }
      String s = "₹" + money(p.getValue()) + " off";
      if (p.getMinOrderValue() > 0) s += " · min ₹" + money(p.getMinOrderValue());
      return s;
    }
    if ("POINTS".equals(p.getType())) return p.getPoints() + " reward points";
    return "Better luck tomorrow";
  }

  private Map<String, Object> view(SpinResult r) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", r.getId());
    m.put("userId", r.getUserId());
    m.put("spinDate", r.getSpinDate());
    m.put("wheelIndex", r.getWheelIndex());
    m.put("prizeKey", r.getPrizeKey());
    m.put("prizeLabel", r.getPrizeLabel());
    m.put("prizeType", r.getPrizeType());
    m.put("couponCode", r.getCouponCode());
    m.put("points", r.getPoints());
    m.put("message", r.getMessage());
    m.put("createdAt", r.getCreatedAt());
    return m;
  }

  private SpinProperties.Prize pick() {
    List<SpinProperties.Prize> all = new ArrayList<>(props.getPrizes());
    all.sort(Comparator.comparingInt(SpinProperties.Prize::getIndex));
    int total = all.stream().mapToInt(SpinProperties.Prize::getWeight).sum();
    if (all.isEmpty() || total <= 0) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
          "Spin prize table is not configured");
    }
    int roll = RANDOM.nextInt(total);
    for (SpinProperties.Prize p : all) {
      roll -= Math.max(0, p.getWeight());
      if (roll < 0) return p;
    }
    return all.get(all.size() - 1);
  }

  private String messageFor(SpinProperties.Prize prize, Coupon coupon) {
    if ("COUPON".equals(prize.getType()) && coupon != null) {
      return "You won " + prize.getLabel() + "! Code " + coupon.getCode()
          + " is valid until " + coupons.couponSummary(coupon).get("validUntilLabel") + ".";
    }
    if ("POINTS".equals(prize.getType())) {
      return "You won " + prize.getPoints() + " reward points — added to your wallet.";
    }
    return "No prize this time. Come back tomorrow for another spin.";
  }

  private void creditPoints(String userId, int points, String spinResultId) {
    if (points <= 0) return;
    synchronized (walletLock) {
      RewardWallet w = wallets.findByUserId(userId).orElseGet(() -> {
        RewardWallet nw = new RewardWallet();
        nw.setId("W-" + token(8));
        nw.setUserId(userId);
        nw.setPointBalance(0);
        return nw;
      });
      w.setPointBalance(w.getPointBalance() + points);
      w.setUpdatedAt(Instant.now());
      wallets.save(w);

      RewardTransaction tx = new RewardTransaction();
      tx.setId("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      tx.setWalletId(w.getId());
      tx.setUserId(userId);
      tx.setType("EARNED");
      tx.setPoints(points);
      tx.setSource("SPIN");
      tx.setRelatedReturnId(spinResultId);
      tx.setCreatedAt(Instant.now());
      transactions.save(tx);
    }
  }

  private int balance(String userId) {
    return wallets.findByUserId(userId).map(RewardWallet::getPointBalance).orElse(0);
  }

  private Instant nextSpin(LocalDate today, ZoneId zone) {
    return today.plusDays(1).atStartOfDay(zone).toInstant();
  }

  private ZoneId zone() {
    try {
      return ZoneId.of(props.getZone());
    } catch (Exception e) {
      return ZoneId.of("Asia/Kolkata");
    }
  }

  private void requireUser(String userId) {
    if (userId == null || userId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "userId is required");
    }
  }

  private static String token(int length) {
    StringBuilder sb = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      sb.append(TOKEN_CHARS.charAt(RANDOM.nextInt(TOKEN_CHARS.length())));
    }
    return sb.toString();
  }

  private static String money(double v) {
    return java.math.BigDecimal.valueOf(v).stripTrailingZeros().toPlainString();
  }
}
