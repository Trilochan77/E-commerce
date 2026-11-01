package com.ecom.product.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("reviews")
public class Review {
  @Id private String id;
  @Indexed private String productId;
  @Indexed private String userId;
  private String userName;
  private String userEmail;
  private int rating; // 1 - 5
  private String title;
  private String comment;
  private List<String> images = new ArrayList<>();
  private boolean verifiedPurchase = false;
  private String status = "APPROVED"; // APPROVED | PENDING | REJECTED
  private String adminNote;
  private Instant createdAt = Instant.now();
  private Instant updatedAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getProductId() { return productId; }
  public void setProductId(String productId) { this.productId = productId; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getUserName() { return userName; }
  public void setUserName(String userName) { this.userName = userName; }
  public String getUserEmail() { return userEmail; }
  public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
  public int getRating() { return rating; }
  public void setRating(int rating) { this.rating = rating; }
  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }
  public String getComment() { return comment; }
  public void setComment(String comment) { this.comment = comment; }
  public List<String> getImages() { return images; }
  public void setImages(List<String> images) { this.images = images; }
  public boolean isVerifiedPurchase() { return verifiedPurchase; }
  public void setVerifiedPurchase(boolean verifiedPurchase) { this.verifiedPurchase = verifiedPurchase; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public String getAdminNote() { return adminNote; }
  public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

