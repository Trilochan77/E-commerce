package com.ecom.user.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/** Sends the 6-digit OTP to the user's email via Spring Mail (SMTP). */
@Service
public class EmailService {

  private final JavaMailSender mailSender;
  @Value("${MAIL_USERNAME:noreply@nextgen.com}")
  private String from;

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  public void sendOtp(String to, String otp) {
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
  }
}
