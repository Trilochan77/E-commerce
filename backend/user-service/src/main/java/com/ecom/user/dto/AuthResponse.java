package com.ecom.user.dto;

public record AuthResponse(String token, String userId, String email, String role) {}
