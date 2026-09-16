package com.ecom.recommendation.controller;

import com.ecom.recommendation.dto.ActivityRequest;
import com.ecom.recommendation.entity.UserActivity;
import com.ecom.recommendation.service.RecommendationService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class RecommendationController {

  private final RecommendationService svc;

  public RecommendationController(RecommendationService svc) {
    this.svc = svc;
  }

  @PostMapping("/api/activity")
  @ResponseStatus(HttpStatus.CREATED)
  public UserActivity log(@Valid @RequestBody ActivityRequest req) {
    return svc.log(req);
  }

  @GetMapping("/api/recommendations/{userId}")
  public Map<String, Object> recommend(@PathVariable String userId,
      @RequestParam(required = false) Integer limit,
      @RequestParam(defaultValue = "false") boolean includePurchased) {
    return svc.recommend(userId, limit, includePurchased);
  }

  @GetMapping("/api/activity/history/{userId}")
  public Map<String, Object> history(@PathVariable String userId,
      @RequestParam(defaultValue = "20") int limit) {
    return svc.browsingHistory(userId, limit);
  }
}
