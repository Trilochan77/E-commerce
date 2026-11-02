package com.ecom.order.controller;

import com.ecom.order.dto.CheckoutRequest;
import com.ecom.order.entity.DeliveryTracking;
import com.ecom.order.entity.Order;
import com.ecom.order.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class OrderController {

  private final OrderService svc;

  public OrderController(OrderService svc) {
    this.svc = svc;
  }

  @PostMapping("/api/orders/checkout")
  @ResponseStatus(HttpStatus.CREATED)
  public Order checkout(@Valid @RequestBody CheckoutRequest req) {
    return svc.checkout(req);
  }

  @GetMapping("/api/orders")
  public List<Order> all(@RequestHeader(value = "X-Role", required = false) String role) {
    if (!"ADMIN".equals(role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
    return svc.all();
  }

  @GetMapping("/api/orders/user/{userId}")
  public List<Order> history(@PathVariable String userId) {
    return svc.history(userId);
  }

  @GetMapping("/api/orders/{orderId}")
  public Order get(@PathVariable String orderId) {
    return svc.get(orderId);
  }

  @PutMapping("/api/orders/{orderId}/status")
  public Order status(@PathVariable String orderId, @RequestBody Map<String, String> body) {
    return svc.updateStatus(orderId, body.getOrDefault("status", "PLACED"));
  }

  @PutMapping("/api/orders/{orderId}/payment")
  public Order payment(@PathVariable String orderId, @RequestBody Map<String, String> body) {
    return svc.updatePayment(orderId, body.getOrDefault("paymentStatus", "PAID"));
  }

  @GetMapping("/api/orders/{orderId}/tracking")
  public DeliveryTracking tracking(@PathVariable String orderId,
      @RequestHeader(value = "X-User-Id", required = false) String userId,
      @RequestHeader(value = "X-Role", required = false) String role) {
    return svc.getTracking(orderId, userId, role);
  }

  @PutMapping("/api/orders/{orderId}/tracking/location")
  public DeliveryTracking updateLocation(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
    double lat = ((Number) body.getOrDefault("lat", 0.0)).doubleValue();
    double lng = ((Number) body.getOrDefault("lng", 0.0)).doubleValue();
    double heading = ((Number) body.getOrDefault("heading", 0.0)).doubleValue();
    double distanceKm = ((Number) body.getOrDefault("distanceKm", -1.0)).doubleValue();
    int estMins = ((Number) body.getOrDefault("estimatedMinutes", -1)).intValue();
    String status = (String) body.get("status");
    return svc.updateCourierLocation(orderId, lat, lng, heading, distanceKm, estMins, status);
  }

  @PostMapping("/api/orders/{orderId}/tracking/reset")
  public DeliveryTracking resetTracking(@PathVariable String orderId) {
    return svc.resetTracking(orderId);
  }
}
