package com.ecom.cart.service;

import com.ecom.cart.dto.AddItemRequest;
import com.ecom.cart.entity.Cart;
import com.ecom.cart.repository.CartRepository;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CartService {

  private final CartRepository repo;
  private final RestTemplate rest;

  @Value("${product-service.url:http://localhost:8082}")
  private String productUrl;

  public CartService(CartRepository repo, RestTemplate rest) {
    this.repo = repo;
    this.rest = rest;
  }

  private Map<String, Object> fetchProduct(String productId) {
    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> p = rest.getForObject(productUrl + "/api/products/" + productId, Map.class);
      if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
      return p;
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "product-service unavailable");
    }
  }

  public Cart getOrCreate(String userId) {
    return repo.findByUserId(userId).orElseGet(() -> {
      Cart c = new Cart();
      c.setId("C-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      c.setUserId(userId);
      return repo.save(c);
    });
  }

  public Cart add(String userId, AddItemRequest req) {
    Map<String, Object> p = fetchProduct(req.productId());
    double price = ((Number) p.getOrDefault("price", 0)).doubleValue();
    int stock = ((Number) p.getOrDefault("stockQuantity", 0)).intValue();
    Cart cart = getOrCreate(userId);
    Cart.CartItem existing = cart.getItems().stream()
        .filter(i -> i.getProductId().equals(req.productId())).findFirst().orElse(null);
    int nextQty = req.quantity() + (existing == null ? 0 : existing.getQuantity());
    if (nextQty > stock) throw new ResponseStatusException(HttpStatus.CONFLICT, "Quantity exceeds stock (" + stock + ")");
    if (existing == null) {
      Cart.CartItem item = new Cart.CartItem();
      item.setProductId(req.productId());
      item.setQuantity(req.quantity());
      item.setUnitPrice(price);
      cart.getItems().add(item);
    } else {
      existing.setQuantity(nextQty);
      existing.setUnitPrice(price);
    }
    recalc(cart);
    return repo.save(cart);
  }

  public Cart updateQty(String userId, String productId, int quantity) {
    if (quantity < 1) throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Quantity must be >= 1");
    Map<String, Object> p = fetchProduct(productId);
    int stock = ((Number) p.getOrDefault("stockQuantity", 0)).intValue();
    if (quantity > stock) throw new ResponseStatusException(HttpStatus.CONFLICT, "Quantity exceeds stock (" + stock + ")");
    Cart cart = getOrCreate(userId);
    Cart.CartItem existing = cart.getItems().stream()
        .filter(i -> i.getProductId().equals(productId)).findFirst()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not in cart"));
    existing.setQuantity(quantity);
    recalc(cart);
    return repo.save(cart);
  }

  public Cart remove(String userId, String productId) {
    Cart cart = getOrCreate(userId);
    cart.getItems().removeIf(i -> i.getProductId().equals(productId));
    recalc(cart);
    return repo.save(cart);
  }

  public Cart clear(String userId) {
    Cart cart = getOrCreate(userId);
    cart.getItems().clear();
    recalc(cart);
    return repo.save(cart);
  }

  private void recalc(Cart cart) {
    double total = cart.getItems().stream().mapToDouble(i -> i.getUnitPrice() * i.getQuantity()).sum();
    cart.setTotalAmount(total);
    cart.setUpdatedAt(Instant.now());
  }
}
