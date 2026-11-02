package com.ecom.reward.repository;

import com.ecom.reward.entity.CouponRedemption;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CouponRedemptionRepository extends MongoRepository<CouponRedemption, String> {
  long countByCouponIdAndUserIdAndStatusIn(String couponId, String userId, Collection<String> statuses);
  boolean existsByCouponIdAndUserIdAndStatus(String couponId, String userId, String status);
  List<CouponRedemption> findByStatusAndExpiresAtBefore(String status, Instant cutoff);
}
