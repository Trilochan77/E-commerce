package com.ecom.reward.config;

import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Prize table for the Spin & Win wheel. The server owns the outcome — the
 * browser only receives the winning segment index after the spin is recorded.
 */
@Configuration
@ConfigurationProperties(prefix = "spin")
public class SpinProperties {

  private String zone = "Asia/Kolkata";
  private int couponValidityDays = 7;
  private int reservationMinutes = 15;
  private List<Prize> prizes = new ArrayList<>();

  public SpinProperties() {
    // Sensible defaults so the wheel still works without external configuration.
    prizes = new ArrayList<>(List.of(
        coupon(0, "DISC5", "5% OFF", "5%", "\uD83C\uDFF7\uFE0F", 22, "PERCENT", 5, 200, 499, 500, 7, "#7c3aed"),
        points(1, "PTS50", "50 PTS", "50", "\u2728", 16, 50, "#0ea5e9"),
        coupon(2, "DISC10", "10% OFF", "10%", "\uD83C\uDF81", 20, "PERCENT", 10, 500, 799, 300, 7, "#db2777"),
        coupon(3, "FLAT100", "\u20B9100 OFF", "\u20B9100", "\uD83D\uDCB8", 14, "FLAT", 100, 0, 499, 300, 7, "#f59e0b"),
        none(4, "TRY", "TRY AGAIN", "TRY", "\uD83C\uDFB2", 10, "#334155"),
        coupon(5, "DISC15", "15% OFF", "15%", "\uD83D\uDC8E", 7, "PERCENT", 15, 750, 999, 150, 5, "#059669"),
        points(6, "PTS100", "100 PTS", "100", "\u2B50", 6, 100, "#06b6d4"),
        coupon(7, "DISC20", "20% OFF", "20%", "\uD83D\uDC51", 5, "PERCENT", 20, 1000, 1499, 75, 3, "#e11d48")
    ));
  }

  private static Prize coupon(int index, String key, String label, String shortLabel, String emoji,
      int weight, String couponType, double value, double maxDiscount, double minOrderValue,
      int maxUses, int validityDays, String color) {
    Prize p = base(index, key, label, shortLabel, emoji, weight, "COUPON", color);
    p.setCouponType(couponType);
    p.setValue(value);
    p.setMaxDiscount(maxDiscount);
    p.setMinOrderValue(minOrderValue);
    p.setMaxUses(maxUses);
    p.setValidityDays(validityDays);
    p.setPerUserLimit(1);
    return p;
  }

  private static Prize points(int index, String key, String label, String shortLabel, String emoji,
      int weight, int points, String color) {
    Prize p = base(index, key, label, shortLabel, emoji, weight, "POINTS", color);
    p.setPoints(points);
    return p;
  }

  private static Prize none(int index, String key, String label, String shortLabel, String emoji,
      int weight, String color) {
    return base(index, key, label, shortLabel, emoji, weight, "NONE", color);
  }

  private static Prize base(int index, String key, String label, String shortLabel, String emoji,
      int weight, String type, String color) {
    Prize p = new Prize();
    p.setIndex(index);
    p.setKey(key);
    p.setLabel(label);
    p.setShortLabel(shortLabel);
    p.setEmoji(emoji);
    p.setWeight(weight);
    p.setType(type);
    p.setColor(color);
    return p;
  }

  public int totalWeight() {
    return prizes.stream().mapToInt(Prize::getWeight).sum();
  }

  public String getZone() { return zone; }
  public void setZone(String zone) { this.zone = zone; }
  public int getCouponValidityDays() { return couponValidityDays; }
  public void setCouponValidityDays(int couponValidityDays) { this.couponValidityDays = couponValidityDays; }
  public int getReservationMinutes() { return reservationMinutes; }
  public void setReservationMinutes(int reservationMinutes) { this.reservationMinutes = reservationMinutes; }
  public List<Prize> getPrizes() { return prizes; }
  public void setPrizes(List<Prize> prizes) { this.prizes = prizes; }

  public static class Prize {
    private int index;
    private String key;
    private String label;
    private String shortLabel;
    private String emoji;
    private int weight;
    private String type;          // COUPON | POINTS | NONE
    private String couponType;    // PERCENT | FLAT
    private double value;
    private double maxDiscount;
    private double minOrderValue;
    private int maxUses;
    private int perUserLimit;
    private int validityDays;
    private int points;
    private String color;

    public int getIndex() { return index; }
    public void setIndex(int index) { this.index = index; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getShortLabel() { return shortLabel; }
    public void setShortLabel(String shortLabel) { this.shortLabel = shortLabel; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCouponType() { return couponType; }
    public void setCouponType(String couponType) { this.couponType = couponType; }
    public double getValue() { return value; }
    public void setValue(double value) { this.value = value; }
    public double getMaxDiscount() { return maxDiscount; }
    public void setMaxDiscount(double maxDiscount) { this.maxDiscount = maxDiscount; }
    public double getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(double minOrderValue) { this.minOrderValue = minOrderValue; }
    public int getMaxUses() { return maxUses; }
    public void setMaxUses(int maxUses) { this.maxUses = maxUses; }
    public int getPerUserLimit() { return perUserLimit; }
    public void setPerUserLimit(int perUserLimit) { this.perUserLimit = perUserLimit; }
    public int getValidityDays() { return validityDays; }
    public void setValidityDays(int validityDays) { this.validityDays = validityDays; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
  }
}
