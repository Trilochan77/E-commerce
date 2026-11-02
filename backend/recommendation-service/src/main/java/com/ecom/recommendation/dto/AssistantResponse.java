package com.ecom.recommendation.dto;

import java.util.List;
import java.util.Map;

/**
 * Deterministic assistant answer. Every product fact here is read from the live
 * catalog (name, price, stock, rating, description) — nothing is generated.
 */
public record AssistantResponse(
    String reply,
    String intent,
    List<Map<String, Object>> products,
    List<Map<String, Object>> compare,
    List<String> followUps,
    boolean grounded,
    String strategy) {}
