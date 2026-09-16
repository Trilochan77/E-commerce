package com.ecom.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
    @NotBlank String userId,
    @NotBlank String paymentMethod,
    @Min(0) int pointsToUse) {}
