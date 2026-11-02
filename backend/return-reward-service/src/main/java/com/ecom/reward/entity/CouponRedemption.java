package com.ecom.reward.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Reservation / redemption record for a coupon.
 * A checkout reserves first, then confirms only after the order is placed so a
 * failed payment never burns the coupon.
 */
@Document("coupon_redemptions")
public class CouponRedemption {
  @Id private String id;
  @Indexed private String couponId;
  @Indexed private String code;
  @Indexed private String userId;
  private String orderId;
  private double discountAmount;
  private String status;        // RESERVED | REDEEMED | RELEASED | EXPIRED
  private Instant reservedAt = Instant.now();
  private Instant expiresAt;
  private Instant redeemedAt;
  private Instant releasedAt;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getCouponId() { return couponId; }
  public void setCouponId(String couponId) { this.couponId = couponId; }
  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getOrderId() { return orderId; }
  public void setOrderId(String orderId) { this.orderId = orderId; }
  public double getDiscountAmount() { return discountAmount; }
  public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public Instant getReservedAt() { return reservedAt; }
  public void setReservedAt(Instant reservedAt) { this.reservedAt = reservedAt; }
  public Instant getExpiresAt() { return expiresAt; }
  public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
  public Instant getRedeemedAt() { return redeemedAt; }
  public void setRedeemedAt(Instant redeemedAt) { this.redeemedAt = redeemedAt; }
  public Instant getReleasedAt() { return releasedAt; }
  public void setReleasedAt(Instant releasedAt) { this.releasedAt = releasedAt; }
}
