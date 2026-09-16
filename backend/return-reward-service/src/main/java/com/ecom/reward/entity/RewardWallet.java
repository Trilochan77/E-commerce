package com.ecom.reward.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("reward_wallets")
public class RewardWallet {
  @Id private String id;
  @Indexed(unique = true) private String userId;
  private int pointBalance;
  private Instant updatedAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public int getPointBalance() { return pointBalance; }
  public void setPointBalance(int pointBalance) { this.pointBalance = pointBalance; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
