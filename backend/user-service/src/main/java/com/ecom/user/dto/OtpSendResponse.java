package com.ecom.user.dto;

/** Response for OTP send. The OTP itself is delivered only by email — it is
 *  never returned in the API response. */
public record OtpSendResponse(String message) {}
