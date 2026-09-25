package com.ecom.user.entity;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Flipkart-style address book entry. A user can save multiple addresses
 * (HOME / WORK / OTHER, or an address for someone else) and pick one at checkout.
 * Orders store a snapshot copy, so editing/deleting here never rewrites history.
 */
@Document("addresses")
public class Address {
  @Id private String id;
  @Indexed private String userId;
  private String fullName;
  private String phone;
  private String pincode;
  private String addressLine;
  private String city;
  private String state;
  private String landmark;
  private String addressType; // HOME | WORK | OTHER
  private boolean isDefault;
  private Instant createdAt = Instant.now();
  private Instant updatedAt = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public String getFullName() { return fullName; }
  public void setFullName(String fullName) { this.fullName = fullName; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getPincode() { return pincode; }
  public void setPincode(String pincode) { this.pincode = pincode; }
  public String getAddressLine() { return addressLine; }
  public void setAddressLine(String addressLine) { this.addressLine = addressLine; }
  public String getCity() { return city; }
  public void setCity(String city) { this.city = city; }
  public String getState() { return state; }
  public void setState(String state) { this.state = state; }
  public String getLandmark() { return landmark; }
  public void setLandmark(String landmark) { this.landmark = landmark; }
  public String getAddressType() { return addressType; }
  public void setAddressType(String addressType) { this.addressType = addressType; }
  public boolean isDefault() { return isDefault; }
  public void setDefault(boolean isDefault) { this.isDefault = isDefault; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
