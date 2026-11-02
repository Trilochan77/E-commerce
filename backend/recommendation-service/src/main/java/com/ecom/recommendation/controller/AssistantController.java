package com.ecom.recommendation.controller;

import com.ecom.recommendation.dto.AssistantRequest;
import com.ecom.recommendation.dto.AssistantResponse;
import com.ecom.recommendation.service.ShoppingAssistantService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * Grounded shopping assistant. Deterministic rules + live catalog retrieval;
 * no ML model and no external provider is involved.
 */
@RestController
public class AssistantController {

  private final ShoppingAssistantService svc;

  public AssistantController(ShoppingAssistantService svc) {
    this.svc = svc;
  }

  @PostMapping("/api/assistant/chat")
  public AssistantResponse chat(@Valid @RequestBody AssistantRequest req) {
    return svc.chat(req);
  }

  @GetMapping("/api/assistant/health")
  public java.util.Map<String, Object> health() {
    return java.util.Map.of("status", "ok", "strategy", "rules+retrieval", "grounded", true);
  }
}
