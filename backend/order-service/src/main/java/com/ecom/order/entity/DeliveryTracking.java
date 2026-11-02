package com.ecom.order.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class DeliveryTracking {

  private String trackingNumber;
  private String carrier;
  private String deliveryPersonName;
  private String deliveryPersonPhone;
  private String deliveryPersonPhoneMasked;
  private String vehicleNumber;
  private double courierRating = 4.9;
  private String deliveryOtp; // 4-digit code for verified handover
  private Location destination;
  private Location warehouse;
  private Location courierLocation;
  private List<Location> routeWaypoints = new ArrayList<>();
  private String estimatedArrival;
  private int estimatedMinutes;
  private double distanceKm;
  private List<StatusUpdate> updates = new ArrayList<>();
  private boolean demoMode = true;
  private boolean privacyProtected = true;

  public DeliveryTracking() {}

  public String getTrackingNumber() { return trackingNumber; }
  public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

  public String getCarrier() { return carrier; }
  public void setCarrier(String carrier) { this.carrier = carrier; }

  public String getDeliveryPersonName() { return deliveryPersonName; }
  public void setDeliveryPersonName(String deliveryPersonName) { this.deliveryPersonName = deliveryPersonName; }

  public String getDeliveryPersonPhone() { return deliveryPersonPhone; }
  public void setDeliveryPersonPhone(String deliveryPersonPhone) { this.deliveryPersonPhone = deliveryPersonPhone; }

  public String getDeliveryPersonPhoneMasked() { return deliveryPersonPhoneMasked; }
  public void setDeliveryPersonPhoneMasked(String deliveryPersonPhoneMasked) { this.deliveryPersonPhoneMasked = deliveryPersonPhoneMasked; }

  public String getVehicleNumber() { return vehicleNumber; }
  public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

  public double getCourierRating() { return courierRating; }
  public void setCourierRating(double courierRating) { this.courierRating = courierRating; }

  public String getDeliveryOtp() { return deliveryOtp; }
  public void setDeliveryOtp(String deliveryOtp) { this.deliveryOtp = deliveryOtp; }

  public Location getDestination() { return destination; }
  public void setDestination(Location destination) { this.destination = destination; }

  public Location getWarehouse() { return warehouse; }
  public void setWarehouse(Location warehouse) { this.warehouse = warehouse; }

  public Location getCourierLocation() { return courierLocation; }
  public void setCourierLocation(Location courierLocation) { this.courierLocation = courierLocation; }

  public List<Location> getRouteWaypoints() { return routeWaypoints; }
  public void setRouteWaypoints(List<Location> routeWaypoints) { this.routeWaypoints = routeWaypoints; }

  public String getEstimatedArrival() { return estimatedArrival; }
  public void setEstimatedArrival(String estimatedArrival) { this.estimatedArrival = estimatedArrival; }

  public int getEstimatedMinutes() { return estimatedMinutes; }
  public void setEstimatedMinutes(int estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

  public double getDistanceKm() { return distanceKm; }
  public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

  public List<StatusUpdate> getUpdates() { return updates; }
  public void setUpdates(List<StatusUpdate> updates) { this.updates = updates; }

  public boolean isDemoMode() { return demoMode; }
  public void setDemoMode(boolean demoMode) { this.demoMode = demoMode; }

  public boolean isPrivacyProtected() { return privacyProtected; }
  public void setPrivacyProtected(boolean privacyProtected) { this.privacyProtected = privacyProtected; }

  public static class Location {
    private double lat;
    private double lng;
    private double heading;
    private String name;
    private String formattedAddress;
    private String privacyMaskedAddress;
    private Instant updatedAt = Instant.now();

    public Location() {}
    public Location(double lat, double lng, String name) {
      this.lat = lat;
      this.lng = lng;
      this.name = name;
    }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public double getHeading() { return heading; }
    public void setHeading(double heading) { this.heading = heading; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFormattedAddress() { return formattedAddress; }
    public void setFormattedAddress(String formattedAddress) { this.formattedAddress = formattedAddress; }

    public String getPrivacyMaskedAddress() { return privacyMaskedAddress; }
    public void setPrivacyMaskedAddress(String privacyMaskedAddress) { this.privacyMaskedAddress = privacyMaskedAddress; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
  }

  public static class StatusUpdate {
    private String status;      // PLACED | CONFIRMED | PACKED | SHIPPED | OUT_FOR_DELIVERY | DELIVERED
    private String title;
    private String description;
    private String location;
    private Instant timestamp;

    public StatusUpdate() {}
    public StatusUpdate(String status, String title, String description, String location, Instant timestamp) {
      this.status = status;
      this.title = title;
      this.description = description;
      this.location = location;
      this.timestamp = timestamp;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
  }
}
