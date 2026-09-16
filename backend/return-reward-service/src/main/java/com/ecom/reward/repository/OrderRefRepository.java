package com.ecom.reward.repository;

import com.ecom.reward.entity.OrderRef;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRefRepository extends MongoRepository<OrderRef, String> {
}
