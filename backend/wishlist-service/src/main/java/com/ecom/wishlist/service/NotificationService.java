package com.ecom.wishlist.service;

import com.ecom.wishlist.entity.Notification;
import com.ecom.wishlist.repository.NotificationRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {
  private final NotificationRepository repo;
  private final MongoTemplate mongo;

  public NotificationService(NotificationRepository repo, MongoTemplate mongo) {
    this.repo = repo;
    this.mongo = mongo;
  }

  public List<Notification> list(String userId, String category, boolean unreadOnly) {
    boolean hasCategory = StringUtils.hasText(category) && !category.equalsIgnoreCase("ALL");
    if (hasCategory) {
      String cat = category.toUpperCase().trim();
      return unreadOnly
          ? repo.findByUserIdAndCategoryAndReadFalseOrderByCreatedAtDesc(userId, cat)
          : repo.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, cat);
    }
    return unreadOnly
        ? repo.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
        : repo.findByUserIdOrderByCreatedAtDesc(userId);
  }

  public long unreadCount(String userId) {
    return repo.countByUserIdAndReadFalse(userId);
  }

  public Notification create(Notification req) {
    if (req.getId() == null || req.getId().isBlank()) {
      req.setId("NTF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    }
    if (req.getCreatedAt() == null) {
      req.setCreatedAt(Instant.now());
    }

    // Default category & icon based on notification type if not explicitly supplied
    String type = req.getType() != null ? req.getType().toUpperCase() : "GENERAL";
    req.setType(type);

    if (req.getCategory() == null || req.getCategory().isBlank()) {
      req.setCategory(inferCategory(type));
    } else {
      req.setCategory(req.getCategory().toUpperCase().trim());
    }

    if (req.getIcon() == null || req.getIcon().isBlank()) {
      req.setIcon(inferIcon(type));
    }

    return repo.save(req);
  }

  public Notification markRead(String userId, String notificationId) {
    Notification n = repo.findByIdAndUserId(notificationId, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    if (!n.isRead()) {
      n.setRead(true);
      repo.save(n);
    }
    return n;
  }

  public long markAllRead(String userId) {
    Query query = Query.query(Criteria.where("userId").is(userId).and("read").is(false));
    return mongo.updateMulti(query, Update.update("read", true), Notification.class)
        .getModifiedCount();
  }

  public boolean delete(String userId, String notificationId) {
    return repo.deleteByIdAndUserId(notificationId, userId) > 0;
  }

  public long clear(String userId) {
    return repo.deleteByUserId(userId);
  }

  private String inferCategory(String type) {
    return switch (type) {
      case "ORDER_CONFIRMED", "PAYMENT_SUCCESS", "PAYMENT_FAILED" -> "ORDERS";
      case "ORDER_SHIPPED", "OUT_FOR_DELIVERY", "ORDER_DELIVERED" -> "DELIVERY";
      case "OTP_VERIFIED", "LOGIN_SUCCESS", "SECURITY" -> "SECURITY";
      case "PRICE_DROP" -> "PRICE_DROPS";
      case "OFFER_COUPON" -> "OFFERS";
      default -> "GENERAL";
    };
  }

  private String inferIcon(String type) {
    return switch (type) {
      case "OTP_VERIFIED" -> "🔐";
      case "LOGIN_SUCCESS" -> "🛡️";
      case "ORDER_CONFIRMED" -> "📦";
      case "PAYMENT_SUCCESS" -> "💳";
      case "PAYMENT_FAILED" -> "❌";
      case "ORDER_SHIPPED" -> "📦";
      case "OUT_FOR_DELIVERY" -> "🚚";
      case "ORDER_DELIVERED" -> "🎉";
      case "PRICE_DROP" -> "📉";
      case "OFFER_COUPON" -> "🎟️";
      default -> "🔔";
    };
  }
}
