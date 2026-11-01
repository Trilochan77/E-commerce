package com.ecom.wishlist.controller;

import com.ecom.wishlist.dto.AddWishlistItemRequest;
import com.ecom.wishlist.entity.Wishlist;
import com.ecom.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
public class WishlistController {
  private final WishlistService svc;

  public WishlistController(WishlistService svc) {
    this.svc = svc;
  }

  @GetMapping("/api/wishlist/{userId}")
  public Wishlist get(@PathVariable String userId) {
    return svc.getOrCreate(userId);
  }

  @PostMapping("/api/wishlist/{userId}/items")
  public Wishlist add(@PathVariable String userId, @Valid @RequestBody AddWishlistItemRequest req) {
    return svc.add(userId, req);
  }

  @DeleteMapping("/api/wishlist/{userId}/items/{productId}")
  public Wishlist remove(@PathVariable String userId, @PathVariable String productId) {
    return svc.remove(userId, productId);
  }

  @GetMapping("/api/wishlist/{userId}/contains/{productId}")
  public Map<String, Boolean> contains(@PathVariable String userId, @PathVariable String productId) {
    return Map.of("inWishlist", svc.isInWishlist(userId, productId));
  }
}
