package com.ecom.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank String otpToken,
    @NotBlank @Size(min = 6, max = 72) String newPassword) {}
