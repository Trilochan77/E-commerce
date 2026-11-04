package com.ecom.user.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/** Sends the 6-digit OTP to the user's email via Spring Mail (SMTP).
 *  Falls back gracefully if the host is offline or SMTP server is unreachable. */
@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  @Value("${MAIL_USERNAME:noreply@nextgen.com}")
  private String from;

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  public boolean sendOtp(String to, String otp) {
    try {
      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(from);
      message.setTo(to);
      message.setSubject("NextGen Shop — Your verification code");
      message.setText(
          "Hi,\n\n"
          + "Your verification code is: " + otp + "\n"
          + "It expires in 5 minutes.\n\n"
          + "If you didn't request this, you can safely ignore this email.\n\n"
          + "— NextGen Shop Team");
      mailSender.send(message);
      log.info("[OTP] Successfully sent verification email to {}", to);
      return true;
    } catch (Exception e) {
      log.warn("[OTP] (Offline / SMTP error: {}) Could not deliver email to {}. Fallback OTP code for testing is: [{}]",
          e.getMessage(), to, otp);
      return false;
    }
  }
}
