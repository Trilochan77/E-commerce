package com.ecom.reward.service;

import org.springframework.stereotype.Service;

/**
 * Mock refund (mirrors order-service PaymentService).
 * UPI / CARD → money back to SOURCE; COD → BANK_TRANSFER (cash collected at
 * delivery is returned via transfer in this demo). Always succeeds in mock.
 */
@Service
public class RefundService {

  public String refundMethodFor(String paymentMethod) {
    String m = paymentMethod == null ? "" : paymentMethod.trim().toUpperCase();
    if (m.equals("COD")) return "BANK_TRANSFER";
    return "SOURCE";
  }

  public void refund(String paymentMethod, int amount) {
    if (amount < 0) throw new IllegalArgumentException("Invalid refund amount");
    // mock: always succeeds.
  }
}
