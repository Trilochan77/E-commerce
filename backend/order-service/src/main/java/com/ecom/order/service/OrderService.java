package com.ecom.order.service;

import com.ecom.order.dto.CheckoutRequest;
import com.ecom.order.entity.CartRef;
import com.ecom.returnreward.service.ReturnRewardService;
import com.ecom.order.entity.DeliveryTracking;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {
  private static final Logger log = LoggerFactory.getLogger(OrderService.class);

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

  @Value("${reward-service.url:http://localhost:8087}")
  private String rewardUrl;

  @Value("${notification-service.url:http://localhost:8088}")
  private String notificationUrl;

  private void sendNotification(String userId, String type, String category, String title, String message, String link, String icon, Map<String, Object> metadata) {
    if (userId == null || userId.isBlank()) return;
    try {
      Map<String, Object> req = new HashMap<>();
      req.put("userId", userId);
      req.put("type", type);
      req.put("category", category);
      req.put("title", title);
      req.put("message", message);
      req.put("link", link);
      req.put("icon", icon);
      if (metadata != null) req.put("metadata", metadata);
      rest.postForObject(notificationUrl + "/api/notifications", req, Map.class);
    } catch (Exception ex) {
      log.warn("Could not dispatch notification: {}", ex.getMessage());
    }
  }

  private void notifyOrderStatusChange(Order o, String status) {
    if (o == null || o.getUserId() == null || status == null) return;
    switch (status) {
      case "CONFIRMED" -> sendNotification(o.getUserId(), "ORDER_CONFIRMED", "ORDERS", "Order Confirmed",
          "Order #" + o.getId() + " is confirmed and being prepared.", "/orders", "📦", Map.of("orderId", o.getId()));
      case "SHIPPED" -> sendNotification(o.getUserId(), "ORDER_SHIPPED", "DELIVERY", "Order Shipped! 📦",
          "Order #" + o.getId() + " has been dispatched and is on its way to you.", "/orders", "📦", Map.of("orderId", o.getId()));
      case "OUT_FOR_DELIVERY" -> sendNotification(o.getUserId(), "OUT_FOR_DELIVERY", "DELIVERY", "Out for Delivery! 🚚",
          "Your package for Order #" + o.getId() + " is out for delivery today. Delivery agent is arriving soon!", "/orders", "🚚", Map.of("orderId", o.getId()));
      case "DELIVERED" -> sendNotification(o.getUserId(), "ORDER_DELIVERED", "DELIVERY", "Delivered Successfully! 🎉",
          "Package for Order #" + o.getId() + " has been delivered. Thank you for shopping with us!", "/orders", "🎉", Map.of("orderId", o.getId()));
      case "CANCELLED" -> sendNotification(o.getUserId(), "ORDER_CANCELLED", "ORDERS", "Order Cancelled",
          "Order #" + o.getId() + " was cancelled.", "/orders", "❌", Map.of("orderId", o.getId()));
      default -> {}
    }
  }

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

    // 2.1 Coupon validation & reservation
    String reservationId = null;
    double couponDiscount = 0;
    if (req.couponCode() != null && !req.couponCode().isBlank()) {
      try {
        Map<String, Object> reserveReq = Map.of(
            "userId", req.userId(),
            "code", req.couponCode().trim(),
            "subTotal", subTotal
        );
        @SuppressWarnings("unchecked")
        Map<String, Object> res = rest.postForObject(rewardUrl + "/api/rewards/coupons/reserve", reserveReq, Map.class);
        if (res != null) {
          reservationId = (String) res.get("reservationId");
          couponDiscount = ((Number) res.getOrDefault("discount", 0.0)).doubleValue();
        }
      } catch (Exception ex) {
        throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Coupon invalid, expired or already used: " + req.couponCode());
      }
    }

    double payable = Math.max(0, subTotal - couponDiscount - discount);

    // 3. Mock payment — order is NOT created on failure (SRS 3.1.28).
    try {
      payments.charge(req.paymentMethod(), payable);
    } catch (PaymentService.PaymentFailedException e) {
      if (reservationId != null) {
        try {
          rest.postForObject(rewardUrl + "/api/rewards/coupons/" + reservationId + "/release", Map.of(), Map.class);
        } catch (Exception ignored) {}
      }
      Order failed = new Order();
      failed.setId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      failed.setUserId(req.userId());
      try {
        failed.setPaymentMethod(PaymentService.normalize(req.paymentMethod()));
      } catch (PaymentService.PaymentFailedException ex) {
        failed.setPaymentMethod(req.paymentMethod());
      }
      failed.setPaymentStatus("FAILED");
      failed.setOrderStatus("CANCELLED");
      failed.setSubTotal(subTotal);
      failed.setCouponCode(req.couponCode());
      failed.setCouponDiscount(couponDiscount);
      failed.setPayableAmount(payable);
      failed.setAddressId(req.addressId());
      failed.setShippingAddress(snapshot(req));
      failed.setOrderDate(Instant.now());
      orders.save(failed);
      sendNotification(req.userId(), "PAYMENT_FAILED", "ORDERS", "Payment Failed",
          "Payment of ₹" + Math.round(payable) + " failed: " + e.getMessage() + ". Please retry or use another payment method.",
          "/checkout", "❌", Map.of("reason", e.getMessage(), "amount", payable));
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
    order.setCouponCode(req.couponCode());
    order.setCouponDiscount(couponDiscount);
    order.setPayableAmount(payable);
    order.setPaymentMethod(PaymentService.normalize(req.paymentMethod()));
    order.setPaymentStatus(payments.paymentStatusFor(req.paymentMethod()));
    order.setOrderStatus("PLACED");
    order.setAddressId(req.addressId());
    order.setShippingAddress(snapshot(req));
    order.setOrderDate(Instant.now());
    order.setDeliveryTracking(buildTracking(order));
    orders.save(order);

    sendNotification(order.getUserId(), "ORDER_CONFIRMED", "ORDERS", "Order Confirmed! 📦",
        "Order #" + order.getId() + " placed successfully for ₹" + Math.round(order.getPayableAmount()) + ".",
        "/orders", "📦", Map.of("orderId", order.getId(), "amount", order.getPayableAmount()));
    if (!"COD".equalsIgnoreCase(order.getPaymentMethod())) {
      sendNotification(order.getUserId(), "PAYMENT_SUCCESS", "ORDERS", "Payment Confirmed 💳",
          "Payment of ₹" + Math.round(order.getPayableAmount()) + " via " + order.getPaymentMethod() + " confirmed for Order #" + order.getId() + ".",
          "/orders", "💳", Map.of("orderId", order.getId(), "amount", order.getPayableAmount()));
    }

    if (reservationId != null) {
      try {
        rest.postForObject(rewardUrl + "/api/rewards/coupons/" + reservationId + "/confirm",
            Map.of("orderId", order.getId()), Map.class);
      } catch (Exception ignored) {}
    }

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
    String next = status == null ? "" : status.trim().toUpperCase();
    if (!java.util.Set.of("PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED").contains(next)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid order status: " + status);
    }
    o.setOrderStatus(next);
    if (next.equals("DELIVERED") && o.getDeliveredDate() == null) {
      o.setDeliveredDate(Instant.now());
    }
    // Cash collected on delivery: COD order becomes PAID once delivered.
    if (next.equals("DELIVERED") && "COD".equals(o.getPaymentMethod()) && "PENDING".equals(o.getPaymentStatus())) {
      o.setPaymentStatus("PAID");
    }
    DeliveryTracking dt = o.getDeliveryTracking();
    if (dt == null) {
      dt = buildTracking(o);
    } else {
      syncTrackingState(dt, next, o.getOrderDate(), o.getDeliveredDate());
    }
    o.setDeliveryTracking(dt);
    notifyOrderStatusChange(o, next);
    return orders.save(o);
  }

  public DeliveryTracking getTracking(String orderId, String userId, String role) {
    Order o = get(orderId);
    if (!"ADMIN".equals(role) && userId != null && !userId.isBlank() && !userId.equals(o.getUserId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to tracking for order " + orderId);
    }
    DeliveryTracking dt = o.getDeliveryTracking();
    if (dt == null) {
      dt = buildTracking(o);
      o.setDeliveryTracking(dt);
      orders.save(o);
    }
    return dt;
  }

  public DeliveryTracking updateCourierLocation(String orderId, double lat, double lng, double heading, double distanceKm, int estimatedMinutes, String status) {
    Order o = get(orderId);
    DeliveryTracking dt = o.getDeliveryTracking();
    if (dt == null) {
      dt = buildTracking(o);
    }
    DeliveryTracking.Location loc = dt.getCourierLocation();
    if (loc == null) loc = new DeliveryTracking.Location();
    loc.setLat(Math.round(lat * 10000.0) / 10000.0);
    loc.setLng(Math.round(lng * 10000.0) / 10000.0);
    loc.setHeading(heading);
    loc.setUpdatedAt(Instant.now());
    dt.setCourierLocation(loc);

    if (distanceKm >= 0) dt.setDistanceKm(Math.round(distanceKm * 10.0) / 10.0);
    if (estimatedMinutes >= 0) {
      dt.setEstimatedMinutes(estimatedMinutes);
      dt.setEstimatedArrival(estimatedMinutes == 0 ? "Arrived" : "Arriving in ~" + estimatedMinutes + " mins");
    }

    if (status != null && !status.isBlank() && !status.equalsIgnoreCase(o.getOrderStatus())) {
      String next = status.trim().toUpperCase();
      if (java.util.Set.of("PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED").contains(next)) {
        o.setOrderStatus(next);
        if (next.equals("DELIVERED")) {
          if (o.getDeliveredDate() == null) o.setDeliveredDate(Instant.now());
          if ("COD".equals(o.getPaymentMethod())) o.setPaymentStatus("PAID");
        }
        syncTrackingState(dt, next, o.getOrderDate(), o.getDeliveredDate());
        notifyOrderStatusChange(o, next);
      }
    }
    o.setDeliveryTracking(dt);
    orders.save(o);
    return dt;
  }

  public DeliveryTracking resetTracking(String orderId) {
    Order o = get(orderId);
    DeliveryTracking dt = buildTracking(o);
    o.setDeliveryTracking(dt);
    orders.save(o);
    return dt;
  }

  public DeliveryTracking buildTracking(Order order) {
    DeliveryTracking t = new DeliveryTracking();
    String ordId = order.getId() != null ? order.getId() : "ORD-000000";
    String cleanId = ordId.replace("ORD-", "");
    t.setTrackingNumber("TRK-" + cleanId);
    t.setCarrier("NextGen Express Logistics");
    t.setDeliveryPersonName("Rahul Verma");
    t.setDeliveryPersonPhone("+91 98765 43210");
    t.setDeliveryPersonPhoneMasked("+91 98*** **210");
    t.setVehicleNumber("OD-02-BA-1234 (Electric Bike)");
    t.setCourierRating(4.9);
    int otpNum = Math.abs((ordId + "SECURE").hashCode() % 9000) + 1000;
    t.setDeliveryOtp(String.valueOf(otpNum));
    t.setDemoMode(true);
    t.setPrivacyProtected(true);

    double destLat = 20.2961;
    double destLng = 85.8245;
    String city = "Bhubaneswar";
    String state = "Odisha";
    String pincode = "751024";
    String addressLine = "KIIT Road, Patia";

    if (order.getShippingAddress() != null) {
      Order.ShippingAddress sa = order.getShippingAddress();
      if (sa.getCity() != null && !sa.getCity().isBlank()) city = sa.getCity().trim();
      if (sa.getState() != null && !sa.getState().isBlank()) state = sa.getState().trim();
      if (sa.getPincode() != null && !sa.getPincode().isBlank()) pincode = sa.getPincode().trim();
      if (sa.getAddressLine() != null && !sa.getAddressLine().isBlank()) addressLine = sa.getAddressLine().trim();
    }

    String cLower = city.toLowerCase();
    if (cLower.contains("bangalore") || cLower.contains("bengaluru")) {
      destLat = 12.9716; destLng = 77.5946;
    } else if (cLower.contains("mumbai")) {
      destLat = 19.0760; destLng = 72.8777;
    } else if (cLower.contains("delhi")) {
      destLat = 28.6139; destLng = 77.2090;
    } else if (cLower.contains("hyderabad")) {
      destLat = 17.3850; destLng = 78.4867;
    } else if (cLower.contains("pune")) {
      destLat = 18.5204; destLng = 73.8567;
    } else if (cLower.contains("kolkata")) {
      destLat = 22.5726; destLng = 88.3639;
    } else if (cLower.contains("chennai")) {
      destLat = 13.0827; destLng = 80.2707;
    } else if (cLower.contains("ahmedabad")) {
      destLat = 23.0225; destLng = 72.5714;
    } else if (cLower.contains("cuttack")) {
      destLat = 20.4625; destLng = 85.8828;
    } else {
      destLat = 20.2961; destLng = 85.8245;
    }

    double pinOffsetLat = ((Math.abs(pincode.hashCode()) % 100) - 50) * 0.0003;
    double pinOffsetLng = ((Math.abs(addressLine.hashCode()) % 100) - 50) * 0.0003;
    destLat = Math.round((destLat + pinOffsetLat) * 10000.0) / 10000.0;
    destLng = Math.round((destLng + pinOffsetLng) * 10000.0) / 10000.0;

    DeliveryTracking.Location destLoc = new DeliveryTracking.Location(destLat, destLng, "Delivery Address");
    destLoc.setFormattedAddress(addressLine + ", " + city + ", " + state + " - " + pincode);
    destLoc.setPrivacyMaskedAddress("🔒 Verified Delivery Point • " + city + ", " + state + " (Precise door details protected)");
    t.setDestination(destLoc);

    double whLat = Math.round((destLat - 0.032) * 10000.0) / 10000.0;
    double whLng = Math.round((destLng - 0.026) * 10000.0) / 10000.0;
    DeliveryTracking.Location whLoc = new DeliveryTracking.Location(whLat, whLng, "NextGen Hub (" + city + " South)");
    whLoc.setFormattedAddress("Plot 42, Logistics Park, " + city);
    t.setWarehouse(whLoc);

    List<DeliveryTracking.Location> waypoints = new ArrayList<>();
    waypoints.add(new DeliveryTracking.Location(whLat, whLng, "Fulfillment Hub"));
    waypoints.add(new DeliveryTracking.Location(Math.round((whLat + 0.005) * 10000.0) / 10000.0, Math.round((whLng + 0.004) * 10000.0) / 10000.0, "Hub Exit Checkpost"));
    waypoints.add(new DeliveryTracking.Location(Math.round((whLat + 0.011) * 10000.0) / 10000.0, Math.round((whLng + 0.009) * 10000.0) / 10000.0, "Express Ring Highway"));
    waypoints.add(new DeliveryTracking.Location(Math.round((whLat + 0.017) * 10000.0) / 10000.0, Math.round((whLng + 0.014) * 10000.0) / 10000.0, "Central Junction Flyover"));
    waypoints.add(new DeliveryTracking.Location(Math.round((whLat + 0.023) * 10000.0) / 10000.0, Math.round((whLng + 0.019) * 10000.0) / 10000.0, "Sector Boulevard"));
    waypoints.add(new DeliveryTracking.Location(Math.round((whLat + 0.028) * 10000.0) / 10000.0, Math.round((whLng + 0.023) * 10000.0) / 10000.0, "Neighborhood Gate 2"));
    waypoints.add(new DeliveryTracking.Location(destLat, destLng, "Customer Doorstep"));
    t.setRouteWaypoints(waypoints);

    syncTrackingState(t, order.getOrderStatus(), order.getOrderDate(), order.getDeliveredDate());
    return t;
  }

  private void syncTrackingState(DeliveryTracking t, String status, Instant orderDate, Instant deliveredDate) {
    if (orderDate == null) orderDate = Instant.now();
    List<DeliveryTracking.Location> wps = t.getRouteWaypoints();
    List<DeliveryTracking.StatusUpdate> updates = new ArrayList<>();

    updates.add(new DeliveryTracking.StatusUpdate("PLACED", "Order Placed",
        "Your order has been received and logged into our fulfillment queue.", "NextGen Order Management", orderDate));

    String cur = status != null ? status.trim().toUpperCase() : "PLACED";
    Instant now = Instant.now();

    if ("CANCELLED".equals(cur)) {
      t.setEstimatedArrival("Cancelled");
      t.setEstimatedMinutes(0);
      t.setDistanceKm(0);
      updates.add(new DeliveryTracking.StatusUpdate("CANCELLED", "Order Cancelled",
          "This order has been cancelled.", "Customer Support", now));
      t.setCourierLocation(t.getWarehouse());
    } else if ("DELIVERED".equals(cur)) {
      Instant dDate = deliveredDate != null ? deliveredDate : now;
      updates.add(new DeliveryTracking.StatusUpdate("CONFIRMED", "Order Confirmed", "Payment verified and inventory allocated.", "Fulfillment Hub", orderDate.plusSeconds(300)));
      updates.add(new DeliveryTracking.StatusUpdate("PACKED", "Packed & Inspected", "Order packaged securely with tamper-evident seal.", "Fulfillment Hub", orderDate.plusSeconds(900)));
      updates.add(new DeliveryTracking.StatusUpdate("SHIPPED", "Dispatched to Courier", "Package handed over to NextGen Express.", "Sorting Center", orderDate.plusSeconds(1800)));
      updates.add(new DeliveryTracking.StatusUpdate("OUT_FOR_DELIVERY", "Out for Delivery", t.getDeliveryPersonName() + " departed for your delivery address.", "Local Station", orderDate.plusSeconds(2700)));
      updates.add(new DeliveryTracking.StatusUpdate("DELIVERED", "Package Delivered", "Delivered safely. Verified with delivery handover PIN.", t.getDestination().getName(), dDate));
      t.setEstimatedArrival("Delivered");
      t.setEstimatedMinutes(0);
      t.setDistanceKm(0.0);
      DeliveryTracking.Location curLoc = new DeliveryTracking.Location(t.getDestination().getLat(), t.getDestination().getLng(), "Delivered at Destination");
      curLoc.setHeading(45);
      t.setCourierLocation(curLoc);
    } else if ("OUT_FOR_DELIVERY".equals(cur)) {
      updates.add(new DeliveryTracking.StatusUpdate("CONFIRMED", "Order Confirmed", "Payment verified and inventory allocated.", "Fulfillment Hub", orderDate.plusSeconds(300)));
      updates.add(new DeliveryTracking.StatusUpdate("PACKED", "Packed & Inspected", "Order packaged securely with tamper-evident seal.", "Fulfillment Hub", orderDate.plusSeconds(900)));
      updates.add(new DeliveryTracking.StatusUpdate("SHIPPED", "Dispatched to Courier", "Package handed over to NextGen Express.", "Sorting Center", orderDate.plusSeconds(1800)));
      updates.add(new DeliveryTracking.StatusUpdate("OUT_FOR_DELIVERY", "Out for Delivery", t.getDeliveryPersonName() + " is en route to your address on " + t.getVehicleNumber() + ".", "On the Way", now));
      t.setEstimatedArrival("Arriving in ~15 mins");
      t.setEstimatedMinutes(15);
      t.setDistanceKm(1.8);
      DeliveryTracking.Location mid = wps.size() > 4 ? wps.get(4) : wps.get(wps.size() - 1);
      DeliveryTracking.Location curLoc = new DeliveryTracking.Location(mid.getLat(), mid.getLng(), "In Transit - " + mid.getName());
      curLoc.setHeading(38);
      t.setCourierLocation(curLoc);
    } else if ("SHIPPED".equals(cur)) {
      updates.add(new DeliveryTracking.StatusUpdate("CONFIRMED", "Order Confirmed", "Payment verified and inventory allocated.", "Fulfillment Hub", orderDate.plusSeconds(300)));
      updates.add(new DeliveryTracking.StatusUpdate("PACKED", "Packed & Inspected", "Order packaged securely with tamper-evident seal.", "Fulfillment Hub", orderDate.plusSeconds(900)));
      updates.add(new DeliveryTracking.StatusUpdate("SHIPPED", "In Transit", "Package moving between regional sorting hubs.", "Sorting Hub", now));
      t.setEstimatedArrival("Today by 7:00 PM");
      t.setEstimatedMinutes(45);
      t.setDistanceKm(3.6);
      DeliveryTracking.Location mid = wps.size() > 2 ? wps.get(2) : wps.get(0);
      DeliveryTracking.Location curLoc = new DeliveryTracking.Location(mid.getLat(), mid.getLng(), mid.getName());
      curLoc.setHeading(42);
      t.setCourierLocation(curLoc);
    } else if ("PACKED".equals(cur)) {
      updates.add(new DeliveryTracking.StatusUpdate("CONFIRMED", "Order Confirmed", "Payment verified and inventory allocated.", "Fulfillment Hub", orderDate.plusSeconds(300)));
      updates.add(new DeliveryTracking.StatusUpdate("PACKED", "Package Packed", "Items quality checked and boxed.", "Packaging Dept", now));
      t.setEstimatedArrival("Today by 8:00 PM");
      t.setEstimatedMinutes(75);
      t.setDistanceKm(4.8);
      t.setCourierLocation(t.getWarehouse());
    } else if ("CONFIRMED".equals(cur)) {
      updates.add(new DeliveryTracking.StatusUpdate("CONFIRMED", "Order Confirmed", "Payment verified and order allocated to warehouse.", "System", now));
      t.setEstimatedArrival("Expected Tomorrow");
      t.setEstimatedMinutes(120);
      t.setDistanceKm(5.2);
      t.setCourierLocation(t.getWarehouse());
    } else { // PLACED
      t.setEstimatedArrival("Expected in 1-2 days");
      t.setEstimatedMinutes(180);
      t.setDistanceKm(5.2);
      t.setCourierLocation(t.getWarehouse());
    }
    t.setUpdates(updates);
  }

  /**
   * Admin collects cash for a COD order (PENDING → PAID). Online orders are
   * already PAID; FAILED stays FAILED.
   */
  public Order updatePayment(String orderId, String paymentStatus) {
    Order o = get(orderId);
    String next = paymentStatus == null ? "" : paymentStatus.trim().toUpperCase();
    if (!java.util.Set.of("PENDING", "PAID").contains(next)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid payment status: " + paymentStatus);
    }
    if ("PAID".equals(o.getPaymentStatus()) && "PAID".equals(next)) return o;
    if (!"COD".equals(o.getPaymentMethod()) && "PENDING".equals(next)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Only COD orders can be PENDING");
    }
    if ("FAILED".equals(o.getPaymentStatus())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Failed payments cannot be marked paid");
    }
    o.setPaymentStatus(next);
    if ("PAID".equals(next)) {
      sendNotification(o.getUserId(), "PAYMENT_SUCCESS", "ORDERS", "Payment Received 💳",
          "Payment of ₹" + Math.round(o.getPayableAmount()) + " received for Order #" + o.getId() + ".",
          "/orders", "💳", Map.of("orderId", o.getId(), "amount", o.getPayableAmount()));
    }
    return orders.save(o);
  }
}
