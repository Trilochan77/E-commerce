package com.ecom.wishlist.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Read-only view of the shared {@code products} collection owned by product-service.
 * Used by the price tracker so wishlist-service never invents catalog values.
 */
@Document("products")
public class ProductSnapshot {
  @Id private String id;
  private String name;
  private double price;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public double getPrice() { return price; }
  public void setPrice(double price) { this.price = price; }
}
