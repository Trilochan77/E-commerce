package com.ecom.recommendation.repository;

import com.ecom.recommendation.entity.OrderRef;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRefRepository extends MongoRepository<OrderRef, String> {
  List<OrderRef> findByUserIdAndPaymentStatus(String userId, String paymentStatus);
  List<OrderRef> findByPaymentStatus(String paymentStatus);
  List<OrderRef> findByUserIdAndPaymentStatusIn(String userId, java.util.Collection<String> paymentStatuses);
  List<OrderRef> findByPaymentStatusIn(java.util.Collection<String> paymentStatuses);
}
