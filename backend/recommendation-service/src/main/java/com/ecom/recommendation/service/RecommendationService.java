package com.ecom.recommendation.service;

import com.ecom.recommendation.dto.ActivityRequest;
import com.ecom.recommendation.entity.OrderRef;
import com.ecom.recommendation.entity.ProductDoc;
import com.ecom.recommendation.entity.UserActivity;
import com.ecom.recommendation.repository.OrderRefRepository;
import com.ecom.recommendation.repository.ProductDocRepository;
import com.ecom.recommendation.repository.UserActivityRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RecommendationService {

  private final UserActivityRepository activities;
  private final ProductDocRepository products;
  private final OrderRefRepository orders;

  @Value("${recommendation.default-limit:10}")
  private int defaultLimit;

  public RecommendationService(UserActivityRepository activities, ProductDocRepository products,
      OrderRefRepository orders) {
    this.activities = activities;
    this.products = products;
    this.orders = orders;
  }

  public UserActivity log(ActivityRequest req) {
    String type = req.type().trim().toUpperCase();
    if (!type.equals("VIEW") && !type.equals("SEARCH") && !type.equals("PURCHASE")) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "type must be VIEW, SEARCH or PURCHASE");
    }
    if (type.equals("VIEW") && (req.productId() == null || req.productId().isBlank())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "VIEW requires productId");
    }
    if (type.equals("SEARCH") && (req.keyword() == null || req.keyword().isBlank())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "SEARCH requires keyword");
    }
    UserActivity a = new UserActivity();
    a.setId("ACT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    a.setUserId(req.userId());
    a.setType(type);
    a.setProductId(req.productId());
    a.setCategoryId(req.categoryId());
    a.setKeyword(req.keyword());
    a.setOrderId(req.orderId());
    a.setTimestamp(Instant.now());
    // Enrich VIEW with the product's category so scoring works without a join.
    if (type.equals("VIEW") && (req.categoryId() == null || req.categoryId().isBlank())) {
      products.findById(req.productId()).ifPresent(p -> a.setCategoryId(p.getCategoryId()));
    }
    return activities.save(a);
  }

  /**
   * score(p) = 3 x purchaseCategoryMatch + 2 x viewCount + 2 x searchKeywordMatch + 1 x popularity
   * Cold start (no activity): top-N by popularity. Out-of-stock always excluded.
   */
  public Map<String, Object> recommend(String userId, Integer limit, boolean includePurchased) {
    int n = (limit == null || limit < 1) ? defaultLimit : Math.min(limit, 50);

    List<UserActivity> history = activities.findTop200ByUserIdOrderByTimestampDesc(userId);
    // COD orders stay PENDING until delivery — count them as purchases too.
    List<OrderRef> paidOrders = orders.findByUserIdAndPaymentStatusIn(userId, java.util.List.of("PAID", "PENDING"));

    // Purchased categories + product ids (from orders = ground truth, plus PURCHASE events).
    Map<String, Integer> purchaseCatCount = new HashMap<>();
    Set<String> purchasedIds = new HashSet<>();
    for (OrderRef o : paidOrders) {
      if (o.getItems() == null) continue;
      for (OrderRef.Item item : o.getItems()) {
        purchasedIds.add(item.getProductId());
        products.findById(item.getProductId()).ifPresent(p -> {
          if (p.getCategoryId() != null) purchaseCatCount.merge(p.getCategoryId(), 1, Integer::sum);
        });
      }
    }

    Map<String, Integer> viewCount = new HashMap<>();
    List<String> keywords = new ArrayList<>();
    for (UserActivity a : history) {
      if (a.getType().equals("VIEW") && a.getProductId() != null) {
        viewCount.merge(a.getProductId(), 1, Integer::sum);
      } else if (a.getType().equals("SEARCH") && a.getKeyword() != null) {
        keywords.add(a.getKeyword().toLowerCase());
      } else if (a.getType().equals("PURCHASE") && a.getOrderId() != null) {
        orders.findById(a.getOrderId()).ifPresent(o -> {
          if (o.getItems() != null) for (OrderRef.Item item : o.getItems()) purchasedIds.add(item.getProductId());
        });
      }
    }

    // Popularity = # PAID + COD-PENDING orders containing the product (global, all users).
    Map<String, Integer> popularity = new HashMap<>();
    for (OrderRef o : orders.findByPaymentStatusIn(java.util.List.of("PAID", "PENDING"))) {
      if (o.getItems() == null) continue;
      for (OrderRef.Item item : o.getItems()) popularity.merge(item.getProductId(), 1, Integer::sum);
    }

    boolean coldStart = history.isEmpty() && paidOrders.isEmpty();

    List<Map<String, Object>> scored = new ArrayList<>();
    for (ProductDoc p : products.findByAvailabilityTrue()) {
      if (!includePurchased && purchasedIds.contains(p.getId())) continue;
      int purchaseMatch = purchaseCatCount.getOrDefault(p.getCategoryId(), 0) > 0 ? 1 : 0;
      int views = viewCount.getOrDefault(p.getId(), 0);
      int searchMatch = matchesSearch(p, keywords) ? 1 : 0;
      int pop = popularity.getOrDefault(p.getId(), 0);
      double score = 3.0 * purchaseMatch + 2.0 * views + 2.0 * searchMatch + 1.0 * pop;
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("productId", p.getId());
      m.put("name", p.getName());
      m.put("price", p.getPrice());
      m.put("category", p.getCategoryId());
      m.put("image", p.getImages() == null || p.getImages().isEmpty() ? null : p.getImages().get(0));
      m.put("score", score);
      m.put("reasons", reasons(purchaseMatch, views, searchMatch, pop));
      scored.add(m);
    }
    scored.sort(Comparator.comparingDouble((Map<String, Object> m) -> (Double) m.get("score")).reversed());
    List<Map<String, Object>> top = scored.stream().limit(n).collect(Collectors.toList());

    return Map.of("userId", userId, "items", top, "count", top.size(),
        "coldStart", coldStart, "strategy", coldStart ? "popularity-fallback" : "personalized");
  }

  private boolean matchesSearch(ProductDoc p, List<String> keywords) {
    if (keywords.isEmpty()) return false;
    String hay = ((p.getName() == null ? "" : p.getName()) + " "
        + (p.getDescription() == null ? "" : p.getDescription())).toLowerCase();
    return keywords.stream().anyMatch(k -> !k.isBlank() && hay.contains(k.trim()));
  }

  private List<String> reasons(int purchaseMatch, int views, int searchMatch, int pop) {
    List<String> r = new ArrayList<>();
    if (purchaseMatch > 0) r.add("same-category-as-purchases");
    if (views > 0) r.add("viewed-" + views + "x");
    if (searchMatch > 0) r.add("matches-search");
    if (pop > 0) r.add("popular-" + pop + "-orders");
    if (r.isEmpty()) r.add("popular-fallback");
    return r;
  }

  /** Browsing history (SRS 3.1.7): VIEW events enriched with product info, newest first. */
  public Map<String, Object> browsingHistory(String userId, int limit) {
    List<UserActivity> views = activities.findByUserIdAndTypeOrderByTimestampDesc(userId, "VIEW");
    List<Map<String, Object>> items = new ArrayList<>();
    for (UserActivity a : views.stream().limit(Math.min(Math.max(limit, 1), 100)).toList()) {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("productId", a.getProductId());
      m.put("viewedAt", a.getTimestamp());
      products.findById(a.getProductId()).ifPresent(p -> {
        m.put("name", p.getName());
        m.put("price", p.getPrice());
        m.put("category", p.getCategoryId());
        m.put("image", p.getImages() == null || p.getImages().isEmpty() ? null : p.getImages().get(0));
      });
      items.add(m);
    }
    return Map.of("userId", userId, "items", items, "count", items.size());
  }
}
