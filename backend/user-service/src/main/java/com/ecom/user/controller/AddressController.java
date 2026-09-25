package com.ecom.user.controller;

import com.ecom.user.dto.AddressRequest;
import com.ecom.user.entity.Address;
import com.ecom.user.service.AddressService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
public class AddressController {

  private final AddressService svc;

  public AddressController(AddressService svc) {
    this.svc = svc;
  }

  @GetMapping("/api/addresses/user/{userId}")
  public List<Address> list(@PathVariable String userId) {
    return svc.list(userId);
  }

  @PostMapping("/api/addresses")
  public Address create(@Valid @RequestBody AddressRequest req) {
    return svc.create(req);
  }

  @PutMapping("/api/addresses/{id}")
  public Address update(@PathVariable String id, @RequestBody AddressRequest req) {
    return svc.update(id, req);
  }

  @DeleteMapping("/api/addresses/{id}")
  public Map<String, String> delete(@PathVariable String id, @RequestParam String userId) {
    svc.delete(id, userId);
    return Map.of("deleted", id);
  }

  @PutMapping("/api/addresses/{id}/default")
  public Address setDefault(@PathVariable String id, @RequestBody Map<String, String> body) {
    return svc.setDefault(id, body.getOrDefault("userId", ""));
  }
}
