package com.ecom.wishlist.service;

import com.ecom.wishlist.entity.PriceDropNotification;
import com.ecom.wishlist.repository.PriceDropNotificationRepository;
import java.util.List;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {
  private final PriceDropNotificationRepository repo;
  private final MongoTemplate mongo;

  public NotificationService(PriceDropNotificationRepository repo, MongoTemplate mongo) {
    this.repo = repo;
    this.mongo = mongo;
  }

  public List<PriceDropNotification> list(String userId, boolean unreadOnly) {
    return unreadOnly
        ? repo.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
        : repo.findByUserIdOrderByCreatedAtDesc(userId);
  }

  public long unreadCount(String userId) {
    return repo.countByUserIdAndReadFalse(userId);
  }

  public PriceDropNotification markRead(String userId, String notificationId) {
    PriceDropNotification n = repo.findByIdAndUserId(notificationId, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    if (!n.isRead()) {
      n.setRead(true);
      repo.save(n);
    }
    return n;
  }

  public long markAllRead(String userId) {
    Query query = Query.query(Criteria.where("userId").is(userId).and("read").is(false));
    return mongo.updateMulti(query, Update.update("read", true), PriceDropNotification.class)
        .getModifiedCount();
  }

  public long clear(String userId) {
    return repo.deleteByUserId(userId);
  }
}
