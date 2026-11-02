package com.ecom.wishlist.controller;

import com.ecom.wishlist.entity.PriceDropNotification;
import com.ecom.wishlist.service.NotificationService;
import com.ecom.wishlist.service.PriceTrackerService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

/** In-app price-drop notifications for a user, plus a manual price scan. */
@RestController
public class NotificationController {
  private final NotificationService notifications;
  private final PriceTrackerService tracker;

  public NotificationController(NotificationService notifications, PriceTrackerService tracker) {
    this.notifications = notifications;
    this.tracker = tracker;
  }

  @GetMapping("/api/notifications/{userId}")
  public List<PriceDropNotification> list(@PathVariable String userId,
                                          @RequestParam(defaultValue = "false") boolean unreadOnly) {
    return notifications.list(userId, unreadOnly);
  }

  @GetMapping("/api/notifications/{userId}/unread-count")
  public Map<String, Long> unreadCount(@PathVariable String userId) {
    return Map.of("unread", notifications.unreadCount(userId));
  }

  @PutMapping("/api/notifications/{userId}/{notificationId}/read")
  public PriceDropNotification markRead(@PathVariable String userId,
                                        @PathVariable String notificationId) {
    return notifications.markRead(userId, notificationId);
  }

  @PutMapping("/api/notifications/{userId}/read-all")
  public Map<String, Long> markAllRead(@PathVariable String userId) {
    return Map.of("updated", notifications.markAllRead(userId));
  }

  @DeleteMapping("/api/notifications/{userId}")
  public Map<String, Long> clear(@PathVariable String userId) {
    return Map.of("deleted", notifications.clear(userId));
  }

  /** Compare wishlist prices with the catalog now instead of waiting for the scheduler. */
  @PostMapping("/api/notifications/{userId}/scan")
  public PriceTrackerService.ScanResult scan(@PathVariable String userId) {
    return tracker.scanUser(userId);
  }
}
