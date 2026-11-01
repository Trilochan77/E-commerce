package com.ecom.user.dto;

import jakarta.validation.constraints.NotBlank;

public record OtpLoginRequest(@NotBlank String otpToken) {}
