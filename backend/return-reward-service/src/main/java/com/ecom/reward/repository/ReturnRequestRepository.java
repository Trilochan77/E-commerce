package com.ecom.reward.repository;

import com.ecom.reward.entity.ReturnRequest;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ReturnRequestRepository extends MongoRepository<ReturnRequest, String> {
  List<ReturnRequest> findByUserIdOrderByCreatedAtDesc(String userId);
  List<ReturnRequest> findByStatusOrderByCreatedAtDesc(String status);
  List<ReturnRequest> findByUserIdAndOrderIdAndProductId(String userId, String orderId, String productId);
}
