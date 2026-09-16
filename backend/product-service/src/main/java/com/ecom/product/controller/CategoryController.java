package com.ecom.product.controller;

import com.ecom.product.entity.Category;
import com.ecom.product.repository.CategoryRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

  private final CategoryRepository repo;

  public CategoryController(CategoryRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public List<Category> list() {
    return repo.findAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Category create(@RequestHeader(value = "X-Role", required = false) String role,
      @RequestBody Category c) {
    if (!"ADMIN".equals(role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
    c.setId("C-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    return repo.save(c);
  }

  @PutMapping("/{id}")
  public Category update(@RequestHeader(value = "X-Role", required = false) String role,
      @PathVariable String id, @RequestBody Category c) {
    if (!"ADMIN".equals(role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
    Category existing = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
    existing.setName(c.getName());
    existing.setDescription(c.getDescription());
    return repo.save(existing);
  }

  @DeleteMapping("/{id}")
  public Map<String, Object> delete(@RequestHeader(value = "X-Role", required = false) String role,
      @PathVariable String id) {
    if (!"ADMIN".equals(role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
    repo.deleteById(id);
    return Map.of("deleted", id);
  }
}
