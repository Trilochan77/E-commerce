package com.ecom.reward.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SubmitReturnRequest(
    @NotBlank String userId,
    @NotBlank String orderId,
    @NotBlank String productId,
    @Min(1) int quantity,
    String reason,
    @NotBlank String claimedCondition) {}
