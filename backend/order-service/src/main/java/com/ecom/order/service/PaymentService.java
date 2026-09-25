package com.ecom.order.service;

import java.util.Set;
import org.springframework.stereotype.Service;

/**
 * Mock payment (SRS 3.1.28: process through configured mechanism).
 * Real gateway (Razorpay/Stripe) plugs in here later.
 *
 * <p>Semantics fixed per method:
 * <ul>
 *   <li>COD — no online charge, order stays PENDING until cash collected on delivery.</li>
 *   <li>UPI / CARD — charged online now, order becomes PAID.</li>
 * </ul>
 */
@Service
public class PaymentService {

  private static final Set<String> ALLOWED = Set.of("COD", "UPI", "CARD");

  public void charge(String method, double amount) {
    String m = normalize(method);
    if (m.equals("FAIL") || m.equals("CARD_DECLINED")) {
      throw new PaymentFailedException("Payment declined by mock gateway");
    }
    if (!ALLOWED.contains(m)) {
      throw new PaymentFailedException("Unsupported payment method: " + method + " (allowed: COD, UPI, CARD)");
    }
    if (amount < 0) throw new PaymentFailedException("Invalid amount");
    // COD = no online charge (succeeds, stays PENDING). UPI / CARD succeed in mock.
    if (!m.equals("COD") && amount == 0) {
      // zero-amount online payment is fine (fully covered by wallet) — still PAID.
    }
  }

  /** Payment status the order should carry after a successful charge. */
  public String paymentStatusFor(String method) {
    String m = normalize(method);
    if (m.equals("COD")) return "PENDING";
    return "PAID";
  }

  public static String normalize(String method) {
    if (method == null || method.isBlank()) {
      throw new PaymentFailedException("Payment method required");
    }
    return method.trim().toUpperCase();
  }

  public static class PaymentFailedException extends RuntimeException {
    public PaymentFailedException(String msg) {
      super(msg);
    }
  }
}
