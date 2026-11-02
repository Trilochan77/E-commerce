package com.ecom.reward.dto;

import jakarta.validation.constraints.NotBlank;

public record SpinRequest(@NotBlank String userId) {}
