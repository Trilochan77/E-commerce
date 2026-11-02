package com.ecom.reward.dto;

import jakarta.validation.constraints.NotBlank;

public record CouponConfirmRequest(@NotBlank String orderId) {}
