package com.ecom.wishlist.entity;

import java.time.Instant;
import java.util.Map;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Universal in-app notification across the e-commerce platform.
 * Supports orders, delivery, security (OTP/login), offers & coupons, and price drops.
 */
@Document("notifications")
@CompoundIndex(name = "user_created", def = "{'userId': 1, 'createdAt': -1}")
@CompoundIndex(name = "user_cat_created", def = "{'userId': 1, 'category': 1, 'createdAt': -1}")
public class Notification {
  @Id
  private String id;

  @Indexed
  private String userId;

  /**
   * OTP_VERIFIED | LOGIN_SUCCESS | ORDER_CONFIRMED | PAYMENT_SUCCESS |
   * PAYMENT_FAILED | ORDER_SHIPPED | OUT_FOR_DELIVERY | ORDER_DELIVERED |
   * PRICE_DROP | OFFER_COUPON | GENERAL
   */
  private String type;

  /**
   * ALL | ORDERS | DELIVERY | SECURITY | PRICE_DROPS | OFFERS | GENERAL
   */
  private String category;

  private String title;
  private String message;
  private String link;
  private String icon;
  private Map<String, Object> metadata;
  private boolean read = false;
  private Instant createdAt = Instant.now();
  private String emailStatus = "NOT_CONFIGURED";

  // Price drop compatibility fields
  private String productId;
  private String productName;
  private Double previousPrice;
  private Double currentPrice;
  private Double savings;
  private Integer savingsPercent;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }

  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }

  public String getType() { return type; }
  public void setType(String type) { this.type = type; }

  public String getCategory() { return category; }
  public void setCategory(String category) { this.category = category; }

  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }

  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }

  public String getLink() { return link; }
  public void setLink(String link) { this.link = link; }

  public String getIcon() { return icon; }
  public void setIcon(String icon) { this.icon = icon; }

  public Map<String, Object> getMetadata() { return metadata; }
  public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }

  public boolean isRead() { return read; }
  public void setRead(boolean read) { this.read = read; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

  public String getEmailStatus() { return emailStatus; }
  public void setEmailStatus(String emailStatus) { this.emailStatus = emailStatus; }

  public String getProductId() { return productId; }
  public void setProductId(String productId) { this.productId = productId; }

  public String getProductName() { return productName; }
  public void setProductName(String productName) { this.productName = productName; }

  public Double getPreviousPrice() { return previousPrice; }
  public void setPreviousPrice(Double previousPrice) { this.previousPrice = previousPrice; }

  public Double getCurrentPrice() { return currentPrice; }
  public void setCurrentPrice(Double currentPrice) { this.currentPrice = currentPrice; }

  public Double getSavings() { return savings; }
  public void setSavings(Double savings) { this.savings = savings; }

  public Integer getSavingsPercent() { return savingsPercent; }
  public void setSavingsPercent(Integer savingsPercent) { this.savingsPercent = savingsPercent; }
}

