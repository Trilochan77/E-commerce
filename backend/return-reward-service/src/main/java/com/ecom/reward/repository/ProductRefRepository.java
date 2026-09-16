package com.ecom.reward.repository;

import com.ecom.reward.entity.ProductRef;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRefRepository extends MongoRepository<ProductRef, String> {
}
