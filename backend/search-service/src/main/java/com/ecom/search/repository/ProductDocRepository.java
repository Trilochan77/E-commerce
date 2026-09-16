package com.ecom.search.repository;

import com.ecom.search.entity.ProductDoc;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductDocRepository extends MongoRepository<ProductDoc, String> {
}
