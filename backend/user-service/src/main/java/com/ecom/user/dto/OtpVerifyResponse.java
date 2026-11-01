package com.ecom.user.dto;

/** Returned after a successful OTP verification. otpToken is a short-lived
 *  (5 min) JWT proving the email was verified; it authorizes register-complete
 *  or otp-login. */
public record OtpVerifyResponse(boolean verified, String otpToken) {}
