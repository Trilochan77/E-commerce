package com.ecom.product.service;

import com.ecom.product.entity.Product;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Best-effort ES sync via plain HTTP (no ES client version lock-in).
 * Failures are swallowed so Mongo remains source of truth.
 */
@Service
public class EsSyncService {

  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();

  @Value("${elasticsearch.uris:http://localhost:9200}")
  private String esUris;

  private String esc(String s) {
    return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
  }

  public void upsert(Product p) {
    try {
      String body = "{\"product_id\":\"" + esc(p.getId()) + "\",\"name\":\"" + esc(p.getName())
          + "\",\"description\":\"" + esc(p.getDescription()) + "\",\"category\":\"" + esc(p.getCategoryId())
          + "\",\"price\":" + p.getPrice() + ",\"availability\":" + p.isAvailability() + "}";
      HttpRequest req = HttpRequest.newBuilder()
          .uri(URI.create(esUris + "/products/_doc/" + p.getId()))
          .header("Content-Type", "application/json")
          .PUT(HttpRequest.BodyPublishers.ofString(body))
          .timeout(Duration.ofSeconds(5)).build();
      http.send(req, HttpResponse.BodyHandlers.discarding());
    } catch (Exception ignored) {
    }
  }

  public void delete(String id) {
    try {
      HttpRequest req = HttpRequest.newBuilder()
          .uri(URI.create(esUris + "/products/_doc/" + id))
          .DELETE().timeout(Duration.ofSeconds(5)).build();
      http.send(req, HttpResponse.BodyHandlers.discarding());
    } catch (Exception ignored) {
    }
  }
}
