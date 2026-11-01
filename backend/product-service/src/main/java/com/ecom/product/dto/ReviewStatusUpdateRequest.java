package com.ecom.product.dto;

import jakarta.validation.constraints.NotBlank;

public record ReviewStatusUpdateRequest(
    @NotBlank String status,
    String adminNote
) {}

