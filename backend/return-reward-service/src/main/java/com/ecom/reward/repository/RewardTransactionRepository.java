package com.ecom.reward.repository;

import com.ecom.reward.entity.RewardTransaction;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RewardTransactionRepository extends MongoRepository<RewardTransaction, String> {
  List<RewardTransaction> findByUserIdOrderByCreatedAtDesc(String userId);
}
