package com.ecom.reward.config;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Two-track return policy:
 * <ul>
 *   <li>age ≤ fullRefundWindowDays → FULL_REFUND (full money back after inspection).</li>
 *   <li>fullRefundWindowDays &lt; age ≤ rewardWindowDays → REWARD_POINTS (condition multipliers).</li>
 *   <li>age &gt; rewardWindowDays → rejected.</li>
 * </ul>
 */
@Configuration
@ConfigurationProperties(prefix = "reward")
public class RewardProperties {

  private double pointRate = 1;
  /** Legacy alias — kept in sync with fullRefundWindowDays. */
  private int returnWindowDays = 14;
  private int fullRefundWindowDays = 14;
  private int rewardWindowDays = 90;
  private Map<String, Double> multipliers = new LinkedHashMap<>(Map.of(
      "LIKE_NEW", 0.8, "GOOD", 0.6, "FAIR", 0.4, "POOR", 0.1, "NOT_ELIGIBLE", 0.0));

  public double getPointRate() { return pointRate; }
  public void setPointRate(double pointRate) { this.pointRate = pointRate; }
  public int getReturnWindowDays() { return returnWindowDays; }
  public void setReturnWindowDays(int returnWindowDays) {
    this.returnWindowDays = returnWindowDays;
    this.fullRefundWindowDays = returnWindowDays;
  }
  public int getFullRefundWindowDays() { return fullRefundWindowDays; }
  public void setFullRefundWindowDays(int fullRefundWindowDays) {
    this.fullRefundWindowDays = fullRefundWindowDays;
    this.returnWindowDays = fullRefundWindowDays;
  }
  public int getRewardWindowDays() { return rewardWindowDays; }
  public void setRewardWindowDays(int rewardWindowDays) { this.rewardWindowDays = rewardWindowDays; }
  public Map<String, Double> getMultipliers() { return multipliers; }
  public void setMultipliers(Map<String, Double> multipliers) { this.multipliers = multipliers; }
}
