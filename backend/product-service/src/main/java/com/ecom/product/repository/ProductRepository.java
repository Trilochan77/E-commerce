package com.ecom.product.repository;

import com.ecom.product.entity.Product;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {
  List<Product> findByCategoryId(String categoryId);
}
