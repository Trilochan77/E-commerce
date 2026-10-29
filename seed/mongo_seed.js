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

const P = (id, name, desc, price, cat, stock, eligible, image) => ({
  _id: id, name, description: desc, price, categoryId: cat,
  images: image ? [image] : [],
  stockQuantity: stock, availability: stock > 0,
  eligibleForReturn: eligible, createdAt: new Date(), updatedAt: new Date()
});

db.products.insertMany([
  P("P-1001", "Wireless Headphones X1", "Bluetooth 5.3, ANC, 40h battery", 2499, "C-01", 50, true, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"),
  P("P-1002", "Smartphone Z5 128GB", "6.5in AMOLED, 50MP camera", 14999, "C-01", 30, true, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"),
  P("P-1003", "Laptop Ultra 14", "Ryzen 7, 16GB RAM, 512GB SSD", 62990, "C-01", 15, true, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"),
  P("P-1004", "Smartwatch Fit Pro", "HR + SpO2, GPS, 10-day battery", 3999, "C-01", 60, true, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"),
  P("P-1005", "Bluetooth Speaker Boom", "20W, IPX7 waterproof", 1999, "C-01", 80, false, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"),
  P("P-1006", "Tablet Tab A11 64GB", "11in display, quad speakers, 8000mAh", 12999, "C-01", 28, true, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80"),
  P("P-1007", "Mechanical Keyboard RGB", "Hot-swap brown switches, PBT caps", 3499, "C-01", 45, true, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80"),
  P("P-1008", "Drone SkyCam 4K", "3-axis gimbal, 30-min flight, carry case", 24990, "C-01", 12, true, "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80"),
  P("P-2001", "Men Running Shoes", "Lightweight mesh, size 6-11", 1799, "C-02", 100, true, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"),
  P("P-2002", "Denim Jacket Classic", "Cotton denim, all sizes", 2299, "C-02", 40, true, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80"),
  P("P-2003", "Women Handbag Tote", "Vegan leather tote", 1499, "C-02", 55, false, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"),
  P("P-2004", "Sunglasses Aviator", "UV400 polarized", 999, "C-02", 120, false, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"),
  P("P-2005", "Cotton Kurta Festive", "Breathable cotton, sizes S-XXL", 1199, "C-02", 75, true, "https://images.unsplash.com/photo-1692170743549-ec52be9102eb?auto=format&fit=crop&w=600&q=80"),
  P("P-2006", "Leather Wallet RFID", "Genuine leather, 8 card slots", 749, "C-02", 140, false, "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"),
  P("P-2007", "Sports Backpack 35L", "Water-repellent, laptop sleeve", 1599, "C-02", 65, true, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"),
  P("P-3001", "Non-stick Cookware Set (5pc)", "Induction compatible", 2999, "C-03", 35, true, "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80"),
  P("P-3002", "Air Fryer 4L", "8 presets, 1500W", 7490, "C-03", 25, true, "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80"),
  P("P-3003", "Cotton Bedsheet King", "300TC cotton, 2 pillow covers", 1299, "C-03", 90, false, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"),
  P("P-3004", "LED Desk Lamp", "Dimmable, USB charging port", 899, "C-03", 70, false, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"),
  P("P-3005", "Mixer Grinder 750W", "3 jars, overload protection", 3299, "C-03", 40, true, "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80"),
  P("P-3006", "Ceramic Dinner Set (18pc)", "Chip-resistant glaze, serves 6", 2499, "C-03", 30, true, "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80"),
  P("P-3007", "Room Heater Oil-Filled", "13-fin, 2900W, thermostat", 8990, "C-03", 18, false, "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"),
  P("P-4001", "Atomic Habits (Paperback)", "Self-help bestseller", 499, "C-04", 200, false, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"),
  P("P-4002", "DSA in Java (Guide)", "Interview prep, 500 problems", 799, "C-04", 150, false, "https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?auto=format&fit=crop&w=600&q=80"),
  P("P-4003", "Notebook Set (3pc)", "A5 dotted notebooks", 349, "C-04", 300, false, "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80"),
  P("P-4004", "Indian Polity Primer", "UPSC-ready reference, latest edition", 650, "C-04", 120, false, "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80"),
  P("P-4005", "Kids Story Box (6 books)", "Illustrated bedtime collection", 899, "C-04", 95, true, "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"),
  P("P-4006", "Cookbook: 100 Curries", "Regional classics with photos", 599, "C-04", 110, false, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"),
  P("P-5001", "Yoga Mat Pro 6mm", "Anti-slip, carry strap", 1099, "C-05", 85, true, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80"),
  P("P-5002", "Dumbbell Set 10kg", "Adjustable plates", 2199, "C-05", 45, true, "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80"),
  P("P-5003", "Cricket Bat Kashmir", "Full size, with cover", 1599, "C-05", 30, true, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80"),
  P("P-5004", "Water Bottle 1L Steel", "Vacuum insulated, 24h hot/cold", 699, "C-05", 180, false, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"),
  P("P-5005", "Football Size 5 Pro", "Machine-stitched, all-weather", 1299, "C-05", 70, true, "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80"),
  P("P-5006", "Skipping Rope Speed", "Ball-bearing handles, adjustable", 349, "C-05", 160, false, "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80"),
  P("P-5007", "Badminton Set (2+shuttle)", "Aluminium rackets, carry bag", 1499, "C-05", 55, true, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80")
]);

print("Seeded categories: " + db.categories.countDocuments());
print("Seeded products: " + db.products.countDocuments());

// Demo users (create via API once user-service exists):
// admin@shop.com / Admin@123  (ADMIN)
// john@example.com / John@123 (CUSTOMER, U-102 — matches SRS object diagram)
// jane@example.com / Jane@123 (CUSTOMER)
