package com.ecom.order.entity;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("orders")
public class Order {
  @Id private String id;
  @Indexed private String userId;
  private List<OrderItem> items;
  private double subTotal;
  private int pointsUsed;
  private double discountValue;
  private double payableAmount;
  private String paymentMethod;
  private String paymentStatus; // PENDING | PAID | FAILED
  private String orderStatus;   // PLACED | SHIPPED | DELIVERED | CANCELLED
  private Instant orderDate = Instant.now();

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
  public List<OrderItem> getItems() { return items; }
  public void setItems(List<OrderItem> items) { this.items = items; }
  public double getSubTotal() { return subTotal; }
  public void setSubTotal(double subTotal) { this.subTotal = subTotal; }
  public int getPointsUsed() { return pointsUsed; }
  public void setPointsUsed(int pointsUsed) { this.pointsUsed = pointsUsed; }
  public double getDiscountValue() { return discountValue; }
  public void setDiscountValue(double discountValue) { this.discountValue = discountValue; }
  public double getPayableAmount() { return payableAmount; }
  public void setPayableAmount(double payableAmount) { this.payableAmount = payableAmount; }
  public String getPaymentMethod() { return paymentMethod; }
  public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
  public String getPaymentStatus() { return paymentStatus; }
  public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
  public String getOrderStatus() { return orderStatus; }
  public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
  public Instant getOrderDate() { return orderDate; }
  public void setOrderDate(Instant orderDate) { this.orderDate = orderDate; }

  public static class OrderItem {
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
