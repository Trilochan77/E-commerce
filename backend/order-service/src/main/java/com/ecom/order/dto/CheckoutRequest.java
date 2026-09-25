package com.ecom.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CheckoutRequest(
    @NotBlank String userId,
    @NotBlank String paymentMethod,
    @Min(0) int pointsToUse,
    String addressId,
    @Valid @NotNull ShippingAddressRequest shippingAddress) {

  public record ShippingAddressRequest(
      @NotBlank String fullName,
      @NotBlank String phone,
      @NotBlank @Pattern(regexp = "\\d{6}", message = "Pincode must be 6 digits") String pincode,
      @NotBlank String addressLine,
      @NotBlank String city,
      @NotBlank String state,
      String landmark,
      String addressType) {}
}
