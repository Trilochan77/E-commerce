package com.ecom.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

/**
 * Phase-0 JWT helper shared by gateway + all microservices.
 * Secret must be >= 32 chars. Configure via env JWT_SECRET.
 */
public final class JwtUtil {

  private JwtUtil() {}

  private static SecretKey key(String secret) {
    return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public static String generateToken(String userId, String email, String role, String secret, long ttlMillis) {
    long now = System.currentTimeMillis();
    return Jwts.builder()
        .subject(userId)
        .claim("email", email)
        .claim("role", role)
        .issuedAt(new Date(now))
        .expiration(new Date(now + ttlMillis))
        .signWith(key(secret))
        .compact();
  }

  public static Claims parse(String token, String secret) {
    return Jwts.parser().verifyWith(key(secret)).build().parseSignedClaims(token).getPayload();
  }

  public static boolean isExpired(String token, String secret) {
    try {
      return parse(token, secret).getExpiration().before(new Date());
    } catch (Exception e) {
      return true;
    }
  }
}
