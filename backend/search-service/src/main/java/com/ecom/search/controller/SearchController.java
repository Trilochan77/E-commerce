package com.ecom.search.controller;

import com.ecom.search.service.SearchService;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
public class SearchController {

  private final SearchService svc;

  public SearchController(SearchService svc) {
    this.svc = svc;
  }

  @GetMapping("/api/search")
  public Map<String, Object> search(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String category,
      @RequestParam(required = false) Double minPrice,
      @RequestParam(required = false) Double maxPrice,
      @RequestParam(required = false) String sort,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestHeader(value = "X-User-Id", required = false) String userId) {
    return svc.search(q, category, minPrice, maxPrice, sort, page, Math.min(size, 100), userId);
  }

  @PostMapping("/api/search/reindex")
  public Map<String, Object> reindex() {
    return svc.reindex();
  }
}
