package com.ecom.wishlist.repository;

import com.ecom.wishlist.entity.PriceDropNotification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PriceDropNotificationRepository extends MongoRepository<PriceDropNotification, String> {
  List<PriceDropNotification> findByUserIdOrderByCreatedAtDesc(String userId);
  List<PriceDropNotification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);
  long countByUserIdAndReadFalse(String userId);
  Optional<PriceDropNotification> findByIdAndUserId(String id, String userId);
  long deleteByUserId(String userId);
}
