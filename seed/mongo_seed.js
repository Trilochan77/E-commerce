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
  // Mobiles
  P("P-1101", "Samsung Galaxy S24 Ultra 5G", "Snapdragon 8 Gen 3, 200MP Quad Camera, 12GB/256GB, Titanium Black", 129999, "C-01", 25, true, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80"),
  P("P-1102", "Apple iPhone 16 Pro Max 256GB", "A18 Pro Bionic, 6.9-inch Super Retina XDR OLED, 48MP Fusion, Desert Titanium", 144900, "C-01", 20, true, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"),
  P("P-1103", "OnePlus 12 5G (Flowy Emerald, 16GB/512GB)", "Snapdragon 8 Gen 3, Hasselblad Camera, 100W SUPERVOOC, 2K ProXDR", 64999, "C-01", 35, true, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80"),
  P("P-1104", "Google Pixel 9 Pro 5G (Obsidian, 256GB)", "Tensor G4 Gemini AI, 6.3-inch Super Actua LTPO, 50MP Triple Rear", 109999, "C-01", 18, true, "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80"),
  P("P-1105", "Redmi Note 13 Pro+ 5G (Fusion Purple, 8GB/256GB)", "Curved 1.5K AMOLED, 200MP OIS Camera, IP68, 120W HyperCharge", 27999, "C-01", 45, true, "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80"),
  P("P-1106", "Realme GT 6 5G (Fluid Silver, 12GB/256GB)", "Snapdragon 8s Gen 3, 6000nit Hyper Display, 50MP Sony LYT-808 OIS, 120W GaN", 38999, "C-01", 30, true, "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=600&q=80"),
  // Laptops
  P("P-1201", "Apple MacBook Air M3 (15.3-inch, 16GB, 512GB, Midnight)", "Apple M3 Chip, 15.3-inch Liquid Retina, 1080p FaceTime, 18h Battery", 134900, "C-01", 15, true, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"),
  P("P-1202", "Dell XPS 14 OLED (Intel Core Ultra 7, 32GB RAM, 1TB SSD)", "Intel Core Ultra 7 155H, RTX 4050 6GB, 14.5-inch 3.2K OLED Touch", 189990, "C-01", 12, true, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80"),
  P("P-1203", "ASUS ROG Zephyrus G16 Gaming Laptop", "Core Ultra 9, RTX 4080 12GB, 32GB RAM, 1TB SSD, 2.5K 240Hz OLED", 219990, "C-01", 10, true, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80"),
  P("P-1204", "HP Pavilion Plus 14 (AMD Ryzen 7 7840U, 16GB, 1TB SSD)", "Ryzen 7 7840U, 14-inch 2.8K 120Hz OLED, 5MP IR Camera, Warm Gold", 76990, "C-01", 22, true, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"),
  P("P-1205", "Lenovo IdeaPad Slim 5 (Intel Core Ultra 5, 16GB, 512GB SSD)", "Core Ultra 5 125H, 16-inch WUXGA IPS 300nits, Dolby Audio, Cloud Grey", 62490, "C-01", 28, true, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"),
  P("P-1206", "Acer Predator Helios Neo 16 Gaming Laptop", "Core i7 14700HX, RTX 4060 8GB, 16GB DDR5, 1TB Gen4 SSD, 165Hz IPS", 114990, "C-01", 14, true, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80"),
  // Bluetooth Audio & Speakers
  P("P-1301", "Sony WF-1000XM5 True Wireless Noise Cancelling Earbuds", "Integrated Processor V2, Dynamic Driver X, Multipoint LDAC, 24h Battery", 19990, "C-01", 40, true, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"),
  P("P-1302", "Apple AirPods Pro (2nd Gen with MagSafe USB-C)", "Apple H2 Chip, 2x Active Noise Cancellation, Personalized Spatial Audio", 22900, "C-01", 35, true, "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80"),
  P("P-1303", "JBL Flip 6 Portable Waterproof Bluetooth Speaker", "Original Pro Sound, IP67 Waterproof, 12h Playtime, PartyBoost, Squad", 9999, "C-01", 50, true, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"),
  P("P-1304", "boAt Airdopes 141 ANC TWS Earbuds", "32dB ANC, 42h Playtime, BEAST Mode 50ms Low Latency, ENx 4-Mic Calls", 1499, "C-01", 80, true, "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=600&q=80"),
  P("P-1305", "Bose SoundLink Flex Portable Bluetooth Speaker", "PositionIQ Technology, Deep Bass, IP67 Waterproof & Floats, 12h Battery", 15900, "C-01", 25, true, "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=600&q=80"),
  P("P-1306", "Marshall Emberton II Portable Bluetooth Speaker", "360-degree True Stereophonic Sound, 30+ Hours, IP67 Dust/Water Resistant", 17499, "C-01", 20, true, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"),
  // Neckbands
  P("P-1401", "OnePlus Bullets Wireless Z2 ANC Neckband", "45dB Hybrid ANC, 12.4mm Bass Drivers, 28h Battery, 10min Warp Charge", 2299, "C-01", 65, true, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"),
  P("P-1402", "Realme Buds Wireless 3 Neckband Earphones", "30dB ANC, 13.6mm Bass Boost Drivers, 360 Spatial Audio, 40h Battery", 1699, "C-01", 70, true, "https://images.unsplash.com/photo-1578319439574-1a27e415c73f?auto=format&fit=crop&w=600&q=80"),
  P("P-1403", "boAt Rockerz 255 Pro+ Wireless Bluetooth Neckband", "10mm Drivers, ASAP Fast Charge, 40h Playback, IPX7 Water Resistant", 1299, "C-01", 90, true, "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80"),
  P("P-1404", "Sony WI-C100 Wireless in-Ear Bluetooth Neckband", "25 Hours Battery, DSEE Upscaling, IPX4, 360 Reality Audio, Blue", 1790, "C-01", 50, true, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"),
  P("P-1405", "Boult Audio Curve ANC Wireless Bluetooth Neckband", "30dB ANC, Zen Quad Mic ENC, 40h Playtime, BoomX Rich Bass, Neon Green", 1399, "C-01", 60, true, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"),
  P("P-1406", "Noise Tune Charge Bluetooth Wireless Neckband", "Dedicated BASS Booster Button, 16h Playtime, Dual Pairing, Stealth Black", 1199, "C-01", 55, true, "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=600&q=80"),
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
