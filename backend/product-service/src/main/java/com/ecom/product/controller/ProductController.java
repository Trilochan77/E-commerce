package com.ecom.product.controller;

import com.ecom.product.dto.ProductRequest;
import com.ecom.product.entity.Product;
import com.ecom.product.service.ProductComparisonService;
import com.ecom.product.service.ProductService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ProductController {

  private final ProductService svc;
  private final ProductComparisonService comparison;

  public ProductController(ProductService svc, ProductComparisonService comparison) {
    this.svc = svc;
    this.comparison = comparison;
  }

  private void requireAdmin(String role) {
    if (!"ADMIN".equals(role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
  }

  @GetMapping("/api/products")
  public List<Product> list(@RequestParam(required = false) String category) {
    return svc.list(category);
  }

  /** Side-by-side comparison of 1–4 products (2+ recommended; the UI enforces it). */
  @GetMapping("/api/products/compare")
  public Map<String, Object> compare(@RequestParam String ids) {
    return comparison.compare(ids);
  }

  @GetMapping("/api/products/{id}")
  public Product get(@PathVariable String id) {
    return svc.get(id);
  }

  @PostMapping("/api/products")
  @ResponseStatus(HttpStatus.CREATED)
  public Product create(@RequestHeader(value = "X-Role", required = false) String role,
      @Valid @RequestBody ProductRequest req) {
    requireAdmin(role);
    return svc.create(req);
  }

  @PutMapping("/api/products/{id}")
  public Product update(@RequestHeader(value = "X-Role", required = false) String role,
      @PathVariable String id, @Valid @RequestBody ProductRequest req) {
    requireAdmin(role);
    return svc.update(id, req);
  }

  @DeleteMapping("/api/products/{id}")
  public Map<String, Object> delete(@RequestHeader(value = "X-Role", required = false) String role,
      @PathVariable String id) {
    requireAdmin(role);
    svc.delete(id);
    return Map.of("deleted", id);
  }

  @GetMapping("/api/products/{id}/availability")
  public Map<String, Object> availability(@PathVariable String id) {
    Product p = svc.get(id);
    return Map.of("productId", p.getId(), "stock", p.getStockQuantity(), "available", p.isAvailability());
  }

  @PutMapping("/api/products/{id}/stock")
  public Product stock(@PathVariable String id, @RequestBody Map<String, Integer> body) {
    return svc.adjustStock(id, body.getOrDefault("delta", 0));
  }
}
