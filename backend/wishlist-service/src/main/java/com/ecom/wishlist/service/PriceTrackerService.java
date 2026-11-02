package com.ecom.wishlist.service;

import com.ecom.wishlist.entity.PriceDropNotification;
import com.ecom.wishlist.entity.ProductSnapshot;
import com.ecom.wishlist.entity.UserSnapshot;
import com.ecom.wishlist.entity.Wishlist;
import com.ecom.wishlist.repository.PriceDropNotificationRepository;
import com.ecom.wishlist.repository.WishlistRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Periodically compares each wishlisted product's catalog price with the last price
 * observed for that user. A decrease creates an in-app notification (and an optional
 * email); an increase only refreshes the observed baseline. Catalog values are read
 * from the shared {@code products} collection, so nothing is guessed.
 */
@Service
public class PriceTrackerService {
  private static final Logger log = LoggerFactory.getLogger(PriceTrackerService.class);

  private final WishlistRepository wishlists;
  private final PriceDropNotificationRepository notifications;
  private final MongoTemplate mongo;
  private final NotificationEmailService emailService;

  @Value("${ecom.notifications.scan.enabled:true}")
  private boolean scanEnabled;

  public PriceTrackerService(WishlistRepository wishlists,
                             PriceDropNotificationRepository notifications,
                             MongoTemplate mongo,
                             NotificationEmailService emailService) {
    this.wishlists = wishlists;
    this.notifications = notifications;
    this.mongo = mongo;
    this.emailService = emailService;
  }

  @Scheduled(
      fixedDelayString = "${ecom.notifications.scan.interval-ms:60000}",
      initialDelayString = "${ecom.notifications.scan.initial-delay-ms:15000}")
  public void scheduledScan() {
    if (!scanEnabled) return;
    try {
      ScanResult result = scanAll();
      if (result.notificationsCreated() > 0) {
        log.info("Price scan created {} notification(s) across {} wishlist(s)",
            result.notificationsCreated(), result.wishlistsScanned());
      }
    } catch (Exception e) {
      log.warn("Scheduled price scan failed: {}", e.getMessage());
    }
  }

  /** Scan every wishlist. Serialized so an on-demand scan cannot race the scheduler. */
  public synchronized ScanResult scanAll() {
    List<Wishlist> all = wishlists.findAll();
    return scanWishlists(all, all.size());
  }

  /** Scan one user's wishlist, used by the "check now" action. */
  public synchronized ScanResult scanUser(String userId) {
    Wishlist w = wishlists.findByUserId(userId).orElse(null);
    if (w == null) {
      return new ScanResult(0, 0, 0, List.of(), Instant.now());
    }
    return scanWishlists(List.of(w), 1);
  }

  private ScanResult scanWishlists(List<Wishlist> list, int scannedWishlists) {
    Set<String> productIds = new HashSet<>();
    for (Wishlist w : list) {
      for (Wishlist.WishlistItem item : w.getItems()) {
        if (item.getProductId() != null) productIds.add(item.getProductId());
      }
    }

    Map<String, ProductSnapshot> catalog = loadCatalog(productIds);
    List<PriceDropNotification> created = new ArrayList<>();
    int itemsScanned = 0;

    for (Wishlist w : list) {
      boolean dirty = false;
      for (Wishlist.WishlistItem item : w.getItems()) {
        ProductSnapshot product = catalog.get(item.getProductId());
        if (product == null || product.getPrice() <= 0) continue;
        itemsScanned++;

        double current = round(product.getPrice());
        double previous = round(item.getLastKnownPrice() != null
            ? item.getLastKnownPrice()
            : item.getPriceAtAdd());

        if (previous <= 0) {
          // No usable baseline yet: start tracking silently from the current catalog price.
          item.setLastKnownPrice(current);
          item.setLastCheckedAt(Instant.now());
          dirty = true;
          continue;
        }
        if (current < previous) {
          item.setLastKnownPrice(current);
          item.setLastCheckedAt(Instant.now());
          dirty = true;
          created.add(buildNotification(w.getUserId(), product, previous, current));
        } else if (current > previous) {
          // The price went up: move the baseline forward without notifying.
          item.setLastKnownPrice(current);
          item.setLastCheckedAt(Instant.now());
          dirty = true;
        } else if (item.getLastCheckedAt() == null) {
          item.setLastCheckedAt(Instant.now());
          dirty = true;
        }
      }
      if (dirty) {
        w.setUpdatedAt(Instant.now());
        wishlists.save(w);
      }
    }

    // Persist notifications before attempting delivery so the in-app record always exists.
    List<PriceDropNotification> saved = new ArrayList<>();
    for (PriceDropNotification n : created) {
      try {
        saved.add(notifications.save(n));
      } catch (Exception e) {
        log.warn("Could not store price-drop notification for user {} product {}: {}",
            n.getUserId(), n.getProductId(), e.getMessage());
      }
    }
    for (PriceDropNotification n : saved) {
      UserSnapshot user = mongo.findById(n.getUserId(), UserSnapshot.class);
      n.setEmailStatus(emailService.sendPriceDrop(user, n));
      try {
        notifications.save(n);
      } catch (Exception e) {
        log.warn("Could not update email status for notification {}: {}", n.getId(), e.getMessage());
      }
    }

    return new ScanResult(scannedWishlists, itemsScanned, saved.size(), saved, Instant.now());
  }

  private Map<String, ProductSnapshot> loadCatalog(Set<String> productIds) {
    if (productIds.isEmpty()) return Collections.emptyMap();
    Query query = Query.query(Criteria.where("_id").in(productIds));
    Map<String, ProductSnapshot> byId = new HashMap<>();
    for (ProductSnapshot p : mongo.find(query, ProductSnapshot.class)) {
      byId.put(p.getId(), p);
    }
    return byId;
  }

  private PriceDropNotification buildNotification(String userId, ProductSnapshot product,
                                                  double previous, double current) {
    double savings = round(previous - current);
    PriceDropNotification n = new PriceDropNotification();
    n.setId("NTC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    n.setUserId(userId);
    n.setProductId(product.getId());
    n.setProductName(product.getName());
    n.setPreviousPrice(previous);
    n.setCurrentPrice(current);
    n.setSavings(savings);
    n.setSavingsPercent(previous > 0 ? (int) Math.round((savings / previous) * 100) : 0);
    n.setRead(false);
    n.setCreatedAt(Instant.now());
    n.setEmailStatus("PENDING");
    return n;
  }

  private double round(double value) {
    return Math.round(value * 100.0) / 100.0;
  }

  public record ScanResult(
      int wishlistsScanned,
      int itemsScanned,
      int notificationsCreated,
      List<PriceDropNotification> notifications,
      Instant scannedAt) {}
}
