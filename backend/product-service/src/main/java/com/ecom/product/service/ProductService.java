package com.ecom.product.service;

import com.ecom.product.dto.ProductRequest;
import com.ecom.product.entity.Product;
import com.ecom.product.repository.ProductRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductService {

  private final ProductRepository repo;
  private final EsSyncService es;

  public ProductService(ProductRepository repo, EsSyncService es) {
    this.repo = repo;
    this.es = es;
  }

  public List<Product> list(String categoryId) {
    if (categoryId != null && !categoryId.isBlank()) return repo.findByCategoryId(categoryId);
    return repo.findAll();
  }

  public Product get(String id) {
    return repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
  }

  public Product create(ProductRequest req) {
    Product p = new Product();
    p.setId("P-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    apply(p, req);
    p.setCreatedAt(Instant.now());
    Product saved = repo.save(p);
    es.upsert(saved);
    return saved;
  }

  public Product update(String id, ProductRequest req) {
    Product p = get(id);
    apply(p, req);
    p.setUpdatedAt(Instant.now());
    Product saved = repo.save(p);
    es.upsert(saved);
    return saved;
  }

  public void delete(String id) {
    get(id);
    repo.deleteById(id);
    es.delete(id);
  }

  /** delta negative = decrement (order), positive = restock (admin). */
  public Product adjustStock(String id, int delta) {
    Product p = get(id);
    int next = p.getStockQuantity() + delta;
    if (next < 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock");
    p.setStockQuantity(next);
    p.setAvailability(next > 0);
    p.setUpdatedAt(Instant.now());
    Product saved = repo.save(p);
    es.upsert(saved);
    return saved;
  }

  private void apply(Product p, ProductRequest req) {
    p.setName(req.name());
    p.setDescription(req.description());
    p.setPrice(req.price());
    p.setCategoryId(req.categoryId());
    p.setImages(req.images());
    p.setStockQuantity(req.stockQuantity());
    p.setAvailability(req.stockQuantity() > 0);
    p.setEligibleForReturn(req.eligibleForReturn());
    p.setUpdatedAt(Instant.now());
  }
}
