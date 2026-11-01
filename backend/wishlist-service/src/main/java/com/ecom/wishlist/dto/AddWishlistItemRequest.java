package com.ecom.wishlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddWishlistItemRequest(@NotBlank String productId, @NotNull Double priceAtAdd) {}
