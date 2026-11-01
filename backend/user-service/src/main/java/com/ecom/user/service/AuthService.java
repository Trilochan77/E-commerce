package com.ecom.user.service;

import com.ecom.common.security.JwtUtil;
import com.ecom.user.dto.AuthResponse;
import com.ecom.user.dto.ForgotPasswordRequest;
import com.ecom.user.dto.LoginRequest;
import com.ecom.user.dto.OtpLoginRequest;
import com.ecom.user.dto.RegisterCompleteRequest;
import com.ecom.user.dto.RegisterRequest;
import com.ecom.user.dto.ResetPasswordRequest;
import com.ecom.user.dto.UpdateProfileRequest;
import com.ecom.user.entity.RewardWallet;
import com.ecom.user.entity.User;
import com.ecom.user.repository.RewardWalletRepository;
import com.ecom.user.repository.UserRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserRepository users;
  private final RewardWalletRepository wallets;
  private final PasswordEncoder encoder;

  @Value("${jwt.secret:change-me-dev-secret-min-32-chars-long}")
  private String jwtSecret;

  @Value("${jwt.ttl-millis:86400000}")
  private long jwtTtl;

  public AuthService(UserRepository users, RewardWalletRepository wallets, PasswordEncoder encoder) {
    this.users = users;
    this.wallets = wallets;
    this.encoder = encoder;
  }

  public AuthResponse register(RegisterRequest req) {
    String email = req.email().trim().toLowerCase();
    if (users.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }
    User u = new User();
    u.setId("U-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    u.setName(req.name().trim());
    u.setEmail(email);
    u.setPasswordHash(encoder.encode(req.password()));
    u.setPhone(req.phone());
    u.setAddress(req.address());
    u.setRole("CUSTOMER");
    users.save(u);

    RewardWallet w = new RewardWallet();
    w.setId("W-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    w.setUserId(u.getId());
    w.setPointBalance(0);
    wallets.save(w);

    String token = JwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole(), jwtSecret, jwtTtl);
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getRole(), u.getName());
  }

  /** Creates fixed demo accounts on first login attempt if missing (dev convenience). */
  public AuthResponse login(LoginRequest req) {
    String email = req.email().trim().toLowerCase();
    User u = users.findByEmail(email).orElse(null);
    if (u == null) {
      String demoPassword = null;
      String demoName = null;
      String demoRole = null;
      String demoId = null;
      if (email.equals("trilochan@nextgen.com")) {
        demoPassword = "trilochan@123"; demoName = "Trilochan"; demoRole = "ADMIN"; demoId = "U-ADMIN01";
      } else if (email.equals("user@shop.com")) {
        demoPassword = "User@123"; demoName = "Demo Customer"; demoRole = "CUSTOMER"; demoId = "U-USER01";
      } else if (email.equals("john@example.com")) {
        demoPassword = "John@123"; demoName = "John"; demoRole = "CUSTOMER"; demoId = "U-102";
      } else if (email.equals("jane@example.com")) {
        demoPassword = "Jane@123"; demoName = "Jane"; demoRole = "CUSTOMER"; demoId = "U-103";
      }
      if (demoPassword != null && req.password().equals(demoPassword)) {
        u = new User();
        u.setId(demoId);
        u.setName(demoName);
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(demoPassword));
        u.setRole(demoRole);
        users.save(u);
      }
    }
    if (u == null || !encoder.matches(req.password(), u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    if (!u.isActive()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account blocked by admin");
    }
    ensureWallet(u.getId());
    String token = JwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole(), jwtSecret, jwtTtl);
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getRole(), u.getName());
  }

  /** OTP-based registration final step: consumes a verified otpToken, creates the
   *  user with name + password and issues a normal session JWT. */
  public AuthResponse registerViaOtp(RegisterCompleteRequest req, OtpService otp) {
    String email = otp.validateOtpToken(req.otpToken());
    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP session expired or invalid");
    }
    if (users.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }
    if (!otp.consumeVerified(email)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP session already used");
    }

    User u = new User();
    u.setId("U-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    u.setName(req.name().trim());
    u.setEmail(email);
    u.setPasswordHash(encoder.encode(req.password()));
    u.setRole("CUSTOMER");
    users.save(u);

    RewardWallet w = new RewardWallet();
    w.setId("W-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    w.setUserId(u.getId());
    w.setPointBalance(0);
    wallets.save(w);

    String token = JwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole(), jwtSecret, jwtTtl);
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getRole(), u.getName());
  }

  /** OTP-based login: consumes a verified otpToken, finds (or demo-creates) the
   *  user and issues a normal session JWT. No password required. */
  public AuthResponse loginViaOtp(OtpLoginRequest req, OtpService otp) {
    String email = otp.validateOtpToken(req.otpToken());
    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP session expired or invalid");
    }
    User u = users.findByEmail(email).orElse(null);

    // Demo-account fallback for dev convenience when no real account exists yet.
    if (u == null) {
      if (email.equals("trilochan@nextgen.com")) {
        u = new User(); u.setId("U-ADMIN01"); u.setName("Trilochan"); u.setEmail(email);
        u.setRole("ADMIN"); users.save(u);
      } else if (email.equals("user@shop.com")) {
        u = new User(); u.setId("U-USER01"); u.setName("Demo Customer"); u.setEmail(email);
        u.setRole("CUSTOMER"); users.save(u);
      } else {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No account for this email — register first");
      }
    }

    if (!otp.consumeVerified(email)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP session already used");
    }
    if (!u.isActive()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account blocked by admin");
    }
    ensureWallet(u.getId());
    String token = JwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole(), jwtSecret, jwtTtl);
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getRole(), u.getName());
  }

  /** Reset password: consumes a verified otpToken (from forgot-password flow),
   *  finds the user and replaces the password hash. */
  public AuthResponse resetPassword(ResetPasswordRequest req, OtpService otp) {
    String email = otp.validateOtpToken(req.otpToken());
    if (email == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP session expired or invalid");
    }
    if (!otp.consumeVerified(email)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP session already used");
    }
    User u = users.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account for this email"));
    if (!u.isActive()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account blocked by admin");
    }
    u.setPasswordHash(encoder.encode(req.newPassword()));
    users.save(u);
    ensureWallet(u.getId());
    String token = JwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole(), jwtSecret, jwtTtl);
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getRole(), u.getName());
  }

  private void ensureWallet(String userId) {
    if (wallets.findByUserId(userId).isEmpty()) {
      RewardWallet w = new RewardWallet();
      w.setId("W-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      w.setUserId(userId);
      w.setPointBalance(0);
      wallets.save(w);
    }
  }

  public User me(String token) {
    try {
      String userId = JwtUtil.parse(token, jwtSecret).getSubject();
      return users.findById(userId)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
    }
  }

  public User update(String token, UpdateProfileRequest req) {
    User u = me(token);
    if (req.name() != null && !req.name().isBlank()) u.setName(req.name().trim());
    if (req.phone() != null) u.setPhone(req.phone());
    if (req.address() != null) u.setAddress(req.address());
    return users.save(u);
  }

  /** Admin user list — password hashes never leave the service. */
  public java.util.List<java.util.Map<String, Object>> allUsers() {
    return users.findAll().stream()
        .map(u -> java.util.Map.<String, Object>of("userId", u.getId(), "name",
            u.getName() == null ? "" : u.getName(), "email", u.getEmail(), "role", u.getRole(),
            "active", u.isActive()))
        .toList();
  }

  /** Admin block/unblock. Self-block and last-admin-block are rejected. */
  public java.util.Map<String, Object> setActive(String adminId, String targetId, boolean active) {
    User target = users.findById(targetId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    if (target.getId().equals(adminId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot block yourself");
    }
    if (!active && "ADMIN".equals(target.getRole())
        && users.findAll().stream().filter(x -> "ADMIN".equals(x.getRole()) && x.isActive()).count() <= 1) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot block the last active admin");
    }
    target.setActive(active);
    users.save(target);
    return java.util.Map.of("userId", target.getId(), "active", target.isActive());
  }

  /** Admin delete. Self-delete and last-admin-delete are rejected. */
  public java.util.Map<String, Object> deleteUser(String adminId, String targetId) {
    User target = users.findById(targetId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    if (target.getId().equals(adminId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete yourself");
    }
    if ("ADMIN".equals(target.getRole())
        && users.findAll().stream().filter(x -> "ADMIN".equals(x.getRole())).count() <= 1) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete the last admin");
    }
    users.deleteById(targetId);
    wallets.findByUserId(targetId).ifPresent(wallets::delete);
    return java.util.Map.of("deleted", targetId);
  }

  /** Caller admin id from the JWT subject. */
  public String adminId(String token) {
    return me(token).getId();
  }
}
