package com.ecom.reward.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("reward_transactions")
public class RewardTransaction {
  @Id private String id;
  @Indexed private String walletId;
  @Indexed private String userId;
  private String type; // EARNED | USED
  private int points;
  private String relatedOrderId;
  private String relatedReturnId;
  private Instant createdAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getWalletId() { return walletId; }
  public void setWalletId(String walletId) { this.walletId = walletId; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getType() { return type; }
  public void setType(String type) { this.type = type; }
  public int getPoints() { return points; }
  public void setPoints(int points) { this.points = points; }
  public String getRelatedOrderId() { return relatedOrderId; }
  public void setRelatedOrderId(String relatedOrderId) { this.relatedOrderId = relatedOrderId; }
  public String getRelatedReturnId() { return relatedReturnId; }
  public void setRelatedReturnId(String relatedReturnId) { this.relatedReturnId = relatedReturnId; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
