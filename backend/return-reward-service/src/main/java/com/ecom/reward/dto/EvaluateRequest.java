package com.ecom.reward.dto;

import jakarta.validation.constraints.NotBlank;

public record EvaluateRequest(
    @NotBlank String verifiedCondition,
    String adminNote) {}
