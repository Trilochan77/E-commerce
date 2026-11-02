package com.ecom.recommendation.repository;

import com.ecom.recommendation.entity.CategoryDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryDocRepository extends MongoRepository<CategoryDoc, String> {}
