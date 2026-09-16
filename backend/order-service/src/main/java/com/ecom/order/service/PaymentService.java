package com.ecom.order.service;

import org.springframework.stereotype.Service;

/**
 * Mock payment (SRS 3.1.28: process through configured mechanism).
 * Real gateway (Razorpay/Stripe) plugs in here later.
 */
@Service
public class PaymentService {

  public void charge(String method, double amount) {
    if (method == null || method.isBlank()) {
      throw new PaymentFailedException("Payment method required");
    }
    String m = method.trim().toUpperCase();
    if (m.equals("FAIL") || m.equals("CARD_DECLINED")) {
      throw new PaymentFailedException("Payment declined by mock gateway");
    }
    if (amount < 0) throw new PaymentFailedException("Invalid amount");
    // COD / UPI / CARD succeed in mock.
  }

  public static class PaymentFailedException extends RuntimeException {
    public PaymentFailedException(String msg) {
      super(msg);
    }
  }
}
