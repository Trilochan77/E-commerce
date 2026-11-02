package com.ecom.recommendation.repository;

import com.ecom.recommendation.entity.UserActivity;
import java.time.Instant;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserActivityRepository extends MongoRepository<UserActivity, String> {
  List<UserActivity> findTop200ByUserIdOrderByTimestampDesc(String userId);
  List<UserActivity> findByUserIdAndTypeOrderByTimestampDesc(String userId, String type);
  List<UserActivity> findTop2000ByTimestampAfterOrderByTimestampDesc(Instant after);
  long deleteByUserIdAndType(String userId, String type);
}
