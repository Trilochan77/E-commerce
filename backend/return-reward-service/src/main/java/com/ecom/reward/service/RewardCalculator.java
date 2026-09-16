package com.ecom.reward.service;

import com.ecom.reward.config.RewardProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Estimated vs final reward (SRS 3.1.14, 3.1.16):
 *   estimated = floor(price x qty x multiplier(claimed) x pointRate)
 *   final     = floor(price x qty x multiplier(verified) x pointRate)
 */
@Service
public class RewardCalculator {

  private final RewardProperties props;

  public RewardCalculator(RewardProperties props) {
    this.props = props;
  }

  public double multiplier(String condition) {
    Double m = props.getMultipliers().get(condition);
    if (m == null) throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
        "Unknown condition: " + condition + " (expected LIKE_NEW, GOOD, FAIR, POOR"
            + (condition != null && condition.equals("NOT_ELIGIBLE") ? "" : ", NOT_ELIGIBLE for admin evaluation") + ")");
    return m;
  }

  public boolean isClaimable(String condition) {
    return condition.equals("LIKE_NEW") || condition.equals("GOOD")
        || condition.equals("FAIR") || condition.equals("POOR");
  }

  public boolean isVerifiable(String condition) {
    return isClaimable(condition) || condition.equals("NOT_ELIGIBLE");
  }

  public int estimate(double price, int qty, String claimedCondition) {
    if (!isClaimable(claimedCondition)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Claimed condition must be LIKE_NEW, GOOD, FAIR or POOR");
    }
    return (int) Math.floor(price * qty * multiplier(claimedCondition) * props.getPointRate());
  }

  public int finalReward(double price, int qty, String verifiedCondition) {
    if (!isVerifiable(verifiedCondition)) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
          "Verified condition must be LIKE_NEW, GOOD, FAIR, POOR or NOT_ELIGIBLE");
    }
    return (int) Math.floor(price * qty * multiplier(verifiedCondition) * props.getPointRate());
  }
}
