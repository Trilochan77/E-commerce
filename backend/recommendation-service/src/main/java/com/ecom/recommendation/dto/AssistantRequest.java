package com.ecom.recommendation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * One turn of a shopping-assistant conversation.
 * userId is optional so guests can ask catalog questions; contextIds carries the
 * product ids from the previous answer so follow-ups like "compare the first two" work.
 */
public record AssistantRequest(
    String userId,
    @NotBlank @Size(max = 1000) String message,
    List<String> contextIds) {}
