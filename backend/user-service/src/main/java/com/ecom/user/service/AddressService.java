package com.ecom.user.service;

import com.ecom.user.dto.AddressRequest;
import com.ecom.user.entity.Address;
import com.ecom.user.repository.AddressRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AddressService {

  private final AddressRepository addresses;

  public AddressService(AddressRepository addresses) {
    this.addresses = addresses;
  }

  public List<Address> list(String userId) {
    return addresses.findByUserIdOrderByCreatedAtDesc(userId);
  }

  private static String normType(String t) {
    if (t == null) return "HOME";
    String u = t.trim().toUpperCase();
    return (u.equals("HOME") || u.equals("WORK") || u.equals("OTHER")) ? u : "HOME";
  }

  private void clearDefaults(String userId, String exceptId) {
    for (Address a : addresses.findByUserIdOrderByCreatedAtDesc(userId)) {
      if (!a.getId().equals(exceptId) && a.isDefault()) {
        a.setDefault(false);
        a.setUpdatedAt(Instant.now());
        addresses.save(a);
      }
    }
  }

  public Address create(AddressRequest req) {
    Address a = new Address();
    a.setId("A-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    a.setUserId(req.userId().trim());
    a.setFullName(req.fullName().trim());
    a.setPhone(req.phone().trim());
    a.setPincode(req.pincode().trim());
    a.setAddressLine(req.addressLine().trim());
    a.setCity(req.city().trim());
    a.setState(req.state().trim());
    a.setLandmark(req.landmark() == null ? "" : req.landmark().trim());
    a.setAddressType(normType(req.addressType()));
    boolean first = addresses.countByUserId(a.getUserId()) == 0;
    boolean makeDefault = first || Boolean.TRUE.equals(req.isDefault());
    a.setDefault(makeDefault);
    a.setCreatedAt(Instant.now());
    a.setUpdatedAt(Instant.now());
    addresses.save(a);
    if (makeDefault) clearDefaults(a.getUserId(), a.getId());
    return a;
  }

  public Address update(String id, AddressRequest req) {
    Address a = addresses.findByIdAndUserId(id, req.userId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
    if (req.fullName() != null && !req.fullName().isBlank()) a.setFullName(req.fullName().trim());
    if (req.phone() != null && !req.phone().isBlank()) a.setPhone(req.phone().trim());
    if (req.pincode() != null && !req.pincode().isBlank()) a.setPincode(req.pincode().trim());
    if (req.addressLine() != null && !req.addressLine().isBlank()) a.setAddressLine(req.addressLine().trim());
    if (req.city() != null && !req.city().isBlank()) a.setCity(req.city().trim());
    if (req.state() != null && !req.state().isBlank()) a.setState(req.state().trim());
    if (req.landmark() != null) a.setLandmark(req.landmark().trim());
    if (req.addressType() != null) a.setAddressType(normType(req.addressType()));
    a.setUpdatedAt(Instant.now());
    if (Boolean.TRUE.equals(req.isDefault())) {
      a.setDefault(true);
      addresses.save(a);
      clearDefaults(a.getUserId(), a.getId());
    } else {
      addresses.save(a);
    }
    return a;
  }

  public void delete(String id, String userId) {
    Address a = addresses.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
    boolean wasDefault = a.isDefault();
    addresses.delete(a);
    if (wasDefault) {
      List<Address> rest = addresses.findByUserIdOrderByCreatedAtDesc(userId);
      if (!rest.isEmpty()) {
        Address next = rest.get(rest.size() - 1);
        next.setDefault(true);
        next.setUpdatedAt(Instant.now());
        addresses.save(next);
      }
    }
  }

  public Address setDefault(String id, String userId) {
    Address a = addresses.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
    a.setDefault(true);
    a.setUpdatedAt(Instant.now());
    addresses.save(a);
    clearDefaults(userId, a.getId());
    return a;
  }
}
