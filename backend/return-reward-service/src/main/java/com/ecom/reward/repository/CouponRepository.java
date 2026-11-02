package com.ecom.reward.repository;

import com.ecom.reward.entity.Coupon;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CouponRepository extends MongoRepository<Coupon, String> {
  Optional<Coupon> findByCode(String code);
  List<Coupon> findByOwnerUserIdOrderByCreatedAtDesc(String ownerUserId);
  List<Coupon> findAllByOrderByCreatedAtDesc();
}
