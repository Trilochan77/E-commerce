package com.ecom.search.service;

import com.ecom.search.entity.ProductDoc;
import com.ecom.search.repository.ProductDocRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SearchService {

  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
  private final JsonMapper mapper = JsonMapper.builder().build();
  private final ProductDocRepository mongo;

  private static final List<String> KNOWN_BRANDS = List.of(
      "Apple", "Samsung", "Sony", "OnePlus", "Google", "boAt", "Realme", "Boult",
      "Noise", "Dell", "ASUS", "HP", "Lenovo", "Acer", "JBL", "Bose", "Marshall",
      "Puma", "Nike", "Adidas", "Levi's", "Casio", "Titan", "Fastrack"
  );

  private static final Map<String, String> CATEGORY_NAMES = Map.of(
      "C-01", "Electronics",
      "C-02", "Fashion",
      "C-03", "Home & Kitchen",
      "C-04", "Books",
      "C-05", "Sports & Fitness"
  );

  @Value("${elasticsearch.uris:http://localhost:9200}")
  private String esUris;

  @Value("${recommendation.url:http://localhost:8084}")
  private String recUrl;

  public SearchService(ProductDocRepository mongo) {
    this.mongo = mongo;
  }

  private String esc(String s) {
    return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
  }

  public String effectiveBrand(ProductDoc p) {
    if (p.getBrand() != null && !p.getBrand().trim().isBlank()) {
      return p.getBrand().trim();
    }
    String name = (p.getName() != null ? p.getName() : "").toLowerCase();
    if (name.contains("iphone") || name.contains("ipad") || name.contains("macbook") || name.contains("airpods")) {
      return "Apple";
    }
    if (name.contains("galaxy")) {
      return "Samsung";
    }
    if (name.contains("bravia") || name.contains("playstation")) {
      return "Sony";
    }
    if (name.contains("rockerz") || name.contains("airdopes") || name.contains("boat")) {
      return "boAt";
    }
    if (name.contains("rog") || name.contains("zenbook")) {
      return "ASUS";
    }
    if (name.contains("thinkpad") || name.contains("ideapad") || name.contains("legion")) {
      return "Lenovo";
    }
    for (String b : KNOWN_BRANDS) {
      if (name.contains(b.toLowerCase())) {
        return b;
      }
    }
    return "Other";
  }

  public Map<String, Object> search(String q, String category, String brand, Double minPrice, Double maxPrice,
      Double minRating, String sort, int page, int size, String userId) {
    // Fire-and-forget activity log for recommendations
    if (userId != null && !userId.isBlank() && q != null && !q.isBlank()) {
      try {
        String body = "{\"userId\":\"" + esc(userId) + "\",\"type\":\"SEARCH\",\"keyword\":\"" + esc(q) + "\"}";
        HttpRequest log = HttpRequest.newBuilder().uri(URI.create(recUrl + "/api/activity"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body)).timeout(Duration.ofSeconds(2)).build();
        http.sendAsync(log, HttpResponse.BodyHandlers.discarding());
      } catch (Exception ignored) {
      }
    }

    try {
      List<String> must = new ArrayList<>();
      if (q != null && !q.isBlank()) {
        must.add("{\"multi_match\":{\"query\":\"" + esc(q) + "\",\"fields\":[\"name^3\",\"description\",\"category\",\"brand\"]}}");
      }
      List<String> filter = new ArrayList<>();
      if (category != null && !category.isBlank()) {
        filter.add("{\"term\":{\"category\":\"" + esc(category) + "\"}}");
      }
      if (brand != null && !brand.isBlank()) {
        filter.add("{\"term\":{\"brand\":\"" + esc(brand) + "\"}}");
      }
      if (minPrice != null || maxPrice != null) {
        String range = "{\"range\":{\"price\":{"
            + (minPrice != null ? "\"gte\":" + minPrice : "")
            + (minPrice != null && maxPrice != null ? "," : "")
            + (maxPrice != null ? "\"lte\":" + maxPrice : "") + "}}}";
        filter.add(range);
      }
      if (minRating != null) {
        filter.add("{\"range\":{\"averageRating\":{\"gte\":" + minRating + "}}}");
      }

      String sortJson = "";
      if ("price_asc".equals(sort)) sortJson = ",\"sort\":[{\"price\":\"asc\"}]";
      else if ("price_desc".equals(sort)) sortJson = ",\"sort\":[{\"price\":\"desc\"}]";
      else if ("newest".equals(sort)) sortJson = ",\"sort\":[{\"createdAt\":\"desc\"}]";
      else if ("rating_desc".equals(sort)) sortJson = ",\"sort\":[{\"averageRating\":\"desc\"}]";
      else if ("popular".equals(sort)) sortJson = ",\"sort\":[{\"reviewCount\":\"desc\"}]";

      String dsl = "{\"from\":" + (page * size) + ",\"size\":" + size
          + ",\"query\":{\"bool\":{\"must\":[" + String.join(",", must)
          + "],\"filter\":[" + String.join(",", filter) + "]}}" + sortJson + "}";
      HttpRequest req = HttpRequest.newBuilder().uri(URI.create(esUris + "/products/_search"))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(dsl)).timeout(Duration.ofSeconds(5)).build();
      HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
      JsonNode root = mapper.readTree(res.body());
      List<Map<String, Object>> items = new ArrayList<>();
      for (JsonNode hit : root.path("hits").path("hits")) {
        JsonNode src = hit.path("_source");
        Map<String, Object> m = new LinkedHashMap<>();
        String pid = src.path("product_id").asString(hit.path("_id").asString());
        m.put("id", pid);
        m.put("productId", pid);
        m.put("name", src.path("name").asString(null));
        m.put("description", src.path("description").asString(null));
        m.put("category", src.path("category").asString(null));
        m.put("categoryId", src.path("category").asString(null));
        m.put("brand", src.path("brand").asString(null));
        m.put("price", src.path("price").asDouble(0));
        m.put("availability", src.path("availability").asBoolean(true));
        m.put("averageRating", src.path("averageRating").asDouble(0.0));
        m.put("reviewCount", src.path("reviewCount").asInt(0));
        items.add(m);
      }
      long total = root.path("hits").path("total").path("value").asLong(items.size());
      return Map.of("items", items, "total", total, "page", page, "size", size, "source", "elasticsearch");
    } catch (Exception e) {
      // Robust Mongo fallback
      List<ProductDoc> all = mongo.findAll();
      final String queryLower = (q != null && !q.isBlank()) ? q.trim().toLowerCase() : null;
      final String catFilter = (category != null && !category.isBlank()) ? category.trim() : null;
      final String brandFilter = (brand != null && !brand.isBlank()) ? brand.trim().toLowerCase() : null;

      List<ProductDoc> filtered = all.stream()
          .filter(p -> {
            if (queryLower == null) return true;
            String text = ((p.getName() != null ? p.getName() : "") + " "
                + (p.getDescription() != null ? p.getDescription() : "") + " "
                + effectiveBrand(p) + " "
                + (p.getCategoryId() != null ? CATEGORY_NAMES.getOrDefault(p.getCategoryId(), p.getCategoryId()) : "")).toLowerCase();
            return text.contains(queryLower);
          })
          .filter(p -> {
            if (catFilter == null || "All".equalsIgnoreCase(catFilter)) return true;
            return catFilter.equalsIgnoreCase(p.getCategoryId())
                || catFilter.equalsIgnoreCase(CATEGORY_NAMES.get(p.getCategoryId()));
          })
          .filter(p -> {
            if (brandFilter == null || "all".equalsIgnoreCase(brandFilter)) return true;
            String pb = effectiveBrand(p).toLowerCase();
            return pb.equals(brandFilter) || pb.contains(brandFilter) || brandFilter.contains(pb);
          })
          .filter(p -> minPrice == null || p.getPrice() >= minPrice)
          .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
          .filter(p -> minRating == null || p.getAverageRating() >= minRating)
          .collect(Collectors.toList());

      // Sorting
      if ("price_asc".equalsIgnoreCase(sort)) {
        filtered.sort(Comparator.comparingDouble(ProductDoc::getPrice));
      } else if ("price_desc".equalsIgnoreCase(sort)) {
        filtered.sort(Comparator.comparingDouble(ProductDoc::getPrice).reversed());
      } else if ("newest".equalsIgnoreCase(sort)) {
        filtered.sort(Comparator.comparing((ProductDoc p) -> p.getCreatedAt() != null ? p.getCreatedAt() : Instant.EPOCH).reversed());
      } else if ("rating_desc".equalsIgnoreCase(sort)) {
        filtered.sort(Comparator.comparingDouble(ProductDoc::getAverageRating).reversed()
            .thenComparing(Comparator.comparingInt(ProductDoc::getReviewCount).reversed()));
      } else if ("popular".equalsIgnoreCase(sort)) {
        filtered.sort(Comparator.comparingInt(ProductDoc::getReviewCount).reversed()
            .thenComparing(Comparator.comparingDouble(ProductDoc::getAverageRating).reversed()));
      }

      int total = filtered.size();
      int fromIndex = Math.min(page * size, total);
      int toIndex = Math.min(fromIndex + size, total);
      List<ProductDoc> paged = filtered.subList(fromIndex, toIndex);

      List<Map<String, Object>> items = paged.stream().map(p -> {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("productId", p.getId());
        m.put("name", p.getName());
        m.put("description", p.getDescription());
        m.put("price", p.getPrice());
        m.put("categoryId", p.getCategoryId());
        m.put("category", CATEGORY_NAMES.getOrDefault(p.getCategoryId(), p.getCategoryId()));
        m.put("brand", effectiveBrand(p));
        m.put("availability", p.isAvailability());
        m.put("stockQuantity", p.getStockQuantity());
        m.put("eligibleForReturn", p.isEligibleForReturn());
        m.put("averageRating", p.getAverageRating());
        m.put("reviewCount", p.getReviewCount());
        m.put("createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : null);
        List<String> imgs = (p.getImages() != null && !p.getImages().isEmpty())
            ? p.getImages()
            : List.of("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80");
        m.put("images", imgs);
        m.put("image", imgs.get(0));
        return m;
      }).collect(Collectors.toList());

      // Also return available brands and category counts for facets
      Set<String> availableBrands = all.stream()
          .map(this::effectiveBrand)
          .filter(b -> b != null && !b.isBlank() && !"Other".equals(b))
          .sorted()
          .collect(Collectors.toCollection(LinkedHashSet::new));

      return Map.of(
          "items", items,
          "total", total,
          "page", page,
          "size", size,
          "availableBrands", availableBrands,
          "source", "mongodb-fallback"
      );
    }
  }

  public List<Map<String, String>> suggestions(String q) {
    if (q == null || q.trim().isBlank()) {
      return Collections.emptyList();
    }
    String term = q.trim().toLowerCase();
    List<ProductDoc> all = mongo.findAll();
    List<Map<String, String>> result = new ArrayList<>();
    Set<String> seen = new HashSet<>();

    // 1. Check Matching Brands
    for (String b : KNOWN_BRANDS) {
      if (b.toLowerCase().contains(term)) {
        String key = "brand:" + b.toLowerCase();
        if (seen.add(key)) {
          result.add(Map.of(
              "type", "brand",
              "text", b,
              "title", b + " (Brand)"
          ));
        }
      }
    }

    // 2. Check Matching Categories
    for (Map.Entry<String, String> entry : CATEGORY_NAMES.entrySet()) {
      if (entry.getValue().toLowerCase().contains(term) || entry.getKey().toLowerCase().contains(term)) {
        String key = "cat:" + entry.getKey();
        if (seen.add(key)) {
          result.add(Map.of(
              "type", "category",
              "id", entry.getKey(),
              "text", entry.getValue(),
              "title", entry.getValue() + " (Category)"
          ));
        }
      }
    }

    // 3. Check Matching Products (Titles)
    for (ProductDoc p : all) {
      if (p.getName() != null && p.getName().toLowerCase().contains(term)) {
        String key = "product:" + p.getId();
        if (seen.add(key)) {
          String img = (p.getImages() != null && !p.getImages().isEmpty()) ? p.getImages().get(0) : "";
          Map<String, String> m = new HashMap<>();
          m.put("type", "product");
          m.put("id", p.getId());
          m.put("text", p.getName());
          m.put("title", p.getName());
          m.put("price", String.valueOf((long) p.getPrice()));
          m.put("image", img);
          m.put("brand", effectiveBrand(p));
          result.add(m);
        }
      }
      if (result.size() >= 10) break;
    }

    return result;
  }

  public Map<String, Object> reindex() {
    List<ProductDoc> all = mongo.findAll();
    int ok = 0;
    for (ProductDoc p : all) {
      try {
        String body = "{\"product_id\":\"" + esc(p.getId()) + "\",\"name\":\"" + esc(p.getName())
            + "\",\"description\":\"" + esc(p.getDescription()) + "\",\"category\":\"" + esc(p.getCategoryId())
            + "\",\"brand\":\"" + esc(effectiveBrand(p)) + "\""
            + "\",\"averageRating\":" + p.getAverageRating()
            + ",\"reviewCount\":" + p.getReviewCount()
            + ",\"price\":" + p.getPrice() + ",\"availability\":" + p.isAvailability() + "}";
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(esUris + "/products/_doc/" + p.getId()))
            .header("Content-Type", "application/json")
            .PUT(HttpRequest.BodyPublishers.ofString(body)).timeout(Duration.ofSeconds(5)).build();
        http.send(req, HttpResponse.BodyHandlers.discarding());
        ok++;
      } catch (Exception ignored) {
      }
    }
    return Map.of("indexed", ok, "total", all.size());
  }
}
