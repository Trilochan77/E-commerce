package com.ecom.order.repository;

import com.ecom.order.entity.RewardWallet;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RewardWalletRepository extends MongoRepository<RewardWallet, String> {
  Optional<RewardWallet> findByUserId(String userId);
}
