package com.ecom.product.service;

import com.ecom.product.dto.ProductReviewsSummaryResponse;
import com.ecom.product.dto.ReviewEligibilityResponse;
import com.ecom.product.dto.ReviewRequest;
import com.ecom.product.entity.OrderRef;
import com.ecom.product.entity.Product;
import com.ecom.product.entity.Review;
import com.ecom.product.repository.OrderRefRepository;
import com.ecom.product.repository.ProductRepository;
import com.ecom.product.repository.ReviewRepository;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReviewService {
  private final ReviewRepository reviewRepo;
  private final ProductRepository productRepo;
  private final OrderRefRepository orderRepo;

  public ReviewService(ReviewRepository reviewRepo, ProductRepository productRepo, OrderRefRepository orderRepo) {
    this.reviewRepo = reviewRepo;
    this.productRepo = productRepo;
    this.orderRepo = orderRepo;
  }

  public ProductReviewsSummaryResponse getSummaryForProduct(String productId) {
    List<Review> approved = reviewRepo.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "APPROVED");
    int count = approved.size();
    double avg = 0.0;
    Map<Integer, Long> breakdown = new HashMap<>();
    for (int star = 1; star <= 5; star++) breakdown.put(star, 0L);

    List<String> photos = new ArrayList<>();
    if (count > 0) {
      double sum = 0.0;
      for (Review r : approved) {
        sum += r.getRating();
        breakdown.put(r.getRating(), breakdown.getOrDefault(r.getRating(), 0L) + 1);
        if (r.getImages() != null) {
          for (String img : r.getImages()) {
            if (img != null && !img.isBlank()) photos.add(img);
          }
        }
      }
      avg = Math.round((sum / count) * 10.0) / 10.0;
    }

    // Sync rating onto Product record
    final double finalAvg = avg;
    final int finalCount = count;
    productRepo.findById(productId).ifPresent(p -> {
      p.setAverageRating(finalAvg);
      p.setReviewCount(finalCount);
      productRepo.save(p);
    });

    return new ProductReviewsSummaryResponse(productId, avg, count, breakdown, photos, approved);
  }

  public boolean isVerifiedPurchaser(String userId, String productId) {
    if (userId == null || userId.isBlank() || productId == null || productId.isBlank()) return false;
    List<OrderRef> orders = orderRepo.findByUserId(userId);
    return orders.stream()
        .filter(o -> "DELIVERED".equalsIgnoreCase(o.getOrderStatus()))
        .anyMatch(o -> o.getItems() != null && o.getItems().stream()
            .anyMatch(item -> productId.equalsIgnoreCase(item.getProductId())));
  }

  public ReviewEligibilityResponse checkEligibility(String productId, String userId) {
    if (userId == null || userId.isBlank()) {
      return new ReviewEligibilityResponse(false, false, false, "Please log in to write a review.", null);
    }
    Optional<Review> existing = reviewRepo.findByProductIdAndUserId(productId, userId);
    boolean verified = isVerifiedPurchaser(userId, productId);
    boolean hasReviewed = existing.isPresent();

    if (hasReviewed) {
      return new ReviewEligibilityResponse(true, verified, true,
          "You have already reviewed this product. You can edit or delete your review below.", existing.get());
    }

    if (verified) {
      return new ReviewEligibilityResponse(true, true, false,
          "Verified Purchase: You ordered and received this product. Share your feedback and photos!", null);
    } else {
      return new ReviewEligibilityResponse(false, false, false,
          "Only verified purchasers (customers with a delivered order for this product) are eligible to write a review.", null);
    }
  }

  public Review submitReview(String productId, ReviewRequest req, String userId, String userRole) {
    if (!productRepo.existsById(productId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + productId);
    }
    String actualUserId = (userId != null && !userId.isBlank()) ? userId : req.userId();
    if (actualUserId == null || actualUserId.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User authentication required to submit review");
    }

    // Check if already reviewed
    Optional<Review> existing = reviewRepo.findByProductIdAndUserId(productId, actualUserId);
    if (existing.isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "You have already reviewed this product. Please edit your existing review instead.");
    }

    boolean isVerified = isVerifiedPurchaser(actualUserId, productId);
    boolean isAdmin = "ADMIN".equalsIgnoreCase(userRole);
    if (!isVerified && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Only verified purchasers with a delivered order for this item are eligible to submit reviews.");
    }

    Review r = new Review();
    r.setId("REV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    r.setProductId(productId);
    r.setUserId(actualUserId);
    r.setUserName(req.userName() != null && !req.userName().isBlank() ? req.userName() : "Customer");
    r.setUserEmail(req.userEmail() != null ? req.userEmail() : "");
    r.setRating(Math.max(1, Math.min(5, req.rating())));
    r.setTitle(req.title().trim());
    r.setComment(req.comment().trim());
    r.setImages(req.images() != null ? req.images() : new ArrayList<>());
    r.setVerifiedPurchase(isVerified);
    r.setStatus("APPROVED"); // Published immediately, accessible for admin moderation
    r.setCreatedAt(Instant.now());
    r.setUpdatedAt(Instant.now());

    Review saved = reviewRepo.save(r);
    recalc(productId);
    return saved;
  }

  public Review updateReview(String productId, String reviewId, ReviewRequest req, String userId, String userRole) {
    Review r = reviewRepo.findById(reviewId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found: " + reviewId));

    boolean isOwner = userId != null && userId.equals(r.getUserId());
    boolean isAdmin = "ADMIN".equalsIgnoreCase(userRole);
    if (!isOwner && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to edit this review");
    }

    r.setRating(Math.max(1, Math.min(5, req.rating())));
    r.setTitle(req.title().trim());
    r.setComment(req.comment().trim());
    if (req.images() != null) r.setImages(req.images());
    r.setUpdatedAt(Instant.now());

    Review updated = reviewRepo.save(r);
    recalc(r.getProductId());
    return updated;
  }

  public void deleteReview(String reviewId, String userId, String userRole) {
    Review r = reviewRepo.findById(reviewId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found: " + reviewId));

    boolean isOwner = userId != null && userId.equals(r.getUserId());
    boolean isAdmin = "ADMIN".equalsIgnoreCase(userRole);
    if (!isOwner && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this review");
    }

    String prodId = r.getProductId();
    reviewRepo.delete(r);
    recalc(prodId);
  }

  public List<Review> adminList(String status) {
    if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
      return reviewRepo.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
    }
    return reviewRepo.findAllByOrderByCreatedAtDesc();
  }

  public Review adminUpdateStatus(String reviewId, String status, String adminNote) {
    Review r = reviewRepo.findById(reviewId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found: " + reviewId));

    String s = status.trim().toUpperCase();
    if (!Set.of("APPROVED", "PENDING", "REJECTED").contains(s)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Invalid status: " + status);
    }

    r.setStatus(s);
    if (adminNote != null) r.setAdminNote(adminNote);
    r.setUpdatedAt(Instant.now());

    Review saved = reviewRepo.save(r);
    recalc(r.getProductId());
    return saved;
  }

  public void adminDelete(String reviewId) {
    Review r = reviewRepo.findById(reviewId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found: " + reviewId));
    String prodId = r.getProductId();
    reviewRepo.delete(r);
    recalc(prodId);
  }

  private void recalc(String productId) {
    getSummaryForProduct(productId);
  }
}
