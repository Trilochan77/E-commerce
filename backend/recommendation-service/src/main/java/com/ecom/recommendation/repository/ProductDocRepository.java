package com.ecom.recommendation.repository;

import com.ecom.recommendation.entity.ProductDoc;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductDocRepository extends MongoRepository<ProductDoc, String> {
  List<ProductDoc> findByAvailabilityTrue();
}
