package com.ecom.user.controller;

import com.ecom.user.dto.AuthResponse;
import com.ecom.user.dto.LoginRequest;
import com.ecom.user.dto.RegisterRequest;
import com.ecom.user.dto.UpdateProfileRequest;
import com.ecom.user.entity.User;
import com.ecom.user.service.AuthService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

  @GetMapping("/api/users")
  public List<Map<String, Object>> list(
      @RequestHeader(value = "X-Role", required = false) String role) {
    if (!"ADMIN".equals(role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
    return auth.allUsers();
  }

  @PutMapping("/api/users/{id}/block")
  public Map<String, Object> block(
      @RequestHeader("Authorization") String authHeader,
      @RequestHeader(value = "X-Role", required = false) String role,
      @PathVariable String id, @RequestBody Map<String, Boolean> body) {
    if (!"ADMIN".equals(role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
    boolean active = !Boolean.TRUE.equals(body.get("blocked"));
    if (body.containsKey("active")) active = Boolean.TRUE.equals(body.get("active"));
    return auth.setActive(auth.adminId(bearer(authHeader)), id, active);
  }

  @DeleteMapping("/api/users/{id}")
  public Map<String, Object> delete(
      @RequestHeader("Authorization") String authHeader,
      @RequestHeader(value = "X-Role", required = false) String role,
      @PathVariable String id) {
    if (!"ADMIN".equals(role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
    return auth.deleteUser(auth.adminId(bearer(authHeader)), id);
  }
}
