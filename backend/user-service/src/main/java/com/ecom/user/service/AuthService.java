package com.ecom.user.service;

import com.ecom.common.security.JwtUtil;
import com.ecom.user.dto.AuthResponse;
import com.ecom.user.dto.LoginRequest;
import com.ecom.user.dto.RegisterRequest;
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
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getRole());
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
      if (email.equals("admin@shop.com")) {
        demoPassword = "Admin@123"; demoName = "Admin"; demoRole = "ADMIN"; demoId = "U-ADMIN01";
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
    ensureWallet(u.getId());
    String token = JwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole(), jwtSecret, jwtTtl);
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getRole());
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
            u.getName() == null ? "" : u.getName(), "email", u.getEmail(), "role", u.getRole()))
        .toList();
  }
}
