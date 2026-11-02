package com.ecom.reward.repository;

import com.ecom.reward.entity.SpinResult;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SpinResultRepository extends MongoRepository<SpinResult, String> {
  Optional<SpinResult> findByUserIdAndSpinDate(String userId, String spinDate);
  List<SpinResult> findByUserIdOrderByCreatedAtDesc(String userId);
  Optional<SpinResult> findFirstByUserIdOrderByCreatedAtDesc(String userId);
}
