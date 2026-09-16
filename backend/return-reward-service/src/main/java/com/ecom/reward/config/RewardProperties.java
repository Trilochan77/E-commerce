package com.ecom.reward.config;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/** Binds the `reward.*` block from application.yml (tunables per IMPLEMENTATION.md). */
@Configuration
@ConfigurationProperties(prefix = "reward")
public class RewardProperties {

  private double pointRate = 1;
  private int returnWindowDays = 14;
  private Map<String, Double> multipliers = new LinkedHashMap<>(Map.of(
      "LIKE_NEW", 0.8, "GOOD", 0.6, "FAIR", 0.4, "POOR", 0.1, "NOT_ELIGIBLE", 0.0));

  public double getPointRate() { return pointRate; }
  public void setPointRate(double pointRate) { this.pointRate = pointRate; }
  public int getReturnWindowDays() { return returnWindowDays; }
  public void setReturnWindowDays(int returnWindowDays) { this.returnWindowDays = returnWindowDays; }
  public Map<String, Double> getMultipliers() { return multipliers; }
  public void setMultipliers(Map<String, Double> multipliers) { this.multipliers = multipliers; }
}
