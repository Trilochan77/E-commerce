package com.ecom.recommendation.service;

import com.ecom.recommendation.entity.CategoryDoc;
import com.ecom.recommendation.entity.OrderRef;
import com.ecom.recommendation.entity.ProductDoc;
import com.ecom.recommendation.entity.UserActivity;
import com.ecom.recommendation.repository.CategoryDocRepository;
import com.ecom.recommendation.repository.OrderRefRepository;
import com.ecom.recommendation.repository.ProductDocRepository;
import com.ecom.recommendation.repository.UserActivityRepository;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Catalogue-wide recommendation rails.
 *
 * <p>Everything here is deterministic and explainable:
 * <ul>
 *   <li><b>Similar products</b> — content-based item/item similarity
 *       (category + Jaccard word overlap + price proximity).</li>
 *   <li><b>Trending</b> — time-decayed popularity from recent orders and views.</li>
 *   <li><b>Popular</b> — all-time order counts.</li>
 *   <li><b>Category</b> — category affinity with optional per-user personalization.</li>
 *   <li><b>Recently viewed</b> — item/item similarity to the last products the user viewed.</li>
 * </ul>
 * No machine learning or deep learning is used anywhere in this class.
 */
@Service
public class SmartRecommendationService {

  private static final List<String> COUNTED_ORDERS = List.of("PAID", "PENDING");
  private static final int DEFAULT_TRENDING_WINDOW_DAYS = 30;

  private final ProductDocRepository products;
  private final UserActivityRepository activities;
  private final OrderRefRepository orders;
  private final CategoryDocRepository categories;

  public SmartRecommendationService(ProductDocRepository products,
      UserActivityRepository activities, OrderRefRepository orders,
      CategoryDocRepository categories) {
    this.products = products;
    this.activities = activities;
    this.orders = orders;
    this.categories = categories;
  }

  /* =====================================================================
   * 1. Similar products — content-based item/item similarity
   * ===================================================================== */

  public Map<String, Object> similar(String productId, Integer limit) {
    int n = clamp(limit, 1, 20, 6);
    ProductDoc source = products.findById(productId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Unknown product " + productId));

    Set<String> sourceTokens = ProductText.tokens(source);
    List<Map.Entry<ProductDoc, Double>> ranked = products.findByAvailabilityTrue().stream()
        .filter(p -> !Objects.equals(p.getId(), productId))
        .map(p -> Map.entry(p, itemSimilarity(source, sourceTokens, p)))
        .filter(e -> e.getValue() >= 0.25)
        .sorted(Map.Entry.<ProductDoc, Double>comparingByValue().reversed())
        .limit(n)
        .toList();

    List<Map<String, Object>> items = ranked.stream()
        .map(e -> item(e.getKey(), round(e.getValue()),
            similarReasons(source, sourceTokens, e.getKey())))
        .toList();

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("sourceProductId", productId);
    out.put("sourceName", source.getName());
    out.put("items", items);
    out.put("count", items.size());
    out.put("strategy", "content-based-item-similarity");
    return out;
  }

  /** Item/item similarity in [0, 1]: same category + shared words + comparable price. */
  public double itemSimilarity(ProductDoc a, ProductDoc b) {
    if (a == null || b == null) return 0;
    return itemSimilarity(a, ProductText.tokens(a), b);
  }

  /** Same as {@link #itemSimilarity(ProductDoc, ProductDoc)} but reuses precomputed tokens. */
  public double itemSimilarity(ProductDoc a, Set<String> aTokens, ProductDoc b) {
    return itemSimilarity(a, aTokens, b, ProductText.tokens(b));
  }

  public double itemSimilarity(ProductDoc a, Set<String> aTokens, ProductDoc b, Set<String> bTokens) {
    if (a == null || b == null) return 0;
    if (a.getId() != null && a.getId().equals(b.getId())) return 0;

    double score = 0;
    if (Objects.equals(a.getCategoryId(), b.getCategoryId())) score += 0.50;
    double wordOverlap = ProductText.jaccard(aTokens, bTokens);
    score += Math.min(0.30, 0.60 * wordOverlap);
    if (a.getPrice() > 0 && b.getPrice() > 0) {
      double ratio = Math.min(a.getPrice(), b.getPrice()) / Math.max(a.getPrice(), b.getPrice());
      score += 0.20 * ratio;
    }
    return score;
  }

  private List<String> similarReasons(ProductDoc a, Set<String> aTokens, ProductDoc b) {
    List<String> reasons = new ArrayList<>();
    if (Objects.equals(a.getCategoryId(), b.getCategoryId())) reasons.add("same-category");
    List<String> shared = ProductText.shared(aTokens, ProductText.tokens(b), 3);
    if (!shared.isEmpty()) reasons.add("shares-words:" + String.join(",", shared));
    if (a.getPrice() > 0 && b.getPrice() > 0) {
      double ratio = Math.min(a.getPrice(), b.getPrice()) / Math.max(a.getPrice(), b.getPrice());
      if (ratio >= 0.6) reasons.add("similar-price-band");
    }
    if (reasons.isEmpty()) reasons.add("catalogue-neighbour");
    return reasons;
  }

  /* =====================================================================
   * 2. Trending — time-decayed popularity
   * ===================================================================== */

  public Map<String, Object> trending(Integer limit, Integer windowDays) {
    int n = clamp(limit, 1, 20, 8);
    int window = (windowDays == null || windowDays < 1)
        ? DEFAULT_TRENDING_WINDOW_DAYS : Math.min(windowDays, 365);

    Map<String, Double> scores = trendingScores(window);
    List<Map<String, Object>> items = scores.entrySet().stream()
        .map(e -> products.findById(e.getKey())
            .filter(ProductDoc::isAvailability)
            .map(p -> Map.entry(p, e.getValue())))
        .flatMap(Optional::stream)
        .sorted(Map.Entry.<ProductDoc, Double>comparingByValue().reversed())
        .limit(n)
        .map(e -> item(e.getKey(), round(e.getValue()),
            List.of("trending-last-" + window + "-days", "recent-orders+views")))
        .toList();

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("items", items);
    out.put("count", items.size());
    out.put("windowDays", window);
    out.put("strategy", "time-decayed-popularity");
    return out;
  }

  /**
   * Raw trending weight per product for the last {@code windowDays}.
   *
   * <p>Each paid/COD-pending order line contributes {@code quantity × e^(-age/halfLife)}
   * (halfLife = window/3), and each product view contributes a smaller
   * {@code 0.25 × e^(-age/halfLife)}. Older events fade, so this is a trend signal
   * rather than a lifetime counter.
   */
  public Map<String, Double> trendingScores(int windowDays) {
    int window = Math.max(1, windowDays);
    Instant now = Instant.now();
    Instant since = now.minus(window, ChronoUnit.DAYS);
    double halfLife = Math.max(1.0, window / 3.0);
    Map<String, Double> scores = new HashMap<>();

    for (OrderRef order : orders.findByPaymentStatusIn(COUNTED_ORDERS)) {
      if (order.getItems() == null) continue;
      if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) continue;
      if (order.getOrderDate() == null || order.getOrderDate().isBefore(since)) continue;

      double decay = decay(order.getOrderDate(), now, halfLife);
      double statusWeight = "PAID".equalsIgnoreCase(order.getPaymentStatus()) ? 1.0 : 0.6;
      for (OrderRef.Item line : order.getItems()) {
        if (line.getProductId() == null || line.getProductId().isBlank()) continue;
        scores.merge(line.getProductId(),
            decay * statusWeight * Math.max(1, line.getQuantity()), Double::sum);
      }
    }

    for (UserActivity view : activities.findTop2000ByTimestampAfterOrderByTimestampDesc(since)) {
      if (!"VIEW".equalsIgnoreCase(view.getType())) continue;
      if (view.getProductId() == null || view.getTimestamp() == null) continue;
      scores.merge(view.getProductId(),
          0.25 * decay(view.getTimestamp(), now, halfLife), Double::sum);
    }
    return scores;
  }

  private double decay(Instant at, Instant now, double halfLifeDays) {
    double ageDays = Math.max(0, Duration.between(at, now).toMillis() / 86_400_000.0);
    return Math.exp(-ageDays / halfLifeDays);
  }

  /* =====================================================================
   * 3. Popular — all-time order counts
   * ===================================================================== */

  public Map<String, Object> popular(Integer limit) {
    int n = clamp(limit, 1, 20, 8);
    Map<String, Long> counts = new HashMap<>();
    for (OrderRef order : orders.findByPaymentStatusIn(COUNTED_ORDERS)) {
      if (order.getItems() == null) continue;
      if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) continue;
      for (OrderRef.Item line : order.getItems()) {
        if (line.getProductId() == null || line.getProductId().isBlank()) continue;
        counts.merge(line.getProductId(), (long) Math.max(1, line.getQuantity()), Long::sum);
      }
    }

    List<Map<String, Object>> items = counts.entrySet().stream()
        .map(e -> products.findById(e.getKey())
            .filter(ProductDoc::isAvailability)
            .map(p -> Map.entry(p, e.getValue().doubleValue())))
        .flatMap(Optional::stream)
        .sorted(Map.Entry.<ProductDoc, Double>comparingByValue().reversed())
        .limit(n)
        .map(e -> item(e.getKey(), e.getValue(),
            List.of("all-time-best-seller", "ordered-" + e.getValue().intValue() + "-units")))
        .toList();

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("items", items);
    out.put("count", items.size());
    out.put("strategy", "all-time-order-popularity");
    return out;
  }

  /* =====================================================================
   * 4. Category-based recommendations
   * ===================================================================== */

  public Map<String, Object> byCategory(String categoryId, String userId, Integer limit) {
    int n = clamp(limit, 1, 20, 8);
    List<ProductDoc> pool = products.findByAvailabilityTrue().stream()
        .filter(p -> Objects.equals(categoryId, p.getCategoryId()))
        .toList();

    Map<String, Double> trend = trendingScores(DEFAULT_TRENDING_WINDOW_DAYS);
    double maxTrend = trend.values().stream().mapToDouble(Double::doubleValue).max().orElse(0);

    Map<String, Integer> views = new HashMap<>();
    boolean personalised = false;
    if (userId != null && !userId.isBlank()) {
      for (UserActivity activity : activities.findTop200ByUserIdOrderByTimestampDesc(userId)) {
        if ("VIEW".equalsIgnoreCase(activity.getType()) && activity.getProductId() != null) {
          views.merge(activity.getProductId(), 1, Integer::sum);
        }
      }
      personalised = !views.isEmpty();
    }

    final boolean pers = personalised;
    List<Map.Entry<ProductDoc, Double>> ranked = new ArrayList<>();
    for (ProductDoc p : pool) {
      double score = 1.0; // every candidate matches the requested category
      double trendNorm = maxTrend > 0 ? trend.getOrDefault(p.getId(), 0.0) / maxTrend : 0;
      score += 2.0 * trendNorm;
      if (p.getReviewCount() > 0) score += 0.5 * (p.getAverageRating() / 5.0);
      if (pers) score += 0.5 * Math.min(3, views.getOrDefault(p.getId(), 0));
      if (p.isEligibleForReturn()) score += 0.1;
      ranked.add(Map.entry(p, score));
    }
    ranked.sort(Comparator.comparingDouble((Map.Entry<ProductDoc, Double> e) -> e.getValue()).reversed());

    List<Map<String, Object>> items = ranked.stream().limit(n)
        .map(e -> item(e.getKey(), round(e.getValue()),
            List.of("category-match", pers ? "personalised-by-your-views" : "popular-in-category")))
        .toList();

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("categoryId", categoryId);
    out.put("categoryName", categoryName(categoryId));
    out.put("items", items);
    out.put("count", items.size());
    out.put("personalised", pers);
    out.put("strategy", "category-affinity");
    return out;
  }

  /* =====================================================================
   * 5. Recommendations from recently viewed products
   * ===================================================================== */

  public Map<String, Object> recentlyViewed(String userId, Integer limit) {
    int n = clamp(limit, 1, 20, 6);

    // Last 8 distinct products, newest first, with a small recency weight.
    Map<String, Double> sourceWeight = new LinkedHashMap<>();
    for (UserActivity view : activities.findByUserIdAndTypeOrderByTimestampDesc(userId, "VIEW")) {
      if (view.getProductId() == null || view.getProductId().isBlank()) continue;
      if (sourceWeight.containsKey(view.getProductId())) continue;
      sourceWeight.put(view.getProductId(), 1.0 / (1.0 + 0.15 * sourceWeight.size()));
      if (sourceWeight.size() >= 8) break;
    }

    List<ProductDoc> viewed = sourceWeight.keySet().stream()
        .map(products::findById)
        .flatMap(Optional::stream)
        .toList();

    if (viewed.isEmpty()) {
      Map<String, Object> fallback = new LinkedHashMap<>(trending(n, DEFAULT_TRENDING_WINDOW_DAYS));
      fallback.put("coldStart", true);
      fallback.put("strategy", "trending-fallback-no-views");
      fallback.put("sources", List.of());
      return fallback;
    }

    Map<String, Double> score = new HashMap<>();
    Map<String, Double> bestSimilarity = new HashMap<>();
    Map<String, ProductDoc> bestSource = new HashMap<>();
    Map<String, Set<String>> sourceTokens = new HashMap<>();
    for (ProductDoc source : viewed) {
      sourceTokens.put(source.getId(), ProductText.tokens(source));
    }

    for (ProductDoc candidate : products.findByAvailabilityTrue()) {
      if (sourceWeight.containsKey(candidate.getId())) continue; // don't recommend what they just viewed
      Set<String> candidateTokens = ProductText.tokens(candidate);
      for (ProductDoc source : viewed) {
        double similarity = itemSimilarity(source, sourceTokens.get(source.getId()),
            candidate, candidateTokens);
        if (similarity < 0.30) continue;
        double weight = sourceWeight.getOrDefault(source.getId(), 1.0);
        score.merge(candidate.getId(), weight * similarity, Double::sum);
        if (similarity > bestSimilarity.getOrDefault(candidate.getId(), -1.0)) {
          bestSimilarity.put(candidate.getId(), similarity);
          bestSource.put(candidate.getId(), source);
        }
      }
    }

    List<Map<String, Object>> items = score.entrySet().stream()
        .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
        .limit(n)
        .map(e -> {
          ProductDoc candidate = products.findById(e.getKey()).orElse(null);
          if (candidate == null) return null;
          ProductDoc source = bestSource.get(candidate.getId());
          String sourceName = source == null ? null : source.getName();
          List<String> reasons = new ArrayList<>();
          reasons.add("similar-to-viewed");
          if (sourceName != null) reasons.add("because-you-viewed:" + sourceName);
          List<String> shared = source == null ? List.of()
              : ProductText.shared(ProductText.tokens(source), ProductText.tokens(candidate), 3);
          if (!shared.isEmpty()) reasons.add("shares-words:" + String.join(",", shared));
          Map<String, Object> mapped = item(candidate, round(e.getValue()), reasons);
          if (sourceName != null) mapped.put("becauseOf", sourceName);
          return mapped;
        })
        .filter(Objects::nonNull)
        .toList();

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("userId", userId);
    out.put("sources", viewed.stream().map(ProductDoc::getName).toList());
    out.put("items", items);
    out.put("count", items.size());
    out.put("coldStart", false);
    out.put("strategy", "content-based-from-recently-viewed");
    return out;
  }

  /* =====================================================================
   * Shared helpers
   * ===================================================================== */

  /** Common product DTO used by every rail and by {@link RecommendationService}. */
  public Map<String, Object> item(ProductDoc p, double score, List<String> reasons) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("productId", p.getId());
    m.put("name", p.getName());
    m.put("price", p.getPrice());
    m.put("category", p.getCategoryId());
    m.put("categoryName", categoryName(p.getCategoryId()));
    m.put("description", p.getDescription());
    m.put("image", p.getImages() == null || p.getImages().isEmpty() ? null : p.getImages().get(0));
    m.put("availability", p.isAvailability());
    m.put("stockQuantity", p.getStockQuantity());
    m.put("averageRating", p.getAverageRating());
    m.put("reviewCount", p.getReviewCount());
    m.put("eligibleForReturn", p.isEligibleForReturn());
    m.put("score", score);
    m.put("reasons", reasons);
    return m;
  }

  public String categoryName(String categoryId) {
    if (categoryId == null) return null;
    return categories.findById(categoryId).map(CategoryDoc::getName).orElse(null);
  }

  private int clamp(Integer value, int min, int max, int fallback) {
    if (value == null) return fallback;
    return Math.max(min, Math.min(value, max));
  }

  private double round(double value) {
    return Math.round(value * 1000.0) / 1000.0;
  }
}
