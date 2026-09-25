package com.ecom.reward.service;

import com.ecom.reward.config.RewardProperties;
import com.ecom.reward.dto.EvaluateRequest;
import com.ecom.reward.dto.SubmitReturnRequest;
import com.ecom.reward.entity.OrderRef;
import com.ecom.reward.entity.ProductRef;
import com.ecom.reward.entity.ReturnRequest;
import com.ecom.reward.entity.RewardTransaction;
import com.ecom.reward.entity.RewardWallet;
import com.ecom.reward.repository.OrderRefRepository;
import com.ecom.reward.repository.ProductRefRepository;
import com.ecom.reward.repository.ReturnRequestRepository;
import com.ecom.reward.repository.RewardTransactionRepository;
import com.ecom.reward.repository.RewardWalletRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReturnService {

  private static final Set<String> TERMINAL = Set.of("REJECTED", "COMPLETED", "APPROVED_FOR_REWARD");
  private static final Map<String, Set<String>> TRANSITIONS = Map.of(
      "REQUESTED", Set.of("APPROVED", "REJECTED"),
      "APPROVED", Set.of("PRODUCT_RECEIVED", "REJECTED"),
      "PRODUCT_RECEIVED", Set.of("UNDER_INSPECTION", "REJECTED"),
      "UNDER_INSPECTION", Set.of("APPROVED_FOR_REWARD", "REJECTED"),
      "APPROVED_FOR_REWARD", Set.of("COMPLETED"),
      "REJECTED", Set.of("COMPLETED"));

  private final ReturnRequestRepository returns;
  private final OrderRefRepository orders;
  private final ProductRefRepository products;
  private final RewardWalletRepository wallets;
  private final RewardTransactionRepository transactions;
  private final RewardCalculator calc;
  private final RewardProperties props;
  private final RefundService refunds;

  public ReturnService(ReturnRequestRepository returns, OrderRefRepository orders,
      ProductRefRepository products, RewardWalletRepository wallets,
      RewardTransactionRepository transactions, RewardCalculator calc, RewardProperties props,
      RefundService refunds) {
    this.returns = returns;
    this.orders = orders;
    this.products = products;
    this.wallets = wallets;
    this.transactions = transactions;
    this.calc = calc;
    this.props = props;
    this.refunds = refunds;
  }

  public static final String ESTIMATE_DISCLAIMER =
      "Estimated reward only — final reward depends on verified condition after inspection.";

  /** Submit a return request after eligibility verification (SRS 3.1.13). */
  public Map<String, Object> submit(SubmitReturnRequest req) {
    OrderRef order = orders.findById(req.orderId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    if (!order.getUserId().equals(req.userId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Order does not belong to user");
    }
    if (!"PAID".equals(order.getPaymentStatus()) && !"PENDING".equals(order.getPaymentStatus())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Only paid or COD-pending orders are eligible");
    }
    if (!"DELIVERED".equals(order.getOrderStatus())) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Only DELIVERED orders are eligible (current: " + order.getOrderStatus() + ")");
    }
    long ageDays = order.getOrderDate() == null ? 0
        : Duration.between(order.getOrderDate(), Instant.now()).toDays();
    String track = ageDays <= props.getFullRefundWindowDays() ? "FULL_REFUND" : "REWARD_POINTS";
    if (ageDays > props.getRewardWindowDays()) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Return window expired (" + props.getRewardWindowDays() + " days)");
    }
    OrderRef.Item line = order.getItems() == null ? null : order.getItems().stream()
        .filter(i -> i.getProductId().equals(req.productId())).findFirst().orElse(null);
    if (line == null) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Product not part of this order");
    }
    if (req.quantity() > line.getQuantity()) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Return quantity exceeds purchased quantity (" + line.getQuantity() + ")");
    }
    ProductRef product = products.findById(req.productId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    if (!product.isEligibleForReturn()) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Product is not eligible for the return reward program");
    }
    boolean open = returns.findByUserIdAndOrderIdAndProductId(req.userId(), req.orderId(), req.productId())
        .stream().anyMatch(r -> !r.getStatus().equals("REJECTED"));
    if (open) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "An active return already exists for this item");
    }

    int estimated = calc.estimate(line.getPrice(), req.quantity(), req.claimedCondition().trim().toUpperCase());
    ReturnRequest r = new ReturnRequest();
    r.setId("RET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    r.setUserId(req.userId());
    r.setOrderId(req.orderId());
    r.setProductId(req.productId());
    r.setQuantity(req.quantity());
    r.setReason(req.reason());
    r.setClaimedCondition(req.claimedCondition().trim().toUpperCase());
    r.setReturnType(track);
    if (track.equals("FULL_REFUND")) {
      int full = (int) Math.floor(line.getPrice() * req.quantity());
      r.setEstimatedReward(0);
      r.setEstimatedRefund(full);
      r.setRefundStatus("PENDING");
      r.setRefundMethod("NONE");
    } else {
      r.setEstimatedReward(estimated);
      r.setEstimatedRefund(null);
      r.setRefundStatus("NONE");
      r.setRefundMethod("NONE");
    }
    r.setStatus("REQUESTED");
    r.setCreatedAt(Instant.now());
    r.setUpdatedAt(Instant.now());
    returns.save(r);
    if (track.equals("FULL_REFUND")) {
      return Map.of("returnId", r.getId(), "status", r.getStatus(), "returnType", track,
          "estimatedRefund", r.getEstimatedRefund(), "disclaimer", ESTIMATE_DISCLAIMER);
    }
    return Map.of("returnId", r.getId(), "status", r.getStatus(), "returnType", track,
        "estimatedReward", estimated, "disclaimer", ESTIMATE_DISCLAIMER);
  }

  public ReturnRequest get(String id) {
    return returns.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return not found"));
  }

  public List<ReturnRequest> byUser(String userId) {
    return returns.findByUserIdOrderByCreatedAtDesc(userId);
  }

  public List<ReturnRequest> all(String status) {
    if (status != null && !status.isBlank()) return returns.findByStatusOrderByCreatedAtDesc(status);
    return returns.findAll();
  }

  public ReturnRequest updateStatus(String id, String status, String adminNote) {
    ReturnRequest r = get(id);
    String next = status.trim().toUpperCase();
    Set<String> allowed = TRANSITIONS.getOrDefault(r.getStatus(), Set.of());
    if (!allowed.contains(next)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Illegal transition " + r.getStatus() + " -> " + next + " (allowed: " + allowed + ")");
    }
    if (next.equals("APPROVED_FOR_REWARD")) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Use evaluate endpoint to approve rewards (verified condition required)");
    }
    r.setStatus(next);
    if (adminNote != null) r.setAdminNote(adminNote);
    r.setUpdatedAt(Instant.now());
    return returns.save(r);
  }

  /**
   * Admin condition evaluation (SRS 3.1.15-3.1.16): sets verified condition,
   * computes final reward, credits wallet + EARNED tx exactly once.
   */
  public ReturnRequest evaluate(String id, EvaluateRequest req, String role) {
    if (!"ADMIN".equals(role)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin only");
    }
    ReturnRequest r = get(id);
    if (TERMINAL.contains(r.getStatus())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Return already finalized (" + r.getStatus() + ") — wallet credited exactly once");
    }
    String verified = req.verifiedCondition().trim().toUpperCase();
    OrderRef order = orders.findById(r.getOrderId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    double unitPrice = order.getItems().stream()
        .filter(i -> i.getProductId().equals(r.getProductId())).findFirst()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order line not found"))
        .getPrice();
    String track = r.getReturnType() == null ? "REWARD_POINTS" : r.getReturnType();
    if (req.adminNote() != null) r.setAdminNote(req.adminNote());
    r.setVerifiedCondition(verified);
    r.setUpdatedAt(Instant.now());
    if (verified.equals("NOT_ELIGIBLE")) {
      r.setStatus("REJECTED");
      r.setFinalReward(0);
      r.setFinalRefund(null);
      r.setRefundStatus("NONE");
      returns.save(r);
      return r;
    }
    if (track.equals("FULL_REFUND")) {
      // Full money back — condition gates pass/fail, amount is always 100%.
      int full = (int) Math.floor(unitPrice * r.getQuantity());
      String method = refunds.refundMethodFor(order.getPaymentMethod());
      refunds.refund(order.getPaymentMethod(), full);
      r.setFinalRefund(full);
      r.setFinalReward(0);
      r.setRefundMethod(method);
      r.setRefundStatus("REFUNDED");
      r.setStatus("APPROVED_FOR_REWARD");
      returns.save(r);
      return r;
    }
    int finalReward = calc.finalReward(unitPrice, r.getQuantity(), verified);
    r.setFinalReward(finalReward);
    r.setStatus("APPROVED_FOR_REWARD");
    returns.save(r);
    creditWallet(r.getUserId(), finalReward, r.getOrderId(), r.getId());
    return r;
  }

  private void creditWallet(String userId, int points, String orderId, String returnId) {
    RewardWallet w = wallets.findByUserId(userId).orElseGet(() -> {
      RewardWallet nw = new RewardWallet();
      nw.setId("W-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
      nw.setUserId(userId);
      nw.setPointBalance(0);
      return nw;
    });
    w.setPointBalance(w.getPointBalance() + points);
    w.setUpdatedAt(Instant.now());
    wallets.save(w);
    RewardTransaction tx = new RewardTransaction();
    tx.setId("TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    tx.setWalletId(w.getId());
    tx.setUserId(userId);
    tx.setType("EARNED");
    tx.setPoints(points);
    tx.setRelatedOrderId(orderId);
    tx.setRelatedReturnId(returnId);
    tx.setCreatedAt(Instant.now());
    transactions.save(tx);
  }

  public Map<String, Object> wallet(String userId) {
    RewardWallet w = wallets.findByUserId(userId).orElse(null);
    return Map.of("userId", userId, "balance", w == null ? 0 : w.getPointBalance());
  }

  public List<RewardTransaction> transactions(String userId) {
    return transactions.findByUserIdOrderByCreatedAtDesc(userId);
  }

  public Map<String, Object> estimate(String productId, int quantity, String condition) {
    ProductRef p = products.findById(productId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    int pts = calc.estimate(p.getPrice(), quantity, condition.trim().toUpperCase());
    return Map.of("productId", productId, "unitPrice", p.getPrice(), "quantity", quantity,
        "condition", condition.trim().toUpperCase(), "estimatedReward", pts,
        "disclaimer", ESTIMATE_DISCLAIMER);
  }

  /** Order-aware preview: FULL_REFUND (full ₹) within 14d, else REWARD_POINTS. */
  public Map<String, Object> estimateForOrder(String orderId, String productId, int quantity, String condition) {
    ProductRef p = products.findById(productId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    if (orderId != null && !orderId.isBlank()) {
      var order = orders.findById(orderId).orElse(null);
      if (order != null) {
        long ageDays = order.getOrderDate() == null ? 0
            : Duration.between(order.getOrderDate(), Instant.now()).toDays();
        if (ageDays <= props.getFullRefundWindowDays()) {
          var line = order.getItems() == null ? null : order.getItems().stream()
              .filter(i -> i.getProductId().equals(productId)).findFirst().orElse(null);
          double unit = line == null ? p.getPrice() : line.getPrice();
          int full = (int) Math.floor(unit * quantity);
          return Map.of("productId", productId, "unitPrice", unit, "quantity", quantity,
              "condition", condition.trim().toUpperCase(), "returnType", "FULL_REFUND",
              "estimatedRefund", full, "disclaimer", ESTIMATE_DISCLAIMER);
        }
      }
    }
    int pts = calc.estimate(p.getPrice(), quantity, condition.trim().toUpperCase());
    return Map.of("productId", productId, "unitPrice", p.getPrice(), "quantity", quantity,
        "condition", condition.trim().toUpperCase(), "returnType", "REWARD_POINTS",
        "estimatedReward", pts, "disclaimer", ESTIMATE_DISCLAIMER);
  }
}
