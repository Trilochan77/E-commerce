package com.ecom.reward.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** One record per user per calendar day (Asia/Kolkata). */
@Document("spin_results")
public class SpinResult {
  @Id private String id;
  @Indexed private String userId;
  @Indexed private String spinDate;   // yyyy-MM-dd in the configured zone
  private int wheelIndex;
  private String prizeKey;
  private String prizeLabel;
  private String prizeType;           // COUPON | POINTS | NONE
  private String couponCode;
  private int points;
  private String message;
  private Instant createdAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getSpinDate() { return spinDate; }
  public void setSpinDate(String spinDate) { this.spinDate = spinDate; }
  public int getWheelIndex() { return wheelIndex; }
  public void setWheelIndex(int wheelIndex) { this.wheelIndex = wheelIndex; }
  public String getPrizeKey() { return prizeKey; }
  public void setPrizeKey(String prizeKey) { this.prizeKey = prizeKey; }
  public String getPrizeLabel() { return prizeLabel; }
  public void setPrizeLabel(String prizeLabel) { this.prizeLabel = prizeLabel; }
  public String getPrizeType() { return prizeType; }
  public void setPrizeType(String prizeType) { this.prizeType = prizeType; }
  public String getCouponCode() { return couponCode; }
  public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
  public int getPoints() { return points; }
  public void setPoints(int points) { this.points = points; }
  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
