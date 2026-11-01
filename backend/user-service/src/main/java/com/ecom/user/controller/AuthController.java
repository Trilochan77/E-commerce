package com.ecom.user.controller;

import com.ecom.user.dto.AuthResponse;
import com.ecom.user.dto.ForgotPasswordRequest;
import com.ecom.user.dto.LoginRequest;
import com.ecom.user.dto.OtpLoginRequest;
import com.ecom.user.dto.OtpSendRequest;
import com.ecom.user.dto.OtpSendResponse;
import com.ecom.user.dto.OtpVerifyRequest;
import com.ecom.user.dto.OtpVerifyResponse;
import com.ecom.user.dto.RegisterCompleteRequest;
import com.ecom.user.dto.RegisterRequest;
import com.ecom.user.dto.ResetPasswordRequest;
import com.ecom.user.dto.UpdateProfileRequest;
import com.ecom.user.entity.User;
import com.ecom.user.service.AuthService;
import com.ecom.user.service.OtpService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AuthController {

  private final AuthService auth;
  private final OtpService otp;

  public AuthController(AuthService auth, OtpService otp) {
    this.auth = auth;
    this.otp = otp;
  }

  @PostMapping("/api/users/register")
  public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
    return auth.register(req);
  }

  @PostMapping("/api/users/otp/send")
  public OtpSendResponse sendOtp(@Valid @RequestBody OtpSendRequest req) {
    String email = req.email().trim().toLowerCase();
    otp.sendOtp(email);
    return new OtpSendResponse("OTP sent to " + email);
  }

  @PostMapping("/api/users/otp/verify")
  public OtpVerifyResponse verifyOtp(@Valid @RequestBody OtpVerifyRequest req) {
    return otp.verifyOtp(req.email(), req.otp());
  }

  @PostMapping("/api/users/register/complete")
  public AuthResponse registerComplete(@Valid @RequestBody RegisterCompleteRequest req) {
    return auth.registerViaOtp(req, otp);
  }

  @PostMapping("/api/users/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest req) {
    return auth.login(req);
  }

  @PostMapping("/api/users/login/otp")
  public AuthResponse loginViaOtp(@Valid @RequestBody OtpLoginRequest req) {
    return auth.loginViaOtp(req, otp);
  }

  @PostMapping("/api/users/forgot-password")
  public OtpSendResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
    String email = req.email().trim().toLowerCase();
    otp.sendOtp(email);
    return new OtpSendResponse("OTP sent to " + email);
  }

  @PostMapping("/api/users/reset-password")
  public AuthResponse resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
    return auth.resetPassword(req, otp);
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
