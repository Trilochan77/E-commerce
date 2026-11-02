package com.ecom.wishlist.service;

import com.ecom.wishlist.entity.Notification;
import com.ecom.wishlist.entity.ProductSnapshot;
import com.ecom.wishlist.entity.UserSnapshot;
import com.ecom.wishlist.entity.Wishlist;
import com.ecom.wishlist.repository.NotificationRepository;
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
  private final NotificationRepository notifications;
  private final MongoTemplate mongo;
  private final NotificationEmailService emailService;

  @Value("${ecom.notifications.scan.enabled:true}")
  private boolean scanEnabled;

  public PriceTrackerService(WishlistRepository wishlists,
                             NotificationRepository notifications,
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
      scanAll();
    } catch (Exception e) {
      log.warn("Price tracker scan failed: {}", e.getMessage());
    }
  }

  /** Run a scan for every user with at least one wishlisted product. */
  public ScanResult scanAll() {
    List<Wishlist> all = wishlists.findAll();
    return executeScan(all);
  }

  /** Run a scan for a single user (called on demand by the UI). */
  public ScanResult scanUser(String userId) {
    List<Wishlist> list = wishlists.findByUserId(userId)
        .map(List::of)
        .orElseGet(Collections::emptyList);
    return executeScan(list);
  }

  private ScanResult executeScan(List<Wishlist> list) {
    int scannedWishlists = list.size();
    if (list.isEmpty()) {
      return new ScanResult(0, 0, 0, Collections.emptyList(), Instant.now());
    }

    Set<String> productIds = new HashSet<>();
    for (Wishlist w : list) {
      if (w.getItems() == null) continue;
      for (Wishlist.WishlistItem it : w.getItems()) {
        if (it.getProductId() != null) productIds.add(it.getProductId());
      }
    }

    Map<String, ProductSnapshot> catalog = loadCatalog(productIds);
    List<Notification> created = new ArrayList<>();
    int itemsScanned = 0;

    for (Wishlist w : list) {
      if (w.getItems() == null || w.getItems().isEmpty()) continue;
      boolean dirty = false;
      for (Wishlist.WishlistItem item : w.getItems()) {
        itemsScanned++;
        ProductSnapshot product = catalog.get(item.getProductId());
        if (product == null) continue;

        double previous = item.getLastKnownPrice() != null && item.getLastKnownPrice() > 0 ? item.getLastKnownPrice() : item.getPriceAtAdd();
        double current = product.getPrice();

        if (previous <= 0) {
          // Initialize baseline on first scan if not present.
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
    List<Notification> saved = new ArrayList<>();
    for (Notification n : created) {
      try {
        saved.add(notifications.save(n));
      } catch (Exception e) {
        log.warn("Could not store price-drop notification for user {} product {}: {}",
            n.getUserId(), n.getProductId(), e.getMessage());
      }
    }
    for (Notification n : saved) {
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

  private Notification buildNotification(String userId, ProductSnapshot product,
                                         double previous, double current) {
    double savings = round(previous - current);
    int savingsPct = previous > 0 ? (int) Math.round((savings / previous) * 100) : 0;

    Notification n = new Notification();
    n.setId("NTF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    n.setUserId(userId);
    n.setType("PRICE_DROP");
    n.setCategory("PRICE_DROPS");
    n.setTitle("Price Drop: " + product.getName());
    n.setMessage("Great news! " + product.getName() + " dropped to ₹" + Math.round(current) + " (Save ₹" + Math.round(savings) + " / " + savingsPct + "% OFF).");
    n.setLink("/products/" + product.getId());
    n.setIcon("📉");
    n.setProductId(product.getId());
    n.setProductName(product.getName());
    n.setPreviousPrice(previous);
    n.setCurrentPrice(current);
    n.setSavings(savings);
    n.setSavingsPercent(savingsPct);
    n.setRead(false);
    n.setCreatedAt(Instant.now());
    n.setEmailStatus("PENDING");
    n.setMetadata(Map.of("productId", product.getId(), "savings", savings));
    return n;
  }

  private double round(double value) {
    return Math.round(value * 100.0) / 100.0;
  }

  public record ScanResult(
      int wishlistsScanned,
      int itemsScanned,
      int notificationsCreated,
      List<Notification> notifications,
      Instant scannedAt) {}
}
