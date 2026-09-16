package com.ecom.order.entity;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Read-only view of the shared carts collection (same `ecom` DB in Phase 1 MVP). */
@Document("carts")
public class CartRef {
  @Id private String id;
  private String userId;
  private List<Item> items;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public List<Item> getItems() { return items; }
  public void setItems(List<Item> items) { this.items = items; }

  public static class Item {
    private String productId;
    private int quantity;
    private double unitPrice;

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }
  }
}
