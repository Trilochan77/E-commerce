package com.ecom.cart.controller;

import com.ecom.cart.dto.AddItemRequest;
import com.ecom.cart.entity.Cart;
import com.ecom.cart.service.CartService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
public class CartController {

  private final CartService svc;

  public CartController(CartService svc) {
    this.svc = svc;
  }

  @GetMapping("/api/cart/{userId}")
  public Cart get(@PathVariable String userId) {
    return svc.getOrCreate(userId);
  }

  @PostMapping("/api/cart/{userId}/items")
  public Cart add(@PathVariable String userId, @Valid @RequestBody AddItemRequest req) {
    return svc.add(userId, req);
  }

  @PutMapping("/api/cart/{userId}/items/{productId}")
  public Cart update(@PathVariable String userId, @PathVariable String productId,
      @RequestBody Map<String, Integer> body) {
    return svc.updateQty(userId, productId, body.getOrDefault("quantity", 1));
  }

  @DeleteMapping("/api/cart/{userId}/items/{productId}")
  public Cart remove(@PathVariable String userId, @PathVariable String productId) {
    return svc.remove(userId, productId);
  }

  @DeleteMapping("/api/cart/{userId}/clear")
  public Cart clear(@PathVariable String userId) {
    return svc.clear(userId);
  }
}
