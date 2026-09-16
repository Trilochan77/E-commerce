package com.ecom.order.repository;

import com.ecom.order.entity.CartRef;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartRefRepository extends MongoRepository<CartRef, String> {
  Optional<CartRef> findByUserId(String userId);
}
