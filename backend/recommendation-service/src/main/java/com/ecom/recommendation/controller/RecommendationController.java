package com.ecom.recommendation.controller;

import com.ecom.recommendation.dto.ActivityRequest;
import com.ecom.recommendation.entity.UserActivity;
import com.ecom.recommendation.service.RecommendationService;
import com.ecom.recommendation.service.SmartRecommendationService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class RecommendationController {

  private final RecommendationService svc;
  private final SmartRecommendationService smart;

  public RecommendationController(RecommendationService svc, SmartRecommendationService smart) {
    this.svc = svc;
    this.smart = smart;
  }

  @PostMapping("/api/activity")
  @ResponseStatus(HttpStatus.CREATED)
  public UserActivity log(@Valid @RequestBody ActivityRequest req) {
    return svc.log(req);
  }

  /** Hybrid personalized rail (content + category + search + trending). */
  @GetMapping("/api/recommendations/{userId}")
  public Map<String, Object> recommend(@PathVariable String userId,
      @RequestParam(required = false) Integer limit,
      @RequestParam(defaultValue = "false") boolean includePurchased) {
    return svc.recommend(userId, limit, includePurchased);
  }

  /** Content-based item/item "similar products" rail for a product page. */
  @GetMapping("/api/recommendations/similar/{productId}")
  public Map<String, Object> similar(@PathVariable String productId,
      @RequestParam(defaultValue = "6") int limit) {
    return smart.similar(productId, limit);
  }

  /** Time-decayed popularity (recent orders and views). */
  @GetMapping("/api/recommendations/trending")
  public Map<String, Object> trending(@RequestParam(defaultValue = "8") int limit,
      @RequestParam(required = false) Integer windowDays) {
    return smart.trending(limit, windowDays);
  }

  /** All-time best sellers by paid/COD order volume. */
  @GetMapping("/api/recommendations/popular")
  public Map<String, Object> popular(@RequestParam(defaultValue = "8") int limit) {
    return smart.popular(limit);
  }

  /** Category-based rail, optionally personalized with the user's own views. */
  @GetMapping("/api/recommendations/category/{categoryId}")
  public Map<String, Object> category(@PathVariable String categoryId,
      @RequestParam(required = false) String userId,
      @RequestParam(defaultValue = "8") int limit) {
    return smart.byCategory(categoryId, userId, limit);
  }

  /** Recommendations derived from the products the user most recently viewed. */
  @GetMapping("/api/recommendations/recently-viewed/{userId}")
  public Map<String, Object> recentlyViewed(@PathVariable String userId,
      @RequestParam(defaultValue = "6") int limit) {
    return smart.recentlyViewed(userId, limit);
  }

  @GetMapping("/api/activity/history/{userId}")
  public Map<String, Object> history(@PathVariable String userId,
      @RequestParam(defaultValue = "20") int limit) {
    return svc.browsingHistory(userId, limit);
  }
}
