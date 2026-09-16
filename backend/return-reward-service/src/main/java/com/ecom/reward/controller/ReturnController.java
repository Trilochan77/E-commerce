package com.ecom.reward.controller;

import com.ecom.reward.dto.EvaluateRequest;
import com.ecom.reward.dto.SubmitReturnRequest;
import com.ecom.reward.entity.ReturnRequest;
import com.ecom.reward.service.ReturnService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class ReturnController {

  private final ReturnService svc;

  public ReturnController(ReturnService svc) {
    this.svc = svc;
  }

  @PostMapping("/api/returns")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> submit(@Valid @RequestBody SubmitReturnRequest req) {
    return svc.submit(req);
  }

  @GetMapping("/api/returns/user/{userId}")
  public List<ReturnRequest> byUser(@PathVariable String userId) {
    return svc.byUser(userId);
  }

  @GetMapping("/api/returns")
  public List<ReturnRequest> all(@RequestParam(required = false) String status) {
    return svc.all(status);
  }

  @GetMapping("/api/returns/{id}")
  public ReturnRequest get(@PathVariable String id) {
    return svc.get(id);
  }

  @PutMapping("/api/returns/{id}/status")
  public ReturnRequest status(@PathVariable String id, @RequestBody Map<String, String> body) {
    return svc.updateStatus(id, body.getOrDefault("status", ""), body.get("adminNote"));
  }

  @PutMapping("/api/returns/{id}/evaluate")
  public ReturnRequest evaluate(@PathVariable String id, @Valid @RequestBody EvaluateRequest req,
      @RequestHeader(value = "X-Role", required = false) String role) {
    return svc.evaluate(id, req, role);
  }
}
