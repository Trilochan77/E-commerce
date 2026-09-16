package com.ecom.user.controller;

import com.ecom.user.dto.AuthResponse;
import com.ecom.user.dto.LoginRequest;
import com.ecom.user.dto.RegisterRequest;
import com.ecom.user.dto.UpdateProfileRequest;
import com.ecom.user.entity.User;
import com.ecom.user.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {

  private final AuthService auth;

  public AuthController(AuthService auth) {
    this.auth = auth;
  }

  @PostMapping("/api/users/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
    return auth.register(req);
  }

  @PostMapping("/api/users/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest req) {
    return auth.login(req);
  }

  private static String bearer(String h) {
    if (h != null && h.startsWith("Bearer ")) return h.substring(7);
    return h;
  }

  @GetMapping("/api/users/me")
  public Map<String, Object> me(@RequestHeader("Authorization") String authHeader) {
    User u = auth.me(bearer(authHeader));
    return Map.of("userId", u.getId(), "name", u.getName(), "email", u.getEmail(), "role", u.getRole(),
        "phone", String.valueOf(u.getPhone()), "address", String.valueOf(u.getAddress()));
  }

  @PutMapping("/api/users/me")
  public Map<String, Object> update(
      @RequestHeader("Authorization") String authHeader, @RequestBody UpdateProfileRequest req) {
    User u = auth.update(bearer(authHeader), req);
    return Map.of("userId", u.getId(), "name", u.getName(), "email", u.getEmail());
  }
}
