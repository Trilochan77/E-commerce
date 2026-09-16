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

  /** Creates the fixed demo admin on first login attempt if missing (dev convenience). */
  public AuthResponse login(LoginRequest req) {
    String email = req.email().trim().toLowerCase();
    User u = users.findByEmail(email).orElse(null);
    if (u == null && email.equals("admin@shop.com")) {
      u = new User();
      u.setId("U-ADMIN01");
      u.setName("Admin");
      u.setEmail(email);
      u.setPasswordHash(encoder.encode("Admin@123"));
      u.setRole("ADMIN");
      users.save(u);
    }
    if (u == null || !encoder.matches(req.password(), u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    String token = JwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole(), jwtSecret, jwtTtl);
    return new AuthResponse(token, u.getId(), u.getEmail(), u.getRole());
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
}
