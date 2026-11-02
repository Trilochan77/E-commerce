package com.ecom.product.service;

import com.ecom.product.entity.Product;
import com.ecom.product.repository.ProductRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Side-by-side product comparison.
 *
 * <p>Only stored catalogue fields are returned. Specifications and features are
 * split out of the existing free-text {@code description}: a comma-separated
 * fragment that contains a number is treated as a specification (e.g. "40h
 * battery", "16GB RAM"), everything else as a feature (e.g. "ANC"). Nothing is
 * invented; a missing brand is reported as {@code null} so the UI can say
 * "Not specified".
 */
@Service
public class ProductComparisonService {

  public static final int MIN_PRODUCTS = 2;
  public static final int MAX_PRODUCTS = 4;

  private final ProductRepository repo;

  public ProductComparisonService(ProductRepository repo) {
    this.repo = repo;
  }

  public Map<String, Object> compare(String idsCsv) {
    List<String> requested = parseIds(idsCsv);
    if (requested.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Provide at least one product id via ?ids=P-1001,P-1003");
    }
    if (requested.size() > MAX_PRODUCTS) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Compare at most " + MAX_PRODUCTS + " products at a time");
    }

    List<Map<String, Object>> products = new ArrayList<>();
    List<String> unknown = new ArrayList<>();
    for (String id : requested) {
      Optional<Product> found = repo.findById(id);
      if (found.isEmpty()) {
        unknown.add(id);
        continue;
      }
      products.add(view(found.get()));
    }

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("products", products);
    out.put("count", products.size());
    out.put("minProducts", MIN_PRODUCTS);
    out.put("maxProducts", MAX_PRODUCTS);
    out.put("unknownIds", unknown);
    out.put("readyToCompare", products.size() >= MIN_PRODUCTS);
    return out;
  }

  private Map<String, Object> view(Product p) {
    List<String> specs = specifications(p.getDescription());
    List<String> features = features(p.getDescription());

    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", p.getId());
    m.put("name", p.getName());
    m.put("brand", blankToNull(p.getBrand()));
    m.put("description", p.getDescription());
    m.put("price", p.getPrice());
    m.put("categoryId", p.getCategoryId());
    m.put("images", p.getImages());
    m.put("stockQuantity", p.getStockQuantity());
    m.put("availability", p.isAvailability());
    m.put("eligibleForReturn", p.isEligibleForReturn());
    m.put("averageRating", p.getAverageRating());
    m.put("reviewCount", p.getReviewCount());
    m.put("specifications", specs);
    m.put("features", features);
    return m;
  }

  /** Comma-separated description fragments that contain a digit. */
  public static List<String> specifications(String description) {
    List<String> out = new ArrayList<>();
    for (String fragment : fragments(description)) {
      if (fragment.matches(".*\\d.*")) out.add(fragment);
    }
    return out;
  }

  /** Comma-separated description fragments without any digit. */
  public static List<String> features(String description) {
    List<String> out = new ArrayList<>();
    for (String fragment : fragments(description)) {
      if (!fragment.matches(".*\\d.*")) out.add(fragment);
    }
    return out;
  }

  private static List<String> fragments(String description) {
    List<String> out = new ArrayList<>();
    if (description == null || description.isBlank()) return out;
    for (String raw : description.split("[,;\\n]")) {
      String trimmed = raw.trim().replaceAll("\\.$", "");
      if (trimmed.isEmpty()) continue;
      // Keep the original casing of the stored value, only normalising whitespace.
      out.add(trimmed.replaceAll("\\s+", " "));
    }
    return out;
  }

  private List<String> parseIds(String idsCsv) {
    if (idsCsv == null || idsCsv.isBlank()) return List.of();
    Set<String> unique = new LinkedHashSet<>();
    for (String raw : idsCsv.split(",")) {
      String id = raw.trim();
      if (!id.isEmpty()) unique.add(id);
    }
    return new ArrayList<>(unique);
  }

  private String blankToNull(String value) {
    if (value == null || value.isBlank()) return null;
    return value.trim();
  }
}
