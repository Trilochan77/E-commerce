package com.ecom.cart.repository;

import com.ecom.cart.entity.Cart;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CartRepository extends MongoRepository<Cart, String> {
  Optional<Cart> findByUserId(String userId);
}
