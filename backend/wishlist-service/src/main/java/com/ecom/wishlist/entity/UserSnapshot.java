package com.ecom.wishlist.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Read-only view of the shared {@code users} collection owned by user-service.
 * Only the fields needed to address an optional notification email are read.
 */
@Document("users")
public class UserSnapshot {
  @Id private String id;
  private String name;
  private String email;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
}
