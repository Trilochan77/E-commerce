package com.ecom.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterCompleteRequest(
    @NotBlank String otpToken,
    @NotBlank String name,
    @NotBlank @Size(min = 6, max = 72) String password) {}
