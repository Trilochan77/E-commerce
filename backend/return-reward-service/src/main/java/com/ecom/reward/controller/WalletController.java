package com.ecom.reward.controller;

import com.ecom.reward.entity.RewardTransaction;
import com.ecom.reward.service.ReturnService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
public class WalletController {

  private final ReturnService svc;

  public WalletController(ReturnService svc) {
    this.svc = svc;
  }

  @GetMapping("/api/wallet/{userId}")
  public Map<String, Object> wallet(@PathVariable String userId) {
    return svc.wallet(userId);
  }

  @GetMapping("/api/rewards/transactions/{userId}")
  public List<RewardTransaction> transactions(@PathVariable String userId) {
    return svc.transactions(userId);
  }

  @GetMapping("/api/rewards/estimate")
  public Map<String, Object> estimate(@RequestParam String productId,
      @RequestParam(defaultValue = "1") int quantity,
      @RequestParam String condition,
      @RequestParam(required = false) String orderId) {
    if (orderId != null && !orderId.isBlank()) return svc.estimateForOrder(orderId, productId, quantity, condition);
    return svc.estimate(productId, quantity, condition);
  }
}
