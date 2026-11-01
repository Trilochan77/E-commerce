package com.ecom.product.dto;

import com.ecom.product.entity.Review;

public record ReviewEligibilityResponse(
    boolean canReview,
    boolean isVerifiedPurchase,
    boolean hasReviewed,
    String message,
    Review existingReview
) {}

