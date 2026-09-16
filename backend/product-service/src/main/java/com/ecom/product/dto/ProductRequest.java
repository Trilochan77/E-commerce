package com.ecom.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ProductRequest(
    @NotBlank String name,
    String description,
    @Min(0) double price,
    String categoryId,
    List<String> images,
    @Min(0) int stockQuantity,
    boolean eligibleForReturn) {}
