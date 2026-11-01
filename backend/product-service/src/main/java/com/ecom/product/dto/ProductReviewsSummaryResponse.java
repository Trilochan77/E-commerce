package com.ecom.product.dto;

import com.ecom.product.entity.Review;
import java.util.List;
import java.util.Map;

public record ProductReviewsSummaryResponse(
    String productId,
    double averageRating,
    int reviewCount,
    Map<Integer, Long> ratingBreakdown,
    List<String> customerPhotos,
    List<Review> reviews
) {}

