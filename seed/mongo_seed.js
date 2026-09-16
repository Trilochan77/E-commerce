// Phase 0 seed — run AFTER mongo is up:
//   mongosh --file seed/mongo_seed.js
// Seeds 5 categories + 20 products. Users are created via API in Phase 1
// (POST /api/users/register) so passwords are BCrypt-hashed by user-service.

db = db.getSiblingDB("ecom");

db.categories.deleteMany({});
db.products.deleteMany({});

const cats = [
  { _id: "C-01", name: "Electronics" },
  { _id: "C-02", name: "Fashion" },
  { _id: "C-03", name: "Home & Kitchen" },
  { _id: "C-04", name: "Books" },
  { _id: "C-05", name: "Sports" }
];
db.categories.insertMany(cats);

const P = (id, name, desc, price, cat, stock, eligible, img) => ({
  _id: id, name, description: desc, price, categoryId: cat,
  images: [img || ("https://picsum.photos/seed/" + id + "/600/600")],
  stockQuantity: stock, availability: stock > 0,
  isEligibleForReturn: eligible, createdAt: new Date(), updatedAt: new Date()
});

db.products.insertMany([
  P("P-1001", "Wireless Headphones X1", "Bluetooth 5.3, ANC, 40h battery", 2499, "C-01", 50, true),
  P("P-1002", "Smartphone Z5 128GB", "6.5in AMOLED, 50MP camera", 14999, "C-01", 30, true),
  P("P-1003", "Laptop Ultra 14", "Ryzen 7, 16GB RAM, 512GB SSD", 62990, "C-01", 15, true),
  P("P-1004", "Smartwatch Fit Pro", "HR + SpO2, GPS, 10-day battery", 3999, "C-01", 60, true),
  P("P-1005", "Bluetooth Speaker Boom", "20W, IPX7 waterproof", 1999, "C-01", 80, false),
  P("P-2001", "Men Running Shoes", "Lightweight mesh, size 6-11", 1799, "C-02", 100, true),
  P("P-2002", "Denim Jacket Classic", "Cotton denim, all sizes", 2299, "C-02", 40, true),
  P("P-2003", "Women Handbag Tote", "Vegan leather tote", 1499, "C-02", 55, false),
  P("P-2004", "Sunglasses Aviator", "UV400 polarized", 999, "C-02", 120, false),
  P("P-3001", "Non-stick Cookware Set (5pc)", "Induction compatible", 2999, "C-03", 35, true),
  P("P-3002", "Air Fryer 4L", "8 presets, 1500W", 7490, "C-03", 25, true),
  P("P-3003", "Cotton Bedsheet King", "300TC cotton, 2 pillow covers", 1299, "C-03", 90, false),
  P("P-3004", "LED Desk Lamp", "Dimmable, USB charging port", 899, "C-03", 70, false),
  P("P-4001", "Atomic Habits (Paperback)", "Self-help bestseller", 499, "C-04", 200, false),
  P("P-4002", "DSA in Java (Guide)", "Interview prep, 500 problems", 799, "C-04", 150, false),
  P("P-4003", "Notebook Set (3pc)", "A5 dotted notebooks", 349, "C-04", 300, false),
  P("P-5001", "Yoga Mat Pro 6mm", "Anti-slip, carry strap", 1099, "C-05", 85, true),
  P("P-5002", "Dumbbell Set 10kg", "Adjustable plates", 2199, "C-05", 45, true),
  P("P-5003", "Cricket Bat Kashmir", "Full size, with cover", 1599, "C-05", 30, true),
  P("P-5004", "Water Bottle 1L Steel", "Vacuum insulated, 24h hot/cold", 699, "C-05", 180, false)
]);

print("Seeded categories: " + db.categories.countDocuments());
print("Seeded products: " + db.products.countDocuments());

// Demo users (create via API once user-service exists):
// admin@shop.com / Admin@123  (ADMIN)
// john@example.com / John@123 (CUSTOMER, U-102 — matches SRS object diagram)
// jane@example.com / Jane@123 (CUSTOMER)
