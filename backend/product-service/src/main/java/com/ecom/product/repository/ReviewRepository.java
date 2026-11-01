package com.ecom.product.repository;

import com.ecom.product.entity.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReviewRepository extends MongoRepository<Review, String> {
  List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(String productId, String status);
  List<Review> findByProductIdOrderByCreatedAtDesc(String productId);
  List<Review> findByUserIdOrderByCreatedAtDesc(String userId);
  Optional<Review> findByProductIdAndUserId(String productId, String userId);
  List<Review> findByStatusOrderByCreatedAtDesc(String status);
  List<Review> findAllByOrderByCreatedAtDesc();
}

