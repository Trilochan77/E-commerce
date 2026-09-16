package com.ecom.order.repository;

import com.ecom.order.entity.RewardTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RewardTransactionRepository extends MongoRepository<RewardTransaction, String> {
}
