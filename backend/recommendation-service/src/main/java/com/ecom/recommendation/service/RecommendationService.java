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
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Personalized recommendation engine.
 *
 * <p>The ranking is an explicit, explainable <b>hybrid</b> of four deterministic signals:
 * <ol>
 *   <li><b>Content-based</b> — item/item similarity to the products the user viewed or bought
 *       (category + shared words + price proximity). No embeddings, no model.</li>
 *   <li><b>Category affinity</b> — how much of the user's recent activity sits in the
 *       candidate's category.</li>
 *   <li><b>Search intent</b> — whether the candidate text matches a keyword the user searched.</li>
 *   <li><b>Popularity / trending</b> — time-decayed order + view volume from all users.</li>
 * </ol>
 * Cold-start users (no activity) fall back to the trending / popularity ranking.
 * There is no machine learning or deep learning involved.
 */
@Service
public class RecommendationService {

  private static final List<String> COUNTED_ORDERS = List.of("PAID", "PENDING");

  private final UserActivityRepository activities;
  private final ProductDocRepository products;
  private final OrderRefRepository orders;
  private final SmartRecommendationService smart;

  @Value("${recommendation.default-limit:10}")
  private int defaultLimit;

  public RecommendationService(UserActivityRepository activities, ProductDocRepository products,
      OrderRefRepository orders, SmartRecommendationService smart) {
    this.activities = activities;
    this.products = products;
    this.orders = orders;
    this.smart = smart;
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
   * Hybrid personalized ranking. Every component is normalized to [0, 1], then combined as:
   *
   * <pre>
   * score = 3.2 × contentSimilarity
   *       + 2.4 × categoryAffinity
   *       + 1.6 × trending
   *       + 1.4 × searchMatch
   *       + 0.5 × rating
   *       + 0.4 × min(3, thisProductViews)
   * </pre>
   *
   * Cold start (no activity): the same formula collapses to trending + rating.
   * Out-of-stock products are always excluded.
   */
  public Map<String, Object> recommend(String userId, Integer limit, boolean includePurchased) {
    int n = (limit == null || limit < 1) ? defaultLimit : Math.min(limit, 50);

    List<UserActivity> history = activities.findTop200ByUserIdOrderByTimestampDesc(userId);
    // COD orders stay PENDING until delivery — count them as purchases too.
    List<OrderRef> paidOrders = orders.findByUserIdAndPaymentStatusIn(userId, COUNTED_ORDERS);

    // ---- purchases (orders are ground truth, plus PURCHASE events) ----
    Map<String, Integer> purchaseCategoryCount = new HashMap<>();
    Set<String> purchasedIds = new HashSet<>();
    for (OrderRef o : paidOrders) {
      if (o.getItems() == null) continue;
      for (OrderRef.Item item : o.getItems()) {
        if (item.getProductId() == null) continue;
        purchasedIds.add(item.getProductId());
        products.findById(item.getProductId()).ifPresent(p -> {
          if (p.getCategoryId() != null) {
            purchaseCategoryCount.merge(p.getCategoryId(), 1, Integer::sum);
          }
        });
      }
    }

    // ---- browsing + search signals (recency weighted, newest first) ----
    Map<String, Integer> viewCount = new HashMap<>();
    Map<String, Double> viewWeight = new LinkedHashMap<>();
    List<String> keywords = new ArrayList<>();
    for (UserActivity a : history) {
      if ("VIEW".equals(a.getType()) && a.getProductId() != null) {
        viewCount.merge(a.getProductId(), 1, Integer::sum);
        viewWeight.putIfAbsent(a.getProductId(), 1.0 / (1.0 + 0.15 * viewWeight.size()));
      } else if ("SEARCH".equals(a.getType()) && a.getKeyword() != null && !a.getKeyword().isBlank()) {
        keywords.add(a.getKeyword().toLowerCase());
      } else if ("PURCHASE".equals(a.getType()) && a.getOrderId() != null) {
        orders.findById(a.getOrderId()).ifPresent(o -> {
          if (o.getItems() != null) {
            for (OrderRef.Item item : o.getItems()) {
              if (item.getProductId() != null) purchasedIds.add(item.getProductId());
            }
          }
        });
      }
    }

    // ---- category affinity: recency-weighted views + purchases ----
    Map<String, Double> categoryAffinity = new HashMap<>();
    for (Map.Entry<String, Double> e : viewWeight.entrySet()) {
      products.findById(e.getKey()).ifPresent(p -> {
        if (p.getCategoryId() != null) {
          categoryAffinity.merge(p.getCategoryId(), e.getValue(), Double::sum);
        }
      });
    }
    for (Map.Entry<String, Integer> e : purchaseCategoryCount.entrySet()) {
      categoryAffinity.merge(e.getKey(), 2.0 * e.getValue(), Double::sum);
    }

    // ---- global trending (time decayed) + all-time popularity ----
    Map<String, Double> trending = smart.trendingScores(30);
    double maxTrending = trending.values().stream().mapToDouble(Double::doubleValue).max().orElse(0);
    Map<String, Integer> popularity = new HashMap<>();
    for (OrderRef o : orders.findByPaymentStatusIn(COUNTED_ORDERS)) {
      if (o.getItems() == null) continue;
      for (OrderRef.Item item : o.getItems()) {
        if (item.getProductId() != null) popularity.merge(item.getProductId(), 1, Integer::sum);
      }
    }

    boolean coldStart = history.isEmpty() && paidOrders.isEmpty();
    List<ProductDoc> candidates = products.findByAvailabilityTrue();

    // ---- content-based signal: similarity to viewed + purchased products ----
    List<ProductDoc> viewedDocs = viewWeight.keySet().stream()
        .map(products::findById).flatMap(Optional::stream).toList();
    List<ProductDoc> purchasedDocs = purchasedIds.stream()
        .map(products::findById).flatMap(Optional::stream).toList();

    Map<String, Double> contentRaw = new HashMap<>();
    for (ProductDoc candidate : candidates) {
      Set<String> candidateTokens = ProductText.tokens(candidate);
      double raw = 0;
      for (ProductDoc source : viewedDocs) {
        raw += viewWeight.getOrDefault(source.getId(), 1.0)
            * smart.itemSimilarity(source, ProductText.tokens(source), candidate, candidateTokens);
      }
      for (ProductDoc source : purchasedDocs) {
        raw += 1.5 * smart.itemSimilarity(source, ProductText.tokens(source), candidate, candidateTokens);
      }
      if (raw > 0) contentRaw.put(candidate.getId(), raw);
    }
    double maxContent = contentRaw.values().stream().mapToDouble(Double::doubleValue).max().orElse(0);
    double maxCategory = categoryAffinity.values().stream().mapToDouble(Double::doubleValue).max().orElse(0);

    // ---- score every in-stock candidate ----
    List<Map<String, Object>> scored = new ArrayList<>();
    for (ProductDoc p : candidates) {
      if (!includePurchased && purchasedIds.contains(p.getId())) continue;

      double content = maxContent > 0 ? contentRaw.getOrDefault(p.getId(), 0.0) / maxContent : 0;
      double category = maxCategory > 0
          ? categoryAffinity.getOrDefault(p.getCategoryId(), 0.0) / maxCategory : 0;
      double search = matchesSearch(p, keywords) ? 1.0 : 0.0;
      double trend = maxTrending > 0 ? trending.getOrDefault(p.getId(), 0.0) / maxTrending : 0;
      double rating = p.getReviewCount() > 0 ? p.getAverageRating() / 5.0 : 0;
      int views = viewCount.getOrDefault(p.getId(), 0);

      double score = 3.2 * content
          + 2.4 * category
          + 1.6 * trend
          + 1.4 * search
          + 0.5 * rating
          + 0.4 * Math.min(3, views);

      Map<String, Object> item = smart.item(p, round(score),
          reasons(content, category, views, search > 0, trend, popularity.getOrDefault(p.getId(), 0)));

      // Keep the component breakdown so the UI / API can explain the ranking.
      Map<String, Object> components = new LinkedHashMap<>();
      components.put("contentSimilarity", round(content));
      components.put("categoryAffinity", round(category));
      components.put("trending", round(trend));
      components.put("searchMatch", round(search));
      components.put("rating", round(rating));
      components.put("views", views);
      item.put("components", components);
      scored.add(item);
    }

    scored.sort(Comparator.comparingDouble(
        (Map<String, Object> m) -> (Double) m.get("score")).reversed());
    List<Map<String, Object>> top = scored.stream().limit(n).collect(Collectors.toList());

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("userId", userId);
    out.put("items", top);
    out.put("count", top.size());
    out.put("coldStart", coldStart);
    out.put("strategy", coldStart
        ? "trending-fallback"
        : "hybrid(content+category+search+trending)");
    out.put("weights", Map.of(
        "contentSimilarity", 3.2,
        "categoryAffinity", 2.4,
        "trending", 1.6,
        "searchMatch", 1.4,
        "rating", 0.5,
        "views", 0.4));
    out.put("usesMachineLearning", false);
    return out;
  }

  private boolean matchesSearch(ProductDoc p, List<String> keywords) {
    if (keywords.isEmpty()) return false;
    String hay = ((p.getName() == null ? "" : p.getName()) + " "
        + (p.getDescription() == null ? "" : p.getDescription())).toLowerCase();
    return keywords.stream().anyMatch(k -> !k.isBlank() && hay.contains(k.trim()));
  }

  private List<String> reasons(double content, double category, int views, boolean searchMatch,
      double trend, int popularity) {
    List<String> r = new ArrayList<>();
    if (content > 0.15) r.add("similar-to-your-views-or-purchases");
    if (category > 0.15) r.add("matches-your-category-interest");
    if (views > 0) r.add("viewed-" + views + "x");
    if (searchMatch) r.add("matches-your-search");
    if (trend > 0.05) r.add("trending");
    if (popularity > 0) r.add("popular-" + popularity + "-orders");
    if (r.isEmpty()) r.add("popular-fallback");
    return r;
  }

  private double round(double value) {
    return Math.round(value * 1000.0) / 1000.0;
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
