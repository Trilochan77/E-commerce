package com.ecom.reward.controller;

import com.ecom.reward.dto.SpinRequest;
import com.ecom.reward.service.SpinService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
public class SpinController {

  private final SpinService svc;

  public SpinController(SpinService svc) {
    this.svc = svc;
  }

  /** Public wheel layout — no weights are exposed. */
  @GetMapping("/spin/prizes")
  public List<Map<String, Object>> prizes() {
    return svc.prizes();
  }

  /** Whether this account can spin today, plus the wheel layout. */
  @GetMapping("/spin/status")
  public Map<String, Object> status(@RequestParam String userId) {
    return svc.status(userId);
  }

  /** Server selects the prize; the client only learns which segment to stop on. */
  @PostMapping("/spin")
  public Map<String, Object> spin(@Valid @RequestBody SpinRequest req) {
    return svc.spin(req.userId().trim());
  }
}
