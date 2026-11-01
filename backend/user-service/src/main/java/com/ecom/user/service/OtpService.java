package com.ecom.user.service;

import com.ecom.common.security.JwtUtil;
import com.ecom.user.dto.OtpVerifyResponse;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/** In-memory OTP store (dev/demo). Generates a 6-digit OTP per email with a
 *  5-minute TTL and delivers it via EmailService (Gmail SMTP). After
 *  successful verification it issues a short-lived otpToken (JWT, 5 min)
 *  authorizing register-complete or otp-login.
 *
 *  The OTP itself is delivered only by email — it is never returned in the
 *  API response. */
@Service
public class OtpService {

  private static final long OTP_TTL_MILLIS = 5 * 60 * 1000;   // 5 minutes
  private static final long OTP_TOKEN_TTL_MILLIS = 5 * 60 * 1000; // 5 minutes

  private final Map<String, OtpRecord> store = new ConcurrentHashMap<>();
  private final EmailService email;

  @Value("${jwt.secret:change-me-dev-secret-min-32-chars-long}")
  private String jwtSecret;

  public record OtpRecord(String otp, long createdAt, boolean verified) {}

  public OtpService(EmailService email) {
    this.email = email;
  }

  /** Generate + store a fresh OTP for the email and deliver it by email. */
  public void sendOtp(String emailAddr) {
    String otp = String.format("%06d", new Random().nextInt(1_000_000));
    store.put(emailAddr.toLowerCase(), new OtpRecord(otp, System.currentTimeMillis(), false));
    email.sendOtp(emailAddr, otp);
  }

  /** Verify the OTP for the email. Returns an OtpVerifyResponse with a short-lived
   *  otpToken when the code matches and is not expired. */
  public OtpVerifyResponse verifyOtp(String emailAddr, String otp) {
    emailAddr = emailAddr.toLowerCase();
    OtpRecord rec = store.get(emailAddr);
    if (rec == null) {
      return new OtpVerifyResponse(false, null);
    }
    if (System.currentTimeMillis() - rec.createdAt() > OTP_TTL_MILLIS) {
      store.remove(emailAddr);
      return new OtpVerifyResponse(false, null);
    }
    if (!rec.otp().equals(otp)) {
      return new OtpVerifyResponse(false, null);
    }
    // mark verified + issue short-lived otpToken
    store.put(emailAddr, new OtpRecord(rec.otp(), rec.createdAt(), true));
    String otpToken = JwtUtil.generateToken(emailAddr, emailAddr, "OTP_VERIFIED", jwtSecret, OTP_TOKEN_TTL_MILLIS);
    return new OtpVerifyResponse(true, otpToken);
  }

  /** Validate an otpToken issued by verifyOtp. Returns the verified email or null. */
  public String validateOtpToken(String otpToken) {
    try {
      Claims claims = JwtUtil.parse(otpToken, jwtSecret);
      if (claims.getExpiration().before(new Date())) return null;
      String role = String.valueOf(claims.get("role"));
      if (!"OTP_VERIFIED".equals(role)) return null;
      String emailAddr = claims.getSubject();
      OtpRecord rec = store.get(emailAddr);
      return (rec != null && rec.verified()) ? emailAddr : null;
    } catch (Exception e) {
      return null;
    }
  }

  /** Consume the verified state so the same otpToken can't be reused twice. */
  public boolean consumeVerified(String emailAddr) {
    OtpRecord rec = store.get(emailAddr.toLowerCase());
    if (rec == null || !rec.verified()) return false;
    store.remove(emailAddr.toLowerCase());
    return true;
  }

  /** Resend: invalidate any existing OTP for the email and issue a new one. */
  public void resendOtp(String emailAddr) {
    store.remove(emailAddr.toLowerCase());
    sendOtp(emailAddr);
  }
}
