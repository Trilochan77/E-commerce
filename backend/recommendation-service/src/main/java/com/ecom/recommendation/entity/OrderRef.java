package com.ecom.recommendation.entity;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Read-only view of shared orders collection (Phase 1 MVP shared-DB pattern). */
@Document("orders")
public class OrderRef {
  @Id private String id;
  private String userId;
  private List<Item> items;
  private String paymentStatus;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public List<Item> getItems() { return items; }
  public void setItems(List<Item> items) { this.items = items; }
  public String getPaymentStatus() { return paymentStatus; }
  public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

  public static class Item {
    private String productId;
    private int quantity;
    private double price;

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
  }
}
