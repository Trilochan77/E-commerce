package com.ecom.wishlist.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("wishlists")
public class Wishlist {
  @Id private String id;
  @Indexed(unique = true) private String userId;
  private List<WishlistItem> items = new ArrayList<>();
  private Instant updatedAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public List<WishlistItem> getItems() { return items; }
  public void setItems(List<WishlistItem> items) { this.items = items; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

  public static class WishlistItem {
    private String productId;
    private double priceAtAdd;
    private Instant addedAt = Instant.now();

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public double getPriceAtAdd() { return priceAtAdd; }
    public void setPriceAtAdd(double priceAtAdd) { this.priceAtAdd = priceAtAdd; }
    public Instant getAddedAt() { return addedAt; }
    public void setAddedAt(Instant addedAt) { this.addedAt = addedAt; }
  }
}
