package com.ecom.reward.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** A single-use-per-user discount coupon, usually won on the Spin & Win wheel. */
@Document("coupons")
public class Coupon {
  @Id private String id;
  @Indexed(unique = true) private String code;
  private String title;
  private String description;
  private String type;          // PERCENT | FLAT
  private double value;         // percent when PERCENT, rupees when FLAT
  private double maxDiscount;   // 0 = no cap (PERCENT only)
  private double minOrderValue;
  private int maxUses;          // 0 = unlimited total uses
  private int usedCount;
  private int reservedCount;    // held by an in-flight checkout
  private int perUserLimit;     // 0 = unlimited per user
  private String ownerUserId;   // null = public promo code, otherwise bound to the winner
  private String status;        // ACTIVE | DISABLED
  private String source;        // SPIN | PROMO
  private String spinResultId;
  private Instant validFrom = Instant.now();
  private Instant validUntil;
  private Instant createdAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public String getType() { return type; }
  public void setType(String type) { this.type = type; }
  public double getValue() { return value; }
  public void setValue(double value) { this.value = value; }
  public double getMaxDiscount() { return maxDiscount; }
  public void setMaxDiscount(double maxDiscount) { this.maxDiscount = maxDiscount; }
  public double getMinOrderValue() { return minOrderValue; }
  public void setMinOrderValue(double minOrderValue) { this.minOrderValue = minOrderValue; }
  public int getMaxUses() { return maxUses; }
  public void setMaxUses(int maxUses) { this.maxUses = maxUses; }
  public int getUsedCount() { return usedCount; }
  public void setUsedCount(int usedCount) { this.usedCount = usedCount; }
  public int getReservedCount() { return reservedCount; }
  public void setReservedCount(int reservedCount) { this.reservedCount = reservedCount; }
  public int getPerUserLimit() { return perUserLimit; }
  public void setPerUserLimit(int perUserLimit) { this.perUserLimit = perUserLimit; }
  public String getOwnerUserId() { return ownerUserId; }
  public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public String getSource() { return source; }
  public void setSource(String source) { this.source = source; }
  public String getSpinResultId() { return spinResultId; }
  public void setSpinResultId(String spinResultId) { this.spinResultId = spinResultId; }
  public Instant getValidFrom() { return validFrom; }
  public void setValidFrom(Instant validFrom) { this.validFrom = validFrom; }
  public Instant getValidUntil() { return validUntil; }
  public void setValidUntil(Instant validUntil) { this.validUntil = validUntil; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
