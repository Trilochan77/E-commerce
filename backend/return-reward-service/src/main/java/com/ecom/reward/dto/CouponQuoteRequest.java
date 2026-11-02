package com.ecom.reward.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record CouponQuoteRequest(
    @NotBlank String userId,
    @NotBlank String code,
    @PositiveOrZero double subTotal) {}
