package com.ecom.wishlist.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/** One detected decrease of a wishlisted product's price. */
@Document("price_drop_notifications")
@CompoundIndex(name = "user_created", def = "{'userId': 1, 'createdAt': -1}")
public class PriceDropNotification {
  @Id private String id;
  @Indexed private String userId;
  private String productId;
  /** Product name as read from the catalog at detection time (never synthesised). */
  private String productName;
  private double previousPrice;
  private double currentPrice;
  private double savings;
  private int savingsPercent;
  private boolean read;
  private Instant createdAt = Instant.now();
  /** DISABLED | NOT_CONFIGURED | SENT | FAILED — honest record of the optional email attempt. */
  private String emailStatus = "PENDING";

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getProductId() { return productId; }
  public void setProductId(String productId) { this.productId = productId; }
  public String getProductName() { return productName; }
  public void setProductName(String productName) { this.productName = productName; }
  public double getPreviousPrice() { return previousPrice; }
  public void setPreviousPrice(double previousPrice) { this.previousPrice = previousPrice; }
  public double getCurrentPrice() { return currentPrice; }
  public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }
  public double getSavings() { return savings; }
  public void setSavings(double savings) { this.savings = savings; }
  public int getSavingsPercent() { return savingsPercent; }
  public void setSavingsPercent(int savingsPercent) { this.savingsPercent = savingsPercent; }
  public boolean isRead() { return read; }
  public void setRead(boolean read) { this.read = read; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public String getEmailStatus() { return emailStatus; }
  public void setEmailStatus(String emailStatus) { this.emailStatus = emailStatus; }
}
