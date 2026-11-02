package com.ecom.wishlist.controller;

import com.ecom.wishlist.entity.Notification;
import com.ecom.wishlist.service.NotificationService;
import com.ecom.wishlist.service.PriceTrackerService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/**
 * Universal Notification Controller.
 * Provides in-app notification center data, read/unread status, and category filtering.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notifications;
  private final PriceTrackerService tracker;

  public NotificationController(NotificationService notifications, PriceTrackerService tracker) {
    this.notifications = notifications;
    this.tracker = tracker;
  }

  @GetMapping("/{userId}")
  public List<Notification> list(
      @PathVariable String userId,
      @RequestParam(required = false) String category,
      @RequestParam(defaultValue = "false") boolean unreadOnly) {
    return notifications.list(userId, category, unreadOnly);
  }

  @GetMapping("/{userId}/unread-count")
  public Map<String, Long> unreadCount(@PathVariable String userId) {
    return Map.of("unread", notifications.unreadCount(userId));
  }

  @PostMapping
  public Notification create(@RequestBody Notification req) {
    return notifications.create(req);
  }

  @PostMapping("/broadcast")
  public Notification broadcast(@RequestBody Notification req) {
    req.setUserId("ALL");
    return notifications.create(req);
  }

  @GetMapping("/admin/all")
  public List<Notification> adminAll() {
    return notifications.listAll();
  }

  @PutMapping("/{userId}/{notificationId}/read")
  public Notification markRead(
      @PathVariable String userId,
      @PathVariable String notificationId) {
    return notifications.markRead(userId, notificationId);
  }

  @PutMapping("/{userId}/read-all")
  public Map<String, Long> markAllRead(@PathVariable String userId) {
    return Map.of("updated", notifications.markAllRead(userId));
  }

  @DeleteMapping("/{userId}/{notificationId}")
  public Map<String, Boolean> delete(
      @PathVariable String userId,
      @PathVariable String notificationId) {
    return Map.of("deleted", notifications.delete(userId, notificationId));
  }

  @DeleteMapping("/{userId}")
  public Map<String, Long> clear(@PathVariable String userId) {
    return Map.of("deleted", notifications.clear(userId));
  }

  /** Compare wishlist prices with the catalog now instead of waiting for the scheduler. */
  @PostMapping("/{userId}/scan")
  public PriceTrackerService.ScanResult scan(@PathVariable String userId) {
    return tracker.scanUser(userId);
  }
}
