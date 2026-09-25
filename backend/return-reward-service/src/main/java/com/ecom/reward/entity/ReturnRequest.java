package com.ecom.reward.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Return request lifecycle (SRS 3.1.29):
 * REQUESTED -> APPROVED -> PRODUCT_RECEIVED -> UNDER_INSPECTION
 *   -> APPROVED_FOR_REWARD | REJECTED -> COMPLETED
 */
@Document("return_requests")
public class ReturnRequest {
  @Id private String id;
  @Indexed private String userId;
  @Indexed private String orderId;
  private String productId;
  private int quantity;
  private String reason;
  private String claimedCondition;   // LIKE_NEW | GOOD | FAIR | POOR
  private int estimatedReward;
  private String verifiedCondition;  // + NOT_ELIGIBLE (admin only), null until evaluated
  private Integer finalReward;       // null until evaluated (REWARD_POINTS track only)
  private String returnType;         // FULL_REFUND | REWARD_POINTS
  private Integer estimatedRefund;   // FULL_REFUND track: full price x qty (money back)
  private Integer finalRefund;       // set on approval (null until evaluated)
  private String refundStatus;       // PENDING | REFUNDED | NONE
  private String refundMethod;       // SOURCE | BANK_TRANSFER | NONE
  private String status;
  private String adminNote;
  private Instant createdAt = Instant.now();
  private Instant updatedAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getOrderId() { return orderId; }
  public void setOrderId(String orderId) { this.orderId = orderId; }
  public String getProductId() { return productId; }
  public void setProductId(String productId) { this.productId = productId; }
  public int getQuantity() { return quantity; }
  public void setQuantity(int quantity) { this.quantity = quantity; }
  public String getReason() { return reason; }
  public void setReason(String reason) { this.reason = reason; }
  public String getClaimedCondition() { return claimedCondition; }
  public void setClaimedCondition(String claimedCondition) { this.claimedCondition = claimedCondition; }
  public int getEstimatedReward() { return estimatedReward; }
  public void setEstimatedReward(int estimatedReward) { this.estimatedReward = estimatedReward; }
  public String getVerifiedCondition() { return verifiedCondition; }
  public void setVerifiedCondition(String verifiedCondition) { this.verifiedCondition = verifiedCondition; }
  public Integer getFinalReward() { return finalReward; }
  public void setFinalReward(Integer finalReward) { this.finalReward = finalReward; }
  public String getReturnType() { return returnType; }
  public void setReturnType(String returnType) { this.returnType = returnType; }
  public Integer getEstimatedRefund() { return estimatedRefund; }
  public void setEstimatedRefund(Integer estimatedRefund) { this.estimatedRefund = estimatedRefund; }
  public Integer getFinalRefund() { return finalRefund; }
  public void setFinalRefund(Integer finalRefund) { this.finalRefund = finalRefund; }
  public String getRefundStatus() { return refundStatus; }
  public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }
  public String getRefundMethod() { return refundMethod; }
  public void setRefundMethod(String refundMethod) { this.refundMethod = refundMethod; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public String getAdminNote() { return adminNote; }
  public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
