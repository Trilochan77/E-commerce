package com.ecom.recommendation.service;

import com.ecom.recommendation.entity.ProductDoc;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Deterministic text helpers used by the recommendation rails.
 *
 * <p>This is classic content-based filtering: products are represented as a bag of
 * words (name + description), and similarity is Jaccard overlap of those words.
 * There is no machine learning, no embeddings and no model here.
 */
public final class ProductText {

  private ProductText() {}

  private static final Set<String> STOP = new HashSet<>(List.of(
      "the", "and", "for", "with", "from", "this", "that", "your", "you", "our", "are", "was",
      "were", "has", "have", "will", "can", "all", "any", "not", "but", "its", "their", "them",
      "these", "those", "into", "over", "under", "more", "most", "also", "than", "then", "when",
      "what", "which", "who", "how", "why", "about", "after", "before", "product", "products",
      "item", "items", "new", "best", "good", "great", "quality", "feature", "features",
      "specification", "specifications", "spec", "specs", "description", "details", "detail",
      "buy", "sale", "offer", "price", "size", "color", "colour"));

  public static Set<String> tokens(ProductDoc p) {
    if (p == null) return Set.of();
    return tokens((p.getName() == null ? "" : p.getName()) + " "
        + (p.getDescription() == null ? "" : p.getDescription()));
  }

  public static Set<String> tokens(String text) {
    Set<String> out = new HashSet<>();
    if (text == null || text.isBlank()) return out;
    for (String t : text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+")) {
      if (t.length() < 3 || STOP.contains(t) || t.matches("[0-9]+")) continue;
      out.add(singular(t));
    }
    return out;
  }

  /** Tiny stemming pass so "laptops" matches "laptop" and "students" matches "student". */
  private static String singular(String t) {
    if (t.length() > 4 && t.endsWith("s") && !t.endsWith("ss")) return t.substring(0, t.length() - 1);
    return t;
  }

  /** Jaccard similarity of two token sets: |A ∩ B| / |A ∪ B|. */
  public static double jaccard(Set<String> a, Set<String> b) {
    if (a == null || b == null || a.isEmpty() || b.isEmpty()) return 0;
    int intersection = 0;
    for (String token : a) {
      if (b.contains(token)) intersection++;
    }
    int union = a.size() + b.size() - intersection;
    return union == 0 ? 0 : (double) intersection / union;
  }

  /** Words shared by both products, alphabetically sorted, capped at {@code max}. */
  public static List<String> shared(Set<String> a, Set<String> b, int max) {
    List<String> out = new ArrayList<>();
    if (a == null || b == null) return out;
    for (String token : a) {
      if (b.contains(token)) out.add(token);
    }
    out.sort(String::compareTo);
    return out.size() > max ? new ArrayList<>(out.subList(0, max)) : out;
  }
}
