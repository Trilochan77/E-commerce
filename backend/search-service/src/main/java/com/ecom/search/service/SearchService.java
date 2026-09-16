package com.ecom.search.service;

import com.ecom.search.entity.ProductDoc;
import com.ecom.search.repository.ProductDocRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SearchService {

  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
  private final ObjectMapper mapper = new ObjectMapper();
  private final ProductDocRepository mongo;

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

  public Map<String, Object> search(String q, String category, Double minPrice, Double maxPrice,
      String sort, int page, int size, String userId) {
    // Fire-and-forget activity log for Phase 2 recommendations; ignore failures.
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
        must.add("{\"multi_match\":{\"query\":\"" + esc(q) + "\",\"fields\":[\"name^3\",\"description\",\"category\"]}}");
      }
      List<String> filter = new ArrayList<>();
      if (category != null && !category.isBlank()) filter.add("{\"term\":{\"category\":\"" + esc(category) + "\"}}");
      if (minPrice != null || maxPrice != null) {
        String range = "{\"range\":{\"price\":{"
            + (minPrice != null ? "\"gte\":" + minPrice : "")
            + (minPrice != null && maxPrice != null ? "," : "")
            + (maxPrice != null ? "\"lte\":" + maxPrice : "") + "}}}";
        filter.add(range);
      }
      String sortJson = "";
      if ("price_asc".equals(sort)) sortJson = ",\"sort\":[{\"price\":\"asc\"}]";
      else if ("price_desc".equals(sort)) sortJson = ",\"sort\":[{\"price\":\"desc\"}]";

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
        m.put("productId", src.path("product_id").asText(hit.path("_id").asText()));
        m.put("name", src.path("name").asText(null));
        m.put("description", src.path("description").asText(null));
        m.put("category", src.path("category").asText(null));
        m.put("price", src.path("price").asDouble(0));
        m.put("availability", src.path("availability").asBoolean(true));
        items.add(m);
      }
      long total = root.path("hits").path("total").path("value").asLong(items.size());
      return Map.of("items", items, "total", total, "page", page, "size", size, "source", "elasticsearch");
    } catch (Exception e) {
      // Fallback to Mongo when ES is down (SRS: product-service list is the fallback path).
      List<ProductDoc> all = mongo.findAll();
      List<Map<String, Object>> items = all.stream()
          .filter(p -> q == null || q.isBlank()
              || (p.getName() + " " + p.getDescription()).toLowerCase().contains(q.toLowerCase()))
          .filter(p -> category == null || category.isBlank() || category.equals(p.getCategoryId()))
          .filter(p -> minPrice == null || p.getPrice() >= minPrice)
          .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
          .skip((long) page * size).limit(size)
          .map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("productId", p.getId());
            m.put("name", p.getName());
            m.put("price", p.getPrice());
            m.put("category", p.getCategoryId());
            m.put("availability", p.isAvailability());
            return (Map<String, Object>) m;
          }).toList();
      return Map.of("items", items, "total", items.size(), "page", page, "size", size, "source", "mongodb-fallback");
    }
  }

  public Map<String, Object> reindex() {
    List<ProductDoc> all = mongo.findAll();
    int ok = 0;
    for (ProductDoc p : all) {
      try {
        String body = "{\"product_id\":\"" + esc(p.getId()) + "\",\"name\":\"" + esc(p.getName())
            + "\",\"description\":\"" + esc(p.getDescription()) + "\",\"category\":\"" + esc(p.getCategoryId())
            + "\",\"price\":" + p.getPrice() + ",\"availability\":" + p.isAvailability() + "}";
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
