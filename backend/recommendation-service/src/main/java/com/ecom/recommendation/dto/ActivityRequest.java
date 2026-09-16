package com.ecom.recommendation.dto;

import jakarta.validation.constraints.NotBlank;

public record ActivityRequest(
    @NotBlank String userId,
    @NotBlank String type,
    String productId,
    String categoryId,
    String keyword,
    String orderId) {}
