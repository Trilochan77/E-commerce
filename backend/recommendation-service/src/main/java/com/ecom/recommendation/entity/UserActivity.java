package com.ecom.recommendation.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Unified activity log (SRS 3.1.7-3.1.9, 3.1.24). VIEW logged by frontend on
 * product-detail open, SEARCH by search-service, PURCHASE by order-service.
 */
@Document("user_activities")
public class UserActivity {
  @Id private String id;
  @Indexed private String userId;
  private String type; // VIEW | SEARCH | PURCHASE
  private String productId;
  private String categoryId;
  private String keyword;
  private String orderId;
  private Instant timestamp = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getType() { return type; }
  public void setType(String type) { this.type = type; }
  public String getProductId() { return productId; }
  public void setProductId(String productId) { this.productId = productId; }
  public String getCategoryId() { return categoryId; }
  public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
  public String getKeyword() { return keyword; }
  public void setKeyword(String keyword) { this.keyword = keyword; }
  public String getOrderId() { return orderId; }
  public void setOrderId(String orderId) { this.orderId = orderId; }
  public Instant getTimestamp() { return timestamp; }
  public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
