package com.ecom.recommendation.repository;

import com.ecom.recommendation.entity.UserActivity;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserActivityRepository extends MongoRepository<UserActivity, String> {
  List<UserActivity> findTop200ByUserIdOrderByTimestampDesc(String userId);
  List<UserActivity> findByUserIdAndTypeOrderByTimestampDesc(String userId, String type);
}
