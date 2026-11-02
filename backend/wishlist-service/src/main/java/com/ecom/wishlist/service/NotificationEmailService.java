package com.ecom.wishlist.service;

import com.ecom.wishlist.entity.PriceDropNotification;
import com.ecom.wishlist.entity.UserSnapshot;
import jakarta.mail.internet.MimeMessage;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Optional price-drop email delivery.
 *
 * <p>Email is only attempted when explicitly enabled and SMTP credentials are present.
 * The returned status is stored on the notification so the UI can state exactly what
 * happened instead of claiming delivery that never occurred.
 */
@Service
public class NotificationEmailService {
  private static final Logger log = LoggerFactory.getLogger(NotificationEmailService.class);

  private final ObjectProvider<JavaMailSender> mailSenderProvider;

  @Value("${ecom.notifications.email.enabled:false}")
  private boolean enabled;

  @Value("${ecom.notifications.email.from:}")
  private String from;

  @Value("${ecom.notifications.email.shop-url:http://localhost:4200}")
  private String shopUrl;

  @Value("${spring.mail.host:}")
  private String smtpHost;

  @Value("${spring.mail.username:}")
  private String smtpUsername;

  @Value("${spring.mail.password:}")
  private String smtpPassword;

  public NotificationEmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
    this.mailSenderProvider = mailSenderProvider;
  }

  public String sendPriceDrop(UserSnapshot user, PriceDropNotification n) {
    if (!enabled) return "DISABLED";
    if (user == null || !StringUtils.hasText(user.getEmail())) return "NOT_CONFIGURED";
    if (!StringUtils.hasText(smtpHost)
        || !StringUtils.hasText(smtpUsername)
        || !StringUtils.hasText(smtpPassword)) {
      return "NOT_CONFIGURED";
    }
    JavaMailSender sender = mailSenderProvider.getIfAvailable();
    if (sender == null) return "NOT_CONFIGURED";

    String senderAddress = StringUtils.hasText(from) ? from : smtpUsername;
    String name = StringUtils.hasText(user.getName()) ? user.getName() : "there";
    String product = StringUtils.hasText(n.getProductName()) ? n.getProductName() : n.getProductId();
    String body = "Hi " + name + ",\n\n"
        + "A product on your wishlist just got cheaper.\n\n"
        + "Product: " + product + "\n"
        + "Previous price: Rs. " + money(n.getPreviousPrice()) + "\n"
        + "Current price:  Rs. " + money(n.getCurrentPrice()) + "\n"
        + "You save:       Rs. " + money(n.getSavings()) + " (" + n.getSavingsPercent() + "%)\n\n"
        + "View your alerts: " + shopUrl + "/notifications\n\n"
        + "— NextGen Shop";

    try {
      MimeMessage message = sender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
      helper.setFrom(senderAddress);
      helper.setTo(user.getEmail());
      helper.setSubject("Price drop: " + product + " is now cheaper");
      helper.setText(body, false);
      sender.send(message);
      return "SENT";
    } catch (Exception e) {
      log.warn("Price-drop email failed for user {} product {}: {}", n.getUserId(), n.getProductId(), e.getMessage());
      return "FAILED";
    }
  }

  private String money(double value) {
    return String.format(Locale.US, "%.2f", value);
  }
}
