package com.ecom.product.controller;

import com.ecom.product.dto.ProductReviewsSummaryResponse;
import com.ecom.product.dto.ReviewEligibilityResponse;
import com.ecom.product.dto.ReviewRequest;
import com.ecom.product.dto.ReviewStatusUpdateRequest;
import com.ecom.product.entity.Review;
import com.ecom.product.service.ReviewService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ReviewController {

  private final ReviewService svc;

  public ReviewController(ReviewService svc) {
    this.svc = svc;
  }

  private void requireAdmin(String role) {
    if (!"ADMIN".equalsIgnoreCase(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
    }
  }

  // --- Customer & Public Endpoints ---

  @GetMapping("/api/products/{productId}/reviews")
  public ProductReviewsSummaryResponse getReviews(@PathVariable String productId) {
    return svc.getSummaryForProduct(productId);
  }

  @GetMapping("/api/products/{productId}/reviews/eligibility")
  public ReviewEligibilityResponse checkEligibility(
      @PathVariable String productId,
      @RequestParam(required = false) String userId,
      @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
    String uid = (userId != null && !userId.isBlank()) ? userId : headerUserId;
    return svc.checkEligibility(productId, uid);
  }

  @PostMapping("/api/products/{productId}/reviews")
  @ResponseStatus(HttpStatus.CREATED)
  public Review submit(
      @PathVariable String productId,
      @Valid @RequestBody ReviewRequest req,
      @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
      @RequestHeader(value = "X-Role", required = false) String role) {
    String uid = (headerUserId != null && !headerUserId.isBlank()) ? headerUserId : req.userId();
    return svc.submitReview(productId, req, uid, role);
  }

  @PutMapping("/api/products/{productId}/reviews/{reviewId}")
  public Review update(
      @PathVariable String productId,
      @PathVariable String reviewId,
      @Valid @RequestBody ReviewRequest req,
      @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
      @RequestHeader(value = "X-Role", required = false) String role) {
    String uid = (headerUserId != null && !headerUserId.isBlank()) ? headerUserId : req.userId();
    return svc.updateReview(productId, reviewId, req, uid, role);
  }

  @DeleteMapping("/api/products/{productId}/reviews/{reviewId}")
  public Map<String, Object> delete(
      @PathVariable String productId,
      @PathVariable String reviewId,
      @RequestParam(required = false) String userId,
      @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
      @RequestHeader(value = "X-Role", required = false) String role) {
    String uid = (userId != null && !userId.isBlank()) ? userId : headerUserId;
    svc.deleteReview(reviewId, uid, role);
    return Map.of("deleted", reviewId);
  }

  // --- Administrator Moderation Endpoints ---

  @GetMapping("/api/products/reviews/admin/all")
  public List<Review> adminList(
      @RequestParam(required = false) String status,
      @RequestHeader(value = "X-Role", required = false) String role) {
    requireAdmin(role);
    return svc.adminList(status);
  }

  @PutMapping("/api/products/reviews/admin/{reviewId}/status")
  public Review adminUpdateStatus(
      @PathVariable String reviewId,
      @Valid @RequestBody ReviewStatusUpdateRequest req,
      @RequestHeader(value = "X-Role", required = false) String role) {
    requireAdmin(role);
    return svc.adminUpdateStatus(reviewId, req.status(), req.adminNote());
  }

  @DeleteMapping("/api/products/reviews/admin/{reviewId}")
  public Map<String, Object> adminDelete(
      @PathVariable String reviewId,
      @RequestHeader(value = "X-Role", required = false) String role) {
    requireAdmin(role);
    svc.adminDelete(reviewId);
    return Map.of("deleted", reviewId);
  }
}

