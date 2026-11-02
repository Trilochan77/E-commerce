package com.ecom.wishlist.repository;

import com.ecom.wishlist.entity.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
  List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

  List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);

  List<Notification> findByUserIdAndCategoryOrderByCreatedAtDesc(String userId, String category);

  List<Notification> findByUserIdAndCategoryAndReadFalseOrderByCreatedAtDesc(String userId, String category);

  long countByUserIdAndReadFalse(String userId);

  Optional<Notification> findByIdAndUserId(String id, String userId);

  long deleteByUserId(String userId);

  long deleteByIdAndUserId(String id, String userId);
}
