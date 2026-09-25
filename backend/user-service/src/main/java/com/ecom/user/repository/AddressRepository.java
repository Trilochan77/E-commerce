package com.ecom.user.repository;

import com.ecom.user.entity.Address;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AddressRepository extends MongoRepository<Address, String> {
  List<Address> findByUserIdOrderByCreatedAtDesc(String userId);
  Optional<Address> findByIdAndUserId(String id, String userId);
  long countByUserId(String userId);
}
