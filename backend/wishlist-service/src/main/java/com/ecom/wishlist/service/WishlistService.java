package com.ecom.wishlist.service;

import com.ecom.wishlist.dto.AddWishlistItemRequest;
import com.ecom.wishlist.entity.Wishlist;
import com.ecom.wishlist.repository.WishlistRepository;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WishlistService {
  private final WishlistRepository repo;
  private final RestTemplate rest;

  public WishlistService(WishlistRepository repo, RestTemplate rest) {
    this.repo = repo;
    this.rest = rest;
  }

  public Wishlist getOrCreate(String userId) {
    return repo.findByUserId(userId).orElseGet(() -> {
      Wishlist w = new Wishlist();
      w.setId("WL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      w.setUserId(userId);
      return repo.save(w);
    });
  }

  public Wishlist add(String userId, AddWishlistItemRequest req) {
    Wishlist w = getOrCreate(userId);
    boolean exists = w.getItems().stream()
        .anyMatch(i -> i.getProductId().equals(req.productId()));
    if (!exists) {
      Wishlist.WishlistItem item = new Wishlist.WishlistItem();
      item.setProductId(req.productId());
      item.setPriceAtAdd(req.priceAtAdd() == null ? 0 : req.priceAtAdd());
      item.setAddedAt(Instant.now());
      w.getItems().add(item);
      w.setUpdatedAt(Instant.now());
      repo.save(w);
    }
    return w;
  }

  public Wishlist remove(String userId, String productId) {
    Wishlist w = getOrCreate(userId);
    w.getItems().removeIf(i -> i.getProductId().equals(productId));
    w.setUpdatedAt(Instant.now());
    return repo.save(w);
  }

  public boolean isInWishlist(String userId, String productId) {
    return getOrCreate(userId).getItems().stream()
        .anyMatch(i -> i.getProductId().equals(productId));
  }

  private void recalc(Wishlist w) {
    w.setUpdatedAt(Instant.now());
  }
}
