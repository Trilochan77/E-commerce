package com.ecom.reward.entity;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Read-only view of shared products collection. */
@Document("products")
public class ProductRef {
  @Id private String id;
  private String name;
  private double price;
  private String categoryId;
  private List<String> images;
  private int stockQuantity;
  private boolean availability;
  private boolean eligibleForReturn;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
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
}
