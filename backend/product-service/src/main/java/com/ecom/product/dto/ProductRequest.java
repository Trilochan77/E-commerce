package com.ecom.product.dto;

import java.util.List;
import java.util.Map;

public record ProductRequest(
    String name,
    String description,
    String brand,
    double price,
    String categoryId,
    List<String> images,
    int stockQuantity,
    boolean availability,
    boolean eligibleForReturn,
    List<String> highlights,
    Map<String, String> specifications) {}
