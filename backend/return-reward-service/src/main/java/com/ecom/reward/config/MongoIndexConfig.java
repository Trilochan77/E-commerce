package com.ecom.reward.config;

import com.ecom.reward.entity.Coupon;
import com.ecom.reward.entity.CouponRedemption;
import com.ecom.reward.entity.SpinResult;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;

/** Unique indexes are the last line of defence against double spins / double use. */
@Configuration
public class MongoIndexConfig {

  @Bean
  ApplicationRunner spinAndCouponIndexes(MongoTemplate mongo) {
    return args -> {
      mongo.indexOps(Coupon.class).ensureIndex(
          new Index().on("code", Sort.Direction.ASC).unique().named("uniq_coupon_code"));
      mongo.indexOps(SpinResult.class).ensureIndex(
          new Index().on("userId", Sort.Direction.ASC)
              .on("spinDate", Sort.Direction.ASC)
              .unique().named("uniq_spin_user_day"));
      mongo.indexOps(CouponRedemption.class).ensureIndex(
          new Index().on("couponId", Sort.Direction.ASC)
              .on("userId", Sort.Direction.ASC)
              .on("status", Sort.Direction.ASC)
              .named("coupon_user_status"));
      mongo.indexOps(CouponRedemption.class).ensureIndex(
          new Index().on("status", Sort.Direction.ASC)
              .on("expiresAt", Sort.Direction.ASC)
              .named("reservation_sweep"));
    };
  }
}
