package com.ecom.product.entity;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("products")
public class Product {
  @Id private String id;
  private String name;
  private String description;
  private double price;
  private String categoryId;
  private List<String> images;
  private int stockQuantity;
  private boolean availability;
  private boolean eligibleForReturn;
  private Instant createdAt = Instant.now();
  private Instant updatedAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public double getPrice() { return price; }
  public void setPrice(double price) { this.price = price; }
  public String getCategoryId() { return categoryId; }
  public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
  public List<String> getImages() { return images; }
  public void setImages(List<String> images) { this.images = images; }
  public int getStockQuantity() { return stockQuantity; }
  public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
  public boolean isAvailability() { return availability; }
  public void setAvailability(boolean availability) { this.availability = availability; }
  public boolean isEligibleForReturn() { return eligibleForReturn; }
  public void setEligibleForReturn(boolean eligibleForReturn) { this.eligibleForReturn = eligibleForReturn; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
