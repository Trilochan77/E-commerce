package com.ecom.wishlist.repository;

import com.ecom.wishlist.entity.Wishlist;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WishlistRepository extends MongoRepository<Wishlist, String> {
  Optional<Wishlist> findByUserId(String userId);
}
