package com.ecom.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AddressRequest(
    @NotBlank String userId,
    @NotBlank String fullName,
    @NotBlank String phone,
    @NotBlank @Pattern(regexp = "\\d{6}", message = "Pincode must be 6 digits") String pincode,
    @NotBlank String addressLine,
    @NotBlank String city,
    @NotBlank String state,
    String landmark,
    String addressType,
    Boolean isDefault) {}
