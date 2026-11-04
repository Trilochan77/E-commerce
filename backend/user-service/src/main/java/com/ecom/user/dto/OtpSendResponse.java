package com.ecom.user.dto;

/** Response for OTP send.
 *  When online and SMTP succeeds: emailSent=true, devOtp=null.
 *  When offline or SMTP fails: emailSent=false, devOtp provides the code for dev/local testing. */
public record OtpSendResponse(String message, String devOtp, boolean emailSent) {
  public OtpSendResponse(String message) {
    this(message, null, true);
  }
}
