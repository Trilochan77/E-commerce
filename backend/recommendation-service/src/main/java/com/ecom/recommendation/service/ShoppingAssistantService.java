package com.ecom.recommendation.service;

import com.ecom.recommendation.dto.AssistantRequest;
import com.ecom.recommendation.dto.AssistantResponse;
import com.ecom.recommendation.entity.CategoryDoc;
import com.ecom.recommendation.entity.ProductDoc;
import com.ecom.recommendation.repository.CategoryDocRepository;
import com.ecom.recommendation.repository.ProductDocRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Rule-based, retrieval-grounded shopping assistant.
 *
 * <p>No machine learning and no external LLM. The assistant:
 * <ol>
 *   <li>parses the request with deterministic rules (budget, category, intent, product names),</li>
 *   <li>retrieves candidates from the same live {@code products} collection the store uses,</li>
 *   <li>scores them with a transparent weighted formula, and</li>
 *   <li>builds the answer only from stored fields (name, description, price, stock, rating).</li>
 * </ol>
 *
 * <p>If the catalog has no exact match the answer says so and offers the closest in-stock
 * alternatives instead of inventing a product.
 */
@Service
public class ShoppingAssistantService {

  private static final Set<String> STOP = new HashSet<>(List.of(
      "a", "an", "the", "for", "to", "of", "in", "on", "at", "with", "and", "or", "is", "are",
      "was", "were", "be", "been", "do", "does", "did", "can", "could", "should", "would", "will",
      "i", "me", "my", "we", "our", "you", "your", "it", "its", "this", "that", "these", "those",
      "please", "show", "find", "give", "want", "need", "buy", "get", "have", "has", "about",
      "tell", "which", "what", "whats", "how", "why", "best", "good", "great", "suggest",
      "suggestion", "suggestions", "recommend", "recommendation", "recommendations", "product",
      "products", "item", "items", "under", "below", "less", "than", "upto", "up", "within",
      "budget", "max", "maximum", "around", "near", "between", "from", "vs", "versus", "compare",
      "comparison", "difference", "price", "cost", "cheap", "cheapest", "available", "availability",
      "stock", "buy", "purchase", "shop", "shopping", "looking", "look", "something", "anything",
      "some", "any", "all", "also", "more", "most", "new", "latest", "option", "options",
      "instead", "similar", "alternative", "alternatives", "details", "detail", "feature",
      "features", "spec", "specs", "specification", "specifications", "offer", "offers", "deal",
      "deals", "worth", "okay", "ok", "if", "so", "then", "there", "here", "than", "as", "by",
      "out", "not", "no", "yes", "hi", "hello", "hey", "thanks", "thank", "rupees", "rs", "inr",
      "rupee", "only", "just", "very", "much", "many", "much", "need", "needed",
      "life", "time", "quality", "provide", "provides", "come", "comes", "support", "supports",
      "include", "includes", "included"));

  /** Category ids are stable seed ids; synonyms let "phone", "mobile" and "smartphone" all work. */
  private static final Map<String, List<String>> CATEGORY_SYNONYMS = new LinkedHashMap<>();

  static {
    CATEGORY_SYNONYMS.put("C-01", List.of(
        "electronics", "electronic", "gadget", "gadgets", "laptop", "laptops", "notebook computer",
        "phone", "phones", "smartphone", "smartphones", "mobile", "mobiles", "cellphone",
        "headphone", "headphones", "earphone", "earphones", "earbud", "earbuds", "headset",
        "speaker", "speakers", "smartwatch", "smartwatches", "watch", "watches", "tablet",
        "tablets", "keyboard", "keyboards", "drone", "drones", "camera", "cameras", "charger",
        "chargers", "electronics item", "tech", "device", "devices"));
    CATEGORY_SYNONYMS.put("C-02", List.of(
        "fashion", "clothing", "clothes", "apparel", "wear", "shoe", "shoes", "sneaker", "sneakers",
        "footwear", "jacket", "jackets", "handbag", "handbags", "bag", "bags", "sunglass",
        "sunglasses", "kurta", "kurtas", "wallet", "wallets", "backpack", "backpacks", "denim",
        "tote", "accessory", "accessories"));
    CATEGORY_SYNONYMS.put("C-03", List.of(
        "home", "kitchen", "home & kitchen", "home and kitchen", "cookware", "cooking", "air fryer",
        "fryer", "bedsheet", "bed sheet", "lamp", "lamps", "light", "lighting", "mixer", "grinder",
        "mixer grinder", "dinner set", "dinnerware", "heater", "appliance", "appliances",
        "utensil", "utensils", "furnishing"));
    CATEGORY_SYNONYMS.put("C-04", List.of(
        "book", "books", "novel", "novels", "guide", "guides", "paperback", "reading", "education",
        "study", "exam", "exam prep", "reference", "cookbook", "story", "stories", "stationery",
        "notebook", "notebooks"));
    CATEGORY_SYNONYMS.put("C-05", List.of(
        "sports", "sport", "fitness", "gym", "workout", "yoga", "dumbbell", "dumbbells", "cricket",
        "bat", "football", "bottle", "water bottle", "skipping rope", "rope", "badminton",
        "exercise", "training", "outdoor", "game", "games"));
  }

  /** Cue -> words to boost in the product text. Keeps "for an MCA student" meaningful. */
  private static final Map<String, List<String>> USE_CASE_TERMS = new LinkedHashMap<>();

  static {
    USE_CASE_TERMS.put("mca", List.of("laptop", "tablet", "keyboard", "ram", "ssd", "java",
        "programming", "guide", "notebook"));
    USE_CASE_TERMS.put("bca", List.of("laptop", "tablet", "keyboard", "ram", "ssd", "java",
        "programming", "guide", "notebook"));
    USE_CASE_TERMS.put("student", List.of("laptop", "tablet", "keyboard", "ram", "ssd", "guide",
        "notebook", "book", "headphones", "backpack"));
    USE_CASE_TERMS.put("college", List.of("laptop", "tablet", "keyboard", "ram", "ssd", "guide",
        "notebook", "book", "backpack"));
    USE_CASE_TERMS.put("coding", List.of("laptop", "ram", "ssd", "keyboard", "java", "programming"));
    USE_CASE_TERMS.put("programming", List.of("laptop", "ram", "ssd", "keyboard", "java"));
    USE_CASE_TERMS.put("gaming", List.of("laptop", "keyboard", "headphones", "speaker", "ram"));
    USE_CASE_TERMS.put("music", List.of("headphones", "speaker", "earbuds", "bluetooth", "battery"));
    USE_CASE_TERMS.put("gym", List.of("dumbbell", "yoga", "rope", "bottle", "shoes", "fitness"));
    USE_CASE_TERMS.put("fitness", List.of("dumbbell", "yoga", "rope", "bottle", "shoes"));
    USE_CASE_TERMS.put("running", List.of("shoes", "rope", "bottle", "lightweight"));
    USE_CASE_TERMS.put("travel", List.of("backpack", "bottle", "shoes", "headphones", "lightweight"));
    USE_CASE_TERMS.put("trip", List.of("backpack", "bottle", "shoes", "headphones"));
    USE_CASE_TERMS.put("photography", List.of("drone", "camera", "phone", "4k", "gimbal"));
    USE_CASE_TERMS.put("cooking", List.of("air fryer", "cookware", "mixer", "grinder", "cookbook",
        "dinner"));
    USE_CASE_TERMS.put("gift", List.of("watch", "headphones", "book", "wallet", "speaker"));
    USE_CASE_TERMS.put("study", List.of("guide", "book", "notebook", "lamp", "tablet"));
  }

  private static final Pattern BETWEEN = Pattern.compile(
      "(?:between|from)\\s*₹?\\s*([0-9][0-9,.]*)\\s*(k|lakh|lac|l)?\\s*(?:and|to|-|–)\\s*₹?\\s*([0-9][0-9,.]*)\\s*(k|lakh|lac|l)?");
  private static final Pattern MAX = Pattern.compile(
      "(?:under|below|less than|upto|up to|within|max(?:imum)?(?: of| is)?|budget(?: of| is)?|around|about|near)\\s*₹?\\s*([0-9][0-9,.]*)\\s*(k|lakh|lac|l)?");
  private static final Pattern CURRENCY = Pattern.compile(
      "₹\\s*([0-9][0-9,.]*)\\s*(k|lakh|lac|l)?");
  private static final Pattern AMOUNT_SUFFIX = Pattern.compile(
      "([0-9][0-9,.]*)\\s*(k|lakh|lac|l)?\\s*(?:budget|max|maximum|or less|or below|rupees|rs)");

  private static final Pattern POLICY_WORDS = Pattern.compile(
      "\\b(delivery|shipping|ship|refund|refunds|return policy|returns policy|cancel|cancellation|payment|pay|payments|cod|cash on delivery|upi|card|cards|emi|wallet|reward|rewards|points|warranty|guarantee|track|tracking|order status|invoice|gst|exchange)\\b");

  private final ProductDocRepository products;
  private final CategoryDocRepository categories;
  private final RecommendationService recommendations;

  @Value("${assistant.max-results:4}")
  private int maxResults;

  public ShoppingAssistantService(ProductDocRepository products, CategoryDocRepository categories,
      RecommendationService recommendations) {
    this.products = products;
    this.categories = categories;
    this.recommendations = recommendations;
  }

  // ------------------------------------------------------------------ entry point

  public AssistantResponse chat(AssistantRequest req) {
    String message = req.message().trim();
    String norm = normalize(message);
    List<ProductDoc> all = products.findAll();
    Map<String, String> categoryNames = categoryNames();
    Parsed parsed = parse(norm, all, req.contextIds());

    if (isGreeting(norm)) {
      return greeting();
    }
    if (parsed.refs.isEmpty() && POLICY_WORDS.matcher(norm).find()) {
      return policy(norm, all, categoryNames);
    }
    if (parsed.wantsCompare) {
      return compare(parsed, all, categoryNames, req.contextIds());
    }
    if (!parsed.refs.isEmpty()) {
      return productAnswer(parsed, all, categoryNames);
    }
    if (parsed.wantsHistory && req.userId() != null && !req.userId().isBlank()) {
      return historyAnswer(req.userId(), all, categoryNames);
    }
    return search(parsed, all, categoryNames);
  }

  // ------------------------------------------------------------------ parsing

  private static final class Parsed {
    final Set<String> categoryIds = new LinkedHashSet<>();
    final List<String> tokens = new ArrayList<>();
    final List<ProductDoc> refs = new ArrayList<>();
    Double minPrice;
    Double maxPrice;
    String budgetText;
    boolean wantsCompare;
    boolean wantsHistory;
    boolean wantsAlternative;
    boolean asksAvailability;
  }

  private Parsed parse(String norm, List<ProductDoc> all, List<String> contextIds) {
    Parsed p = new Parsed();
    p.tokens.addAll(tokens(norm));
    p.categoryIds.addAll(detectCategories(norm));
    parseBudget(norm, p);
    p.wantsCompare = norm.matches(".*\\b(compare|comparison|vs|versus|difference between|better)\\b.*");
    p.wantsAlternative = norm.matches(".*\\b(alternative|alternatives|instead|similar|something else|other option|other options|swap)\\b.*");
    p.asksAvailability = norm.matches(".*\\b(out of stock|unavailable|not available|no stock|in stock|available)\\b.*");
    p.wantsHistory = norm.matches(".*(what should i (buy|get)|based on my|my history|for me\\b|personalised|personalized).*");

    List<ProductDoc> matched = matchProducts(norm, all);
    if (!matched.isEmpty()) {
      p.refs.addAll(matched.stream().limit(4).toList());
    } else if (contextIds != null && !contextIds.isEmpty()
        && norm.matches(".*\\b(them|these|those|both|it|this one|that one|first two|top two|compare)\\b.*")) {
      for (String id : contextIds) {
        if (id == null) continue;
        all.stream().filter(x -> id.equals(x.getId())).findFirst().ifPresent(p.refs::add);
      }
    }
    return p;
  }

  private void parseBudget(String norm, Parsed p) {
    Matcher between = BETWEEN.matcher(norm);
    if (between.find()) {
      Double lo = amount(between.group(1), between.group(2));
      Double hi = amount(between.group(3), between.group(4));
      if (lo != null && hi != null) {
        p.minPrice = Math.min(lo, hi);
        p.maxPrice = Math.max(lo, hi);
        p.budgetText = "between " + money(p.minPrice) + " and " + money(p.maxPrice);
        return;
      }
    }
    Matcher max = MAX.matcher(norm);
    if (max.find()) {
      Double hi = amount(max.group(1), max.group(2));
      if (hi != null) {
        p.maxPrice = hi;
        p.budgetText = "at or under " + money(hi);
        return;
      }
    }
    Matcher suffix = AMOUNT_SUFFIX.matcher(norm);
    if (suffix.find()) {
      Double hi = amount(suffix.group(1), suffix.group(2));
      if (hi != null) {
        p.maxPrice = hi;
        p.budgetText = "at or under " + money(hi);
        return;
      }
    }
    Matcher currency = CURRENCY.matcher(norm);
    if (currency.find()) {
      Double hi = amount(currency.group(1), currency.group(2));
      if (hi != null) {
        p.maxPrice = hi;
        p.budgetText = "at or under " + money(hi);
      }
    }
  }

  private Double amount(String raw, String unit) {
    try {
      double value = Double.parseDouble(raw.replace(",", ""));
      if (unit == null) return value;
      return switch (unit) {
        case "k" -> value * 1_000;
        case "lakh", "lac", "l" -> value * 100_000;
        default -> value;
      };
    } catch (NumberFormatException e) {
      return null;
    }
  }

  private Set<String> detectCategories(String norm) {
    Set<String> found = new LinkedHashSet<>();
    for (Map.Entry<String, List<String>> e : CATEGORY_SYNONYMS.entrySet()) {
      for (String syn : e.getValue()) {
        if (norm.contains(syn)) {
          found.add(e.getKey());
          break;
        }
      }
    }
    return found;
  }

  /** Product-name matcher: requires a strong share of the product's name words. */
  private List<ProductDoc> matchProducts(String norm, List<ProductDoc> all) {
    List<Map.Entry<ProductDoc, Integer>> scored = new ArrayList<>();
    for (ProductDoc p : all) {
      List<String> nameTokens = nameTokens(p.getName());
      if (nameTokens.isEmpty()) continue;
      int overlap = 0;
      for (String t : nameTokens) {
        if (norm.contains(t)) overlap++;
      }
      boolean strong = overlap >= 2
          || (overlap >= 1 && nameTokens.size() <= 2)
          || (p.getName() != null && norm.contains(p.getName().toLowerCase(Locale.ROOT)));
      if (strong) scored.add(Map.entry(p, overlap));
    }
    scored.sort(Comparator.comparingInt((Map.Entry<ProductDoc, Integer> e) -> e.getValue()).reversed());
    return scored.stream().map(Map.Entry::getKey).toList();
  }

  private List<String> nameTokens(String name) {
    if (name == null) return List.of();
    return Arrays.stream(name.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
        .filter(t -> t.length() >= 2)
        .filter(t -> !STOP.contains(t))
        .toList();
  }

  private List<String> tokens(String text) {    return Arrays.stream(text.split("[^a-z0-9]+"))
        .filter(t -> t.length() >= 2)
        .filter(t -> !STOP.contains(t))
        .filter(t -> !t.matches("[0-9]+"))
        .map(this::singular)
        .distinct()
        .toList();
  }

  /** Tiny stemming pass so "laptops" matches "laptop" and "students" matches "student". */
  private String singular(String t) {
    if (t.length() > 4 && t.endsWith("s") && !t.endsWith("ss")) return t.substring(0, t.length() - 1);
    return t;
  }

  /** True when {@code token} starts a word in the product name ("laptop" in "Laptop Ultra 14",
      "headphone" in "Wireless Headphones X1") but not "book" inside "Cookbook". */
  private boolean nameHasToken(ProductDoc p, String token) {
    if (p.getName() == null) return false;
    String name = p.getName().toLowerCase(Locale.ROOT);
    return Pattern.compile("(^|[^a-z0-9])" + Pattern.quote(token)).matcher(name).find();
  }

  private String normalize(String s) {
    return s == null ? "" : s.toLowerCase(Locale.ROOT)
        .replace('’', '\'')
        .replaceAll("\\s+", " ")
        .trim();
  }

  private boolean isGreeting(String norm) {
    return norm.matches("^(hi|hello|hey|namaste|good morning|good evening|help|what can you do|how can you help)[!. ]*$");
  }

  // ------------------------------------------------------------------ answers

  private AssistantResponse greeting() {
    String reply = """
        Hi! I'm the NextGen shopping assistant. I answer from the live product catalog — no made-up products, prices or ratings.

        I can help you:
        • find products by budget and requirement — "Suggest a laptop under ₹50,000 for MCA students"
        • compare two products side by side — "Compare Wireless Headphones X1 vs Bluetooth Speaker Boom"
        • check features, price, stock or ratings — "Is the Laptop Ultra 14 in stock?"
        • suggest alternatives when something is unavailable
        • recommend from your browsing and order history
        • explain delivery, returns, payments and reward points

        What are you shopping for?""";
    return new AssistantResponse(reply, "GREETING", List.of(), List.of(),
        List.of("Suggest a laptop under ₹50,000", "Show me in-stock headphones",
            "What is your return policy?"),
        true, "rules+retrieval");
  }

  private AssistantResponse policy(String norm, List<ProductDoc> all, Map<String, String> catNames) {
    String reply;
    if (norm.matches(".*\\b(delivery|shipping|ship)\\b.*")) {
      reply = """
          Delivery: orders above ₹999 ship free. For smaller orders any delivery charge is shown at checkout before you pay.
          Once an order is placed you can follow its status under Orders.""";
    } else if (norm.matches(".*\\b(refund|refunds|return policy|returns policy)\\b.*")) {
      reply = """
          Returns and refunds: eligible items can be returned within 7 days for a full refund. A product is eligible when its listing shows "Return eligible".
          After a return is approved the refund goes back to your original payment method, and reward points for that order are adjusted. You can raise and track a return under Returns.""";
    } else if (norm.matches(".*\\b(cod|cash on delivery)\\b.*")) {
      reply = "Yes — Cash on Delivery is supported. The order is marked successful once the delivery is confirmed.";
    } else if (norm.matches(".*\\b(upi|card|cards|payment|pay|payments|emi)\\b.*")) {
      reply = """
          Payments: Cash on Delivery, UPI and card are supported. On the UPI tab a scannable QR is generated for the exact order amount, and card payments use a sandbox flow.
          Card numbers and CVV are never stored by the store.""";
    } else if (norm.matches(".*\\b(wallet|reward|rewards|points)\\b.*")) {
      reply = """
          Reward wallet: points are credited when an eligible return is approved. 1 point = ₹1, and you can redeem up to 20% of an order value at checkout.
          Your balance and every EARNED/USED entry are listed under Wallet.""";
    } else if (norm.matches(".*\\b(warranty|guarantee)\\b.*")) {
      reply = "Product listings in this catalog do not carry warranty terms, so I can't confirm one. Everything the seller specified is in the product description on the detail page.";
    } else if (norm.matches(".*\\b(track|tracking|order status|invoice|gst)\\b.*")) {
      reply = "You can see live status, items and totals for every order under Orders. Invoices/GST details are not part of this catalog.";
    } else if (norm.matches(".*\\b(cancel|cancellation)\\b.*")) {
      reply = "Open Orders to see the actions available for a specific order. Cancellation eligibility depends on the order's current status.";
    } else if (norm.matches(".*\\b(exchange)\\b.*")) {
      reply = "This catalog offers returns for eligible items rather than exchanges. Start from Returns and the request status is tracked there.";
    } else {
      reply = "I can help with delivery, returns and refunds, payments (COD/UPI/card), reward points and order tracking. Ask about any of those, or tell me what you want to buy.";
    }
    return new AssistantResponse(reply, "POLICY", List.of(), List.of(),
        List.of("Suggest a laptop under ₹50,000", "Show me in-stock headphones",
            "How do reward points work?"),
        true, "rules+policy");
  }

  private AssistantResponse productAnswer(Parsed p, List<ProductDoc> all, Map<String, String> catNames) {
    ProductDoc product = p.refs.get(0);
    String name = product.getName() == null ? "This product" : product.getName();
    StringBuilder sb = new StringBuilder();
    sb.append(name).append(" — ").append(money(product.getPrice())).append('\n');
    sb.append("Category: ").append(catName(product.getCategoryId(), catNames)).append('\n');
    sb.append("Availability: ").append(stockLine(product)).append('\n');
    sb.append("Rating: ").append(ratingLine(product)).append('\n');
    sb.append("Return: ").append(product.isEligibleForReturn() ? "eligible within 7 days" : "not eligible").append('\n');
    List<String> asked = tokens(normOfMessage(p));
    if (product.getDescription() != null && !product.getDescription().isBlank()) {
      String desc = product.getDescription();
      // Quote the exact listing fragment that answers a feature question ("battery" -> "40h battery").
      List<String> matchedFragments = Arrays.stream(desc.split("[,;•\\n]"))
          .map(String::trim)
          .filter(f -> !f.isBlank())
          .filter(f -> asked.stream().anyMatch(t -> t.length() >= 3
              && f.toLowerCase(Locale.ROOT).contains(t)))
          .distinct()
          .toList();
      sb.append("Listing description: \"").append(desc).append('"');
      if (!matchedFragments.isEmpty()) {
        sb.append("\nFrom the listing: \"").append(String.join("\", \"", matchedFragments)).append('"');
      }
    }

    String hay = ((product.getName() == null ? "" : product.getName()) + " "
        + (product.getDescription() == null ? "" : product.getDescription())).toLowerCase(Locale.ROOT);
    List<String> unconfirmed = asked.stream()
        .filter(t -> t.length() >= 4)
        .filter(t -> !hay.contains(t))
        .filter(t -> !CATEGORY_SYNONYMS.values().stream().flatMap(List::stream).toList().contains(t))
        .limit(2)
        .toList();
    if (!unconfirmed.isEmpty()) {
      sb.append("\n\nThe listing doesn't mention ").append(String.join(" or ", unconfirmed))
          .append(", so I can't confirm that from the catalog. The description above is everything the seller provided.");
    }

    List<Map<String, Object>> cards = new ArrayList<>();
    List<String> followUps = new ArrayList<>();
    if (!product.isAvailability() || p.wantsAlternative) {
      List<ProductDoc> alts = alternativesTo(product, all).stream().limit(maxResults).toList();
      if (!alts.isEmpty()) {
        sb.append("\n\n").append(product.isAvailability()
            ? "If you want something else, these in-stock options are close:"
            : "It is currently out of stock. These in-stock alternatives are the closest match:");
        for (ProductDoc a : alts) {
          sb.append("\n• ").append(a.getName()).append(" — ").append(money(a.getPrice()))
              .append(" · ").append(stockLine(a));
          cards.add(card(a, catNames, reasonsFor(a, p, false)));
        }
        followUps.add("Compare " + name + " with " + alts.get(0).getName());
      } else {
        sb.append("\n\nNo close in-stock alternative is available right now.");
      }
    } else {
      cards.add(card(product, catNames, reasonsFor(product, p, true)));
    }
    followUps.add("Compare " + name + " with another product");
    followUps.add("Show me similar products");
    sb.append("\n\nFacts above are read live from the product catalog.");
    return new AssistantResponse(sb.toString(), "PRODUCT", cards, List.of(), followUps, true,
        "rules+retrieval");
  }

  /** The Parsed object does not keep the raw message; reconstruct a token string is enough for
      feature-term detection because refs already carry the product. */
  private String normOfMessage(Parsed p) {
    return String.join(" ", p.tokens);
  }

  private AssistantResponse compare(Parsed p, List<ProductDoc> all, Map<String, String> catNames,
      List<String> contextIds) {
    List<ProductDoc> picks = new ArrayList<>(p.refs);
    if (picks.size() < 2 && !p.categoryIds.isEmpty()) {
      for (String cid : p.categoryIds) {
        bestInCategory(cid, p, all).ifPresent(x -> {
          if (picks.stream().noneMatch(y -> y.getId().equals(x.getId()))) picks.add(x);
        });
      }
    }
    // e.g. "compare laptop vs tablet" — both words map to one category, so fall back to
    // the two highest-scoring in-stock products in that category.
    if (picks.size() < 2) {
      all.stream().filter(ProductDoc::isAvailability)
          .filter(x -> p.categoryIds.isEmpty() || p.categoryIds.contains(x.getCategoryId()))
          .filter(x -> picks.stream().noneMatch(y -> y.getId().equals(x.getId())))
          .sorted(Comparator.comparingDouble((ProductDoc x) -> -score(x, p)))
          .forEach(x -> {
            if (picks.size() < 2) picks.add(x);
          });
    }
    if (picks.size() < 2 && contextIds != null) {
      for (String id : contextIds) {
        all.stream().filter(x -> x.getId().equals(id)).findFirst()
            .ifPresent(x -> {
              if (picks.stream().noneMatch(y -> y.getId().equals(x.getId()))) picks.add(x);
            });
      }
    }
    if (picks.size() < 2) {
      List<ProductDoc> inStock = all.stream().filter(ProductDoc::isAvailability)
          .sorted(Comparator.comparingDouble(ProductDoc::getPrice)).limit(2).toList();
      List<Map<String, Object>> cards = inStock.stream()
          .map(x -> card(x, catNames, List.of("popular-in-catalog"))).toList();
      return new AssistantResponse(
          "Tell me which two products to compare, for example: \"Compare Wireless Headphones X1 vs Bluetooth Speaker Boom\". "
              + "Here are two in-stock products you could start with.",
          "COMPARE", cards, List.of(),
          List.of("Compare Wireless Headphones X1 vs Bluetooth Speaker Boom",
              "Compare Laptop Ultra 14 vs Tablet Tab A11 64GB"),
          true, "rules+retrieval");
    }

    List<ProductDoc> two = picks.stream().limit(2).toList();
    List<Map<String, Object>> comparison = two.stream().map(x -> compareRow(x, catNames)).toList();
    ProductDoc a = two.get(0);
    ProductDoc b = two.get(1);
    String cheaper = a.getPrice() == b.getPrice() ? null : (a.getPrice() < b.getPrice() ? a.getName() : b.getName());
    StringBuilder sb = new StringBuilder("Side-by-side comparison of the two listings:\n");
    sb.append("• ").append(a.getName()).append(" — ").append(money(a.getPrice())).append(" · ")
        .append(stockLine(a)).append(" · ").append(ratingLine(a)).append('\n');
    sb.append("• ").append(b.getName()).append(" — ").append(money(b.getPrice())).append(" · ")
        .append(stockLine(b)).append(" · ").append(ratingLine(b));
    if (cheaper != null) sb.append("\n\nCheaper option: ").append(cheaper).append('.');
    ProductDoc rated = bestRated(a, b);
    if (rated != null) {
      sb.append("\nBetter customer rating: ").append(rated.getName()).append(" (")
          .append(ratingLine(rated)).append(").");
    }
    sb.append("\n\nOnly the fields shown in the table are compared; I don't infer features that the listings don't state.");
    List<String> followUps = List.of(
        "Is " + a.getName() + " in stock?",
        "Which of these is return eligible?");
    return new AssistantResponse(sb.toString(), "COMPARE",
        two.stream().map(x -> card(x, catNames, List.of("compared"))).toList(),
        comparison, followUps, true, "rules+retrieval");
  }

  private AssistantResponse historyAnswer(String userId, List<ProductDoc> all,
      Map<String, String> catNames) {
    Map<String, Object> rec = recommendations.recommend(userId, Math.max(maxResults, 5), false);
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> items = (List<Map<String, Object>>) rec.get("items");
    boolean coldStart = Boolean.TRUE.equals(rec.get("coldStart"));
    List<ProductDoc> picks = new ArrayList<>();
    Map<String, List<String>> reasons = new HashMap<>();
    if (items != null) {
      for (Map<String, Object> item : items) {
        String id = String.valueOf(item.get("productId"));
        all.stream().filter(x -> id.equals(x.getId()) && x.isAvailability()).findFirst().ifPresent(x -> {
          picks.add(x);
          @SuppressWarnings("unchecked")
          List<String> r = (List<String>) item.get("reasons");
          reasons.put(x.getId(), r == null ? List.of() : r);
        });
      }
    }
    String reply;
    if (picks.isEmpty()) {
      reply = "I couldn't build a recommendation because there is no activity yet and the catalog has no in-stock products. Browse a few products first and ask me again.";
    } else if (coldStart) {
      reply = "You don't have browsing or purchase history yet, so here are the current in-stock products with the most paid orders (popularity rule, not a guess).";
    } else {
      reply = "Based on your recent views, searches and orders, these in-stock products score highest. The reason for each pick is shown on its card.";
    }
    StringBuilder sb = new StringBuilder(reply);
    for (ProductDoc p2 : picks) {
      sb.append('\n').append("• ").append(p2.getName()).append(" — ").append(money(p2.getPrice()))
          .append(" · ").append(stockLine(p2)).append(" · ").append(ratingLine(p2));
    }
    List<Map<String, Object>> cards = picks.stream()
        .map(x -> card(x, catNames, reasons.getOrDefault(x.getId(), List.of("history-match"))))
        .toList();
    return new AssistantResponse(sb.toString(), "HISTORY", cards, List.of(),
        List.of("Suggest something under ₹2,000", "Compare the top two"),
        true, "rules+history-scoring");
  }

  private AssistantResponse search(Parsed p, List<ProductDoc> all, Map<String, String> catNames) {
    List<ProductDoc> pool = all;
    boolean categoryRequested = !p.categoryIds.isEmpty();
    if (categoryRequested) {
      pool = all.stream().filter(x -> p.categoryIds.contains(x.getCategoryId())).toList();
    }

    // "Product type" tokens are words that actually appear in product names ("laptop",
    // "headphone"). When present they narrow the search, so "laptop under 50,000" cannot
    // silently drift into unrelated electronics.
    List<String> typeTokens = p.tokens.stream()
        .filter(t -> all.stream().anyMatch(x -> nameHasToken(x, t)))
        .toList();
    List<ProductDoc> typePool = typeTokens.isEmpty() ? List.of() : all.stream()
        .filter(x -> typeTokens.stream().anyMatch(t -> nameHasToken(x, t)))
        .toList();

    List<ProductDoc> basePool = typePool.isEmpty() ? pool : typePool;

    List<ProductDoc> budgetMatched = basePool.stream()
        .filter(x -> p.maxPrice == null || x.getPrice() <= p.maxPrice)
        .filter(x -> p.minPrice == null || x.getPrice() >= p.minPrice)
        .toList();

    List<ProductDoc> inStock = budgetMatched.stream().filter(ProductDoc::isAvailability).toList();

    List<ProductDoc> ranked = inStock.stream()
        .sorted(Comparator.comparingDouble((ProductDoc x) -> score(x, p)).reversed())
        .limit(Math.max(1, maxResults))
        .toList();

    String catLabel = categoryLabel(p, catNames);
    String budgetLabel = p.budgetText == null ? "" : " " + p.budgetText;

    if (!ranked.isEmpty()) {
      StringBuilder sb = new StringBuilder();
      sb.append("I found ").append(ranked.size()).append(" in-stock ")
          .append(catLabel.isEmpty() ? ("product" + (ranked.size() == 1 ? "" : "s"))
              : "option" + (ranked.size() == 1 ? "" : "s") + " in " + capitalize(catLabel))
          .append(budgetLabel).append(" in the live catalog:\n");
      int i = 1;
      for (ProductDoc x : ranked) {
        sb.append(i++).append(". ").append(x.getName()).append(" — ").append(money(x.getPrice()))
            .append(" · ").append(stockLine(x)).append(" · ").append(ratingLine(x)).append('\n');
      }
      sb.append("\nI ranked these on category match, how much of your request the listing mentions, budget fit, rating and stock. Ask me to compare any two.");
      List<Map<String, Object>> cards = ranked.stream()
          .map(x -> card(x, catNames, reasonsFor(x, p, true))).toList();
      return new AssistantResponse(sb.toString(), "SEARCH", cards, List.of(), followUps(p, ranked),
          true, "rules+retrieval");
    }

    // No exact match — explain the real reason and offer closest in-stock alternatives.
    String noun = !typeTokens.isEmpty() ? typeTokens.get(0)
        : (catLabel.isEmpty() ? "product" : catLabel);
    StringBuilder sb = new StringBuilder("I couldn't find an in-stock ").append(noun)
        .append(budgetLabel).append(" in the current catalog.");

    ProductDoc cheapestType = typePool.stream().filter(ProductDoc::isAvailability)
        .min(Comparator.comparingDouble(ProductDoc::getPrice)).orElse(null);
    ProductDoc cheapestCategory = pool.stream().filter(ProductDoc::isAvailability)
        .min(Comparator.comparingDouble(ProductDoc::getPrice)).orElse(null);
    if (cheapestType != null && p.maxPrice != null && cheapestType.getPrice() > p.maxPrice) {
      sb.append(" The cheapest in-stock ").append(noun).append(" is ").append(cheapestType.getName())
          .append(" at ").append(money(cheapestType.getPrice())).append(", which is ")
          .append(money(cheapestType.getPrice() - p.maxPrice)).append(" above your budget.");
    } else if (cheapestCategory != null && p.maxPrice != null
        && cheapestCategory.getPrice() > p.maxPrice) {
      sb.append(" The cheapest in-stock ").append(catLabel.isEmpty() ? "item" : catLabel)
          .append(" is ").append(cheapestCategory.getName()).append(" at ")
          .append(money(cheapestCategory.getPrice())).append(", which is ")
          .append(money(cheapestCategory.getPrice() - p.maxPrice)).append(" above your budget.");
    } else if (categoryRequested && inStock.isEmpty() && !pool.isEmpty()) {
      sb.append(" Every matching ").append(noun).append(" is currently out of stock.");
    } else if (!categoryRequested) {
      sb.append(" Nothing matched the words in your request.");
    }

    List<ProductDoc> alts = closestAlternatives(p, all, typePool).stream().limit(maxResults).toList();
    if (!alts.isEmpty()) {
      sb.append("\n\nClosest in-stock options from the catalog:\n");
      for (ProductDoc a : alts) {
        sb.append("• ").append(a.getName()).append(" — ").append(money(a.getPrice()))
            .append(" · ").append(stockLine(a)).append(" · ").append(ratingLine(a)).append('\n');
      }
      sb.append("\nThese are real listings, shown because they are the nearest available match — not a fabricated result.");
      List<Map<String, Object>> cards = alts.stream()
          .map(x -> card(x, catNames, List.of("closest-price-match"))).toList();
      return new AssistantResponse(sb.toString(), "NO_MATCH", cards, List.of(),
          List.of("Increase my budget", "Show me another category"), true, "rules+retrieval");
    }

    sb.append("\n\nNo in-stock alternative exists in the catalog right now.");
    return new AssistantResponse(sb.toString(), "NO_MATCH", List.of(), List.of(),
        List.of("Show all products"), true, "rules+retrieval");
  }

  // ------------------------------------------------------------------ scoring & helpers

  private double score(ProductDoc x, Parsed p) {
    double s = 0;
    if (!p.categoryIds.isEmpty() && p.categoryIds.contains(x.getCategoryId())) s += 4;
    String name = x.getName() == null ? "" : x.getName().toLowerCase(Locale.ROOT);
    String desc = x.getDescription() == null ? "" : x.getDescription().toLowerCase(Locale.ROOT);
    for (String t : p.tokens) {
      if (name.contains(t)) s += 2.5;
      else if (desc.contains(t)) s += 1.0;
    }
    for (Map.Entry<String, List<String>> e : USE_CASE_TERMS.entrySet()) {
      if (!p.tokens.contains(e.getKey())) continue;
      List<String> terms = e.getValue();
      for (int i = 0; i < terms.size(); i++) {
        double weight = Math.max(0.7, 2.2 - 0.15 * i);
        String term = terms.get(i);
        if (name.contains(term)) s += weight;
        else if (desc.contains(term)) s += weight * 0.5;
      }
    }
    if (p.maxPrice != null) {
      s += 2;
      if (x.getPrice() >= p.maxPrice * 0.55) s += 1.5; // use the budget, don't return the cheapest toy
    }
    if (x.getReviewCount() > 0) s += (x.getAverageRating() / 5.0) * 1.2;
    if (x.isAvailability()) s += 0.5;
    return s;
  }

  private List<String> reasonsFor(ProductDoc x, Parsed p, boolean inStock) {
    List<String> r = new ArrayList<>();
    if (!p.categoryIds.isEmpty() && p.categoryIds.contains(x.getCategoryId())) r.add("category-match");
    if (p.maxPrice != null && x.getPrice() <= p.maxPrice) r.add("within-budget");
    for (Map.Entry<String, List<String>> e : USE_CASE_TERMS.entrySet()) {
      if (!p.tokens.contains(e.getKey())) continue;
      String hay = ((x.getName() == null ? "" : x.getName()) + " "
          + (x.getDescription() == null ? "" : x.getDescription())).toLowerCase(Locale.ROOT);
      if (e.getValue().stream().anyMatch(hay::contains)) {
        r.add("fits-" + e.getKey());
        break;
      }
    }
    if (inStock) r.add("in-stock-" + x.getStockQuantity() + "-units");
    if (x.getReviewCount() > 0) r.add("rated-" + x.getAverageRating() + "-from-" + x.getReviewCount());
    if (r.isEmpty()) r.add("catalog-match");
    return r;
  }

  private java.util.Optional<ProductDoc> bestInCategory(String categoryId, Parsed p, List<ProductDoc> all) {
    return all.stream()
        .filter(x -> categoryId.equals(x.getCategoryId()) && x.isAvailability())
        .filter(x -> p.maxPrice == null || x.getPrice() <= p.maxPrice)
        .max(Comparator.comparingDouble(x -> score(x, p)));
  }

  private List<ProductDoc> alternativesTo(ProductDoc product, List<ProductDoc> all) {
    return all.stream()
        .filter(x -> !x.getId().equals(product.getId()) && x.isAvailability())
        .filter(x -> product.getCategoryId() == null
            || product.getCategoryId().equals(x.getCategoryId()))
        .sorted(Comparator.comparingDouble(x -> Math.abs(x.getPrice() - product.getPrice())))
        .toList();
  }

  private List<ProductDoc> closestAlternatives(Parsed p, List<ProductDoc> all,
      List<ProductDoc> typePool) {
    double target = p.maxPrice != null ? p.maxPrice
        : all.stream().mapToDouble(ProductDoc::getPrice).average().orElse(0);
    Map<String, ProductDoc> ordered = new LinkedHashMap<>();
    // 1) same product type first (an over-budget laptop is more useful than a random gadget)
    typePool.stream().filter(ProductDoc::isAvailability)
        .sorted(Comparator.comparingDouble(x -> Math.abs(x.getPrice() - target)))
        .forEach(x -> ordered.putIfAbsent(x.getId(), x));
    // 2) same category, ordered by how well it fits the request (use-case aware),
    //    then the rest of the in-stock catalog by price distance.
    all.stream().filter(ProductDoc::isAvailability)
        .filter(x -> p.categoryIds.isEmpty() || p.categoryIds.contains(x.getCategoryId()))
        .sorted(Comparator.comparingDouble((ProductDoc x) -> -score(x, p)))
        .forEach(x -> ordered.putIfAbsent(x.getId(), x));
    all.stream().filter(ProductDoc::isAvailability)
        .sorted(Comparator.comparingDouble(x -> Math.abs(x.getPrice() - target)))
        .forEach(x -> ordered.putIfAbsent(x.getId(), x));
    return new ArrayList<>(ordered.values());
  }

  private Map<String, Object> card(ProductDoc p, Map<String, String> catNames, List<String> reasons) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("productId", p.getId());
    m.put("name", p.getName());
    m.put("price", p.getPrice());
    m.put("category", p.getCategoryId());
    m.put("categoryName", catName(p.getCategoryId(), catNames));
    m.put("description", p.getDescription());
    m.put("image", p.getImages() == null || p.getImages().isEmpty() ? null : p.getImages().get(0));
    m.put("availability", p.isAvailability());
    m.put("stockQuantity", p.getStockQuantity());
    m.put("rating", p.getAverageRating());
    m.put("reviewCount", p.getReviewCount());
    m.put("returnEligible", p.isEligibleForReturn());
    m.put("reasons", reasons);
    return m;
  }

  private Map<String, Object> compareRow(ProductDoc p, Map<String, String> catNames) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("productId", p.getId());
    m.put("name", p.getName());
    m.put("price", p.getPrice());
    m.put("categoryName", catName(p.getCategoryId(), catNames));
    m.put("availability", p.isAvailability());
    m.put("stockQuantity", p.getStockQuantity());
    m.put("rating", p.getAverageRating());
    m.put("reviewCount", p.getReviewCount());
    m.put("returnEligible", p.isEligibleForReturn());
    m.put("description", p.getDescription());
    m.put("features", p.getDescription() == null || p.getDescription().isBlank()
        ? List.of() : Arrays.stream(p.getDescription().split(",\\s*")).toList());
    return m;
  }

  private ProductDoc bestRated(ProductDoc a, ProductDoc b) {
    if (a.getReviewCount() == 0 && b.getReviewCount() == 0) return null;
    if (a.getReviewCount() == 0) return b;
    if (b.getReviewCount() == 0) return a;
    if (Math.abs(a.getAverageRating() - b.getAverageRating()) < 0.05) return null;
    return a.getAverageRating() > b.getAverageRating() ? a : b;
  }

  private String stockLine(ProductDoc p) {
    if (!p.isAvailability() || p.getStockQuantity() <= 0) return "out of stock";
    return "in stock (" + p.getStockQuantity() + " unit" + (p.getStockQuantity() == 1 ? "" : "s") + ")";
  }

  private String ratingLine(ProductDoc p) {
    if (p.getReviewCount() <= 0) return "no customer ratings yet";
    return String.format(Locale.ROOT, "%.1f/5 from %d review%s", p.getAverageRating(),
        p.getReviewCount(), p.getReviewCount() == 1 ? "" : "s");
  }

  private String categoryLabel(Parsed p, Map<String, String> catNames) {
    if (p.categoryIds.isEmpty()) return "";
    return p.categoryIds.stream().map(id -> catName(id, catNames).toLowerCase(Locale.ROOT))
        .collect(Collectors.joining(" or "));
  }

  private String capitalize(String s) {
    if (s == null || s.isEmpty()) return s;
    return Character.toUpperCase(s.charAt(0)) + s.substring(1);
  }

  private List<String> followUps(Parsed p, List<ProductDoc> ranked) {
    List<String> f = new ArrayList<>();
    if (ranked.size() >= 2) f.add("Compare " + ranked.get(0).getName() + " vs " + ranked.get(1).getName());
    if (!ranked.isEmpty()) f.add("Is " + ranked.get(0).getName() + " in stock?");
    if (p.maxPrice != null) f.add("Show options under " + money(Math.max(500, p.maxPrice * 0.6)));
    else f.add("Suggest something under ₹2,000");
    f.add("What is your return policy?");
    return f;
  }

  private Map<String, String> categoryNames() {
    Map<String, String> map = new HashMap<>();
    for (CategoryDoc c : categories.findAll()) {
      map.put(c.getId(), c.getName() == null ? c.getId() : c.getName());
    }
    return map;
  }

  private String catName(String id, Map<String, String> names) {
    return names.getOrDefault(id, id == null ? "Uncategorised" : id);
  }

  private String money(double value) {
    return "₹" + String.format(Locale.forLanguageTag("en-IN"), "%,.0f", value);
  }
}
