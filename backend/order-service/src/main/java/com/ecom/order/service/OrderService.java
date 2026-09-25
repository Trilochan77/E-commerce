package com.ecom.order.service;

import com.ecom.order.dto.CheckoutRequest;
import com.ecom.order.entity.CartRef;
import com.ecom.order.entity.Order;
import com.ecom.order.entity.RewardTransaction;
import com.ecom.order.entity.RewardWallet;
import com.ecom.order.repository.CartRefRepository;
import com.ecom.order.repository.OrderRepository;
import com.ecom.order.repository.RewardTransactionRepository;
import com.ecom.order.repository.RewardWalletRepository;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {

  private final OrderRepository orders;
  private final CartRefRepository carts;
  private final RewardWalletRepository wallets;
  private final RewardTransactionRepository transactions;
  private final RestTemplate rest;
  private final PaymentService payments;
  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

  @Value("${product-service.url:http://localhost:8082}")
  private String productUrl;

  @Value("${recommendation.url:http://localhost:8084}")
  private String recUrl;

  @Value("${reward.point-value-rupees:1}")
  private double pointValue;

  @Value("${reward.max-redeem-percent:20}")
  private int maxRedeemPercent;

  public OrderService(OrderRepository orders, CartRefRepository carts, RewardWalletRepository wallets,
      RewardTransactionRepository transactions, RestTemplate rest, PaymentService payments) {
    this.orders = orders;
    this.carts = carts;
    this.wallets = wallets;
    this.transactions = transactions;
    this.rest = rest;
    this.payments = payments;
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> fetchProduct(String productId) {
    try {
      Map<String, Object> p = rest.getForObject(productUrl + "/api/products/" + productId, Map.class);
      if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + productId);
      return p;
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "product-service unavailable");
    }
  }

  private Order.ShippingAddress snapshot(CheckoutRequest req) {
    CheckoutRequest.ShippingAddressRequest s = req.shippingAddress();
    Order.ShippingAddress snap = new Order.ShippingAddress();
    snap.setFullName(s.fullName().trim());
    snap.setPhone(s.phone().trim());
    snap.setPincode(s.pincode().trim());
    snap.setAddressLine(s.addressLine().trim());
    snap.setCity(s.city().trim());
    snap.setState(s.state().trim());
    snap.setLandmark(s.landmark() == null ? "" : s.landmark().trim());
    String t = s.addressType() == null ? "HOME" : s.addressType().trim().toUpperCase();
    snap.setAddressType(t.equals("HOME") || t.equals("WORK") || t.equals("OTHER") ? t : "HOME");
    return snap;
  }

  public Order checkout(CheckoutRequest req) {
    if (req.shippingAddress() == null) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Delivery address is required");
    }
    CartRef cart = carts.findByUserId(req.userId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));
    if (cart.getItems() == null || cart.getItems().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Cart is empty");
    }

    // 1. Verify stock + compute subtotal with live prices.
    double subTotal = 0;
    for (CartRef.Item item : cart.getItems()) {
      Map<String, Object> p = fetchProduct(item.getProductId());
      int stock = ((Number) p.getOrDefault("stockQuantity", 0)).intValue();
      double price = ((Number) p.getOrDefault("price", 0)).doubleValue();
      if (item.getQuantity() > stock) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Insufficient stock for " + item.getProductId() + " (available " + stock + ")");
      }
      item.setUnitPrice(price);
      subTotal += price * item.getQuantity();
    }

    // 2. Reward points validation + cap.
    int pointsToUse = Math.max(0, req.pointsToUse());
    double discount = 0;
    RewardWallet wallet = null;
    if (pointsToUse > 0) {
      wallet = wallets.findByUserId(req.userId()).orElse(null);
      int balance = wallet == null ? 0 : wallet.getPointBalance();
      if (pointsToUse > balance) {
        throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
            "Insufficient reward balance (" + balance + ")");
      }
      double maxDiscount = subTotal * maxRedeemPercent / 100.0;
      discount = pointsToUse * pointValue;
      if (discount > maxDiscount) {
        throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
            "Points exceed max " + maxRedeemPercent + "% cap (max discount " + maxDiscount + ")");
      }
    }
    double payable = subTotal - discount;

    // 3. Mock payment — order is NOT created on failure (SRS 3.1.28).
    try {
      payments.charge(req.paymentMethod(), payable);
    } catch (PaymentService.PaymentFailedException e) {
      Order failed = new Order();
      failed.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      failed.setUserId(req.userId());
      failed.setPaymentMethod(req.paymentMethod());
      failed.setPaymentStatus("FAILED");
      failed.setOrderStatus("CANCELLED");
      failed.setSubTotal(subTotal);
      failed.setPayableAmount(payable);
      failed.setAddressId(req.addressId());
      failed.setShippingAddress(snapshot(req));
      failed.setOrderDate(Instant.now());
      orders.save(failed);
      throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, e.getMessage());
    }

    // 4. Create order.
    Order order = new Order();
    order.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    order.setUserId(req.userId());
    List<Order.OrderItem> items = new ArrayList<>();
    for (CartRef.Item ci : cart.getItems()) {
      Order.OrderItem oi = new Order.OrderItem();
      oi.setProductId(ci.getProductId());
      oi.setQuantity(ci.getQuantity());
      oi.setPrice(ci.getUnitPrice());
      items.add(oi);
    }
    order.setItems(items);
    order.setSubTotal(subTotal);
    order.setPointsUsed(pointsToUse);
    order.setDiscountValue(discount);
    order.setPayableAmount(payable);
    order.setPaymentMethod(req.paymentMethod());
    order.setPaymentStatus("PAID");
    order.setOrderStatus("PLACED");
    order.setAddressId(req.addressId());
    order.setShippingAddress(snapshot(req));
    order.setOrderDate(Instant.now());
    orders.save(order);

    // 5. Decrement stock (best-effort per item; failures surface as 502).
    for (CartRef.Item ci : cart.getItems()) {
      try {
        rest.put(productUrl + "/api/products/" + ci.getProductId() + "/stock",
            Map.of("delta", -ci.getQuantity()));
      } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
            "Stock update failed for " + ci.getProductId());
      }
    }

    // 6. Deduct wallet + USED transaction.
    if (pointsToUse > 0) {
      RewardWallet w = wallets.findByUserId(req.userId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Wallet not found"));
      if (w.getPointBalance() < pointsToUse) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Wallet balance changed, retry checkout");
      }
      w.setPointBalance(w.getPointBalance() - pointsToUse);
      w.setUpdatedAt(Instant.now());
      wallets.save(w);
      RewardTransaction tx = new RewardTransaction();
      tx.setId("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      tx.setWalletId(w.getId());
      tx.setUserId(req.userId());
      tx.setType("USED");
      tx.setPoints(pointsToUse);
      tx.setRelatedOrderId(order.getId());
      tx.setCreatedAt(Instant.now());
      transactions.save(tx);
    }

    // 7. Clear cart.
    cart.getItems().clear();
    carts.save(cart);

    // 8. PURCHASE activity for recommendations (fire-and-forget).
    try {
      String body = "{\"userId\":\"" + req.userId() + "\",\"type\":\"PURCHASE\",\"orderId\":\"" + order.getId() + "\"}";
      HttpRequest log = HttpRequest.newBuilder().uri(URI.create(recUrl + "/api/activity"))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(body)).timeout(Duration.ofSeconds(2)).build();
      http.sendAsync(log, HttpResponse.BodyHandlers.discarding());
    } catch (Exception ignored) {
    }

    return order;
  }

  public List<Order> history(String userId) {
    return orders.findByUserIdOrderByOrderDateDesc(userId);
  }

  public List<Order> all() {
    return orders.findAllByOrderByOrderDateDesc();
  }

  public Order get(String orderId) {
    return orders.findById(orderId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
  }

  public Order updateStatus(String orderId, String status) {
    Order o = get(orderId);
    o.setOrderStatus(status);
    return orders.save(o);
  }
}
