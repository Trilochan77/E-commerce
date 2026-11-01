package com.ecom.product.repository;

import com.ecom.product.entity.OrderRef;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRefRepository extends MongoRepository<OrderRef, String> {
  List<OrderRef> findByUserId(String userId);
}

