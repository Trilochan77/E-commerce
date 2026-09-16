package com.ecom.order.repository;

import com.ecom.order.entity.Order;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRepository extends MongoRepository<Order, String> {
  List<Order> findByUserIdOrderByOrderDateDesc(String userId);
  List<Order> findAllByOrderByOrderDateDesc();
}
