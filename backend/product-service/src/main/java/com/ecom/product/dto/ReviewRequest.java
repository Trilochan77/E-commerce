package com.ecom.product.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ReviewRequest(
    @Min(1) @Max(5) int rating,
    @NotBlank String title,
    @NotBlank String comment,
    List<String> images,
    String userId,
    String userName,
    String userEmail
) {}

