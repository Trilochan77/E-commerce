package com.ecom.product.entity;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/** Read-only view of shared orders collection for verified purchaser verification. */
@Document("orders")
public class OrderRef {
  @Id private String id;
  private String userId;
  private String orderStatus;
  private List<Item> items;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getOrderStatus() { return orderStatus; }
  public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
  public List<Item> getItems() { return items; }
  public void setItems(List<Item> items) { this.items = items; }

  public static class Item {
    private String productId;
    private int quantity;

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
  }
}

