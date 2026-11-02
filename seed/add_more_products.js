// Add New Electronics Products: Mobiles, Laptops, Bluetooth Earbuds & Speakers, Neckbands
db = db.getSiblingDB("ecom");

const newProducts = [
  // ==================== MOBILES (SMARTPHONES) ====================
  {
    _id: "P-1101",
    name: "Samsung Galaxy S24 Ultra 5G",
    description: "Snapdragon 8 Gen 3, 200MP Quad Camera with AI Zoom, 12GB RAM, 256GB Storage, S-Pen included, Titanium Black",
    price: 129999,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 25,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.8,
    reviewCount: 34,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1102",
    name: "Apple iPhone 16 Pro Max 256GB",
    description: "A18 Pro Bionic Chip, 6.9-inch Super Retina XDR OLED Display, 48MP Fusion Camera, Action Button, Desert Titanium",
    price: 144900,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 20,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.9,
    reviewCount: 48,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1103",
    name: "OnePlus 12 5G (Flowy Emerald, 16GB RAM, 512GB)",
    description: "Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera System, 5400mAh Battery with 100W SUPERVOOC charging, 2K ProXDR 120Hz display",
    price: 64999,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 35,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.7,
    reviewCount: 29,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1104",
    name: "Google Pixel 9 Pro 5G (Obsidian, 256GB)",
    description: "Google Tensor G4 with Gemini AI Built-in, 6.3-inch Super Actua LTPO Display, 50MP Triple Rear Camera, 7 Years OS Updates",
    price: 109999,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 18,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.6,
    reviewCount: 19,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1105",
    name: "Redmi Note 13 Pro+ 5G (Fusion Purple, 8GB/256GB)",
    description: "3D Curved 1.5K 120Hz AMOLED, Flagship 200MP OIS Camera, IP68 Water & Dust Resistant, 120W HyperCharge in 19 mins",
    price: 27999,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 45,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.5,
    reviewCount: 42,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1106",
    name: "Realme GT 6 5G (Fluid Silver, 12GB/256GB)",
    description: "Snapdragon 8s Gen 3, Industry's Brightest 6000nit Hyper Display, 50MP Sony LYT-808 OIS Camera, 5500mAh with 120W Gallium Nitride Charger",
    price: 38999,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 30,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.6,
    reviewCount: 22,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // ==================== LAPTOPS ====================
  {
    _id: "P-1201",
    name: "Apple MacBook Air M3 (15.3-inch, 16GB, 512GB, Midnight)",
    description: "Apple M3 Chip with 8-core CPU and 10-core GPU, 15.3-inch Liquid Retina Display with True Tone, 1080p FaceTime HD, 18-hour Battery Life",
    price: 134900,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 15,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.9,
    reviewCount: 56,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1202",
    name: "Dell XPS 14 OLED (Intel Core Ultra 7, 32GB RAM, 1TB SSD)",
    description: "Intel Core Ultra 7 155H with Intel AI Boost NPU, NVIDIA GeForce RTX 4050 6GB, 14.5-inch 3.2K InfinityEdge Touch OLED, CNC Machined Aluminum",
    price: 189990,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 12,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.7,
    reviewCount: 16,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1203",
    name: "ASUS ROG Zephyrus G16 Gaming Laptop",
    description: "Intel Core Ultra 9 185H, NVIDIA GeForce RTX 4080 12GB GDDR6, 32GB LPDDR5X RAM, 1TB PCIe 4.0 SSD, 16-inch 2.5K 240Hz ROG Nebula OLED, Eclipse Gray",
    price: 219990,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 10,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.8,
    reviewCount: 28,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1204",
    name: "HP Pavilion Plus 14 (AMD Ryzen 7 7840U, 16GB, 1TB SSD)",
    description: "AMD Ryzen 7 7840U with Radeon 780M Graphics, 14-inch 2.8K 120Hz OLED Display, 5MP IR Camera with privacy shutter, All-metal Chassis, Warm Gold",
    price: 76990,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 22,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.6,
    reviewCount: 31,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1205",
    name: "Lenovo IdeaPad Slim 5 (Intel Core Ultra 5, 16GB, 512GB SSD)",
    description: "Intel Core Ultra 5 125H AI-ready, 16-inch WUXGA IPS 300nits Anti-glare, FHD IR Camera, Dolby Audio Stereo Speakers, Rapid Charge Boost, Cloud Grey",
    price: 62490,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 28,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.5,
    reviewCount: 24,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1206",
    name: "Acer Predator Helios Neo 16 Gaming Laptop",
    description: "Intel Core i7 14th Gen 14700HX, NVIDIA GeForce RTX 4060 8GB GDDR6, 16GB DDR5 RAM, 1TB Gen 4 SSD, 16-inch WQXGA 165Hz IPS, 4-Zone RGB Backlit Keyboard",
    price: 114990,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 14,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.7,
    reviewCount: 38,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // ==================== BLUETOOTH EARBUDS & SPEAKERS ====================
  {
    _id: "P-1301",
    name: "Sony WF-1000XM5 True Wireless Noise Cancelling Earbuds",
    description: "Industry-leading Active Noise Cancelling with Integrated Processor V2, Dynamic Driver X for rich bass & clear vocals, Multipoint Connection, LDAC High-Res Wireless, 24h Battery",
    price: 19990,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 40,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.8,
    reviewCount: 65,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1302",
    name: "Apple AirPods Pro (2nd Generation with MagSafe USB-C)",
    description: "Apple H2 Headphone Chip, Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, IP54 Dust & Sweat Resistant",
    price: 22900,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 35,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.9,
    reviewCount: 92,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1303",
    name: "JBL Flip 6 Portable Waterproof Bluetooth Speaker",
    description: "2-way speaker system delivering powerful JBL Original Pro Sound, IP67 Waterproof & Dustproof, 12 Hours of Playtime, PartyBoost stereo pairing, Rugged Squad Design",
    price: 9999,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 50,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.7,
    reviewCount: 54,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1304",
    name: "boAt Airdopes 141 ANC TWS Earbuds",
    description: "Up to 32dB Active Noise Cancellation, 42 Hours Total Playtime, BEAST Mode 50ms Low Latency for Gaming, ENx Tech 4-Mic Clear Voice Calls, ASAP Charge (10min=150min)",
    price: 1499,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 80,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.4,
    reviewCount: 110,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1305",
    name: "Bose SoundLink Flex Portable Bluetooth Speaker",
    description: "State-of-the-art transducer delivers clear, deep sound & powerful bass, PositionIQ Technology optimizes sound automatically, IP67 Waterproof & Floats in water, 12h Battery",
    price: 15900,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 25,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.8,
    reviewCount: 37,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1306",
    name: "Marshall Emberton II Portable Bluetooth Speaker",
    description: "True Stereophonic 360-degree multi-directional sound from Marshall, 30+ Hours of Portable Playtime, IP67 Dust and Water-Resistant, Stack Mode multi-speaker pairing, Black & Brass",
    price: 17499,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 20,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.8,
    reviewCount: 45,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // ==================== NECKBANDS (WIRELESS BLUETOOTH) ====================
  {
    _id: "P-1401",
    name: "OnePlus Bullets Wireless Z2 ANC Neckband",
    description: "45dB Hybrid Active Noise Cancellation, 12.4mm Dynamic Bass Drivers, 28 Hours Total Battery Life, Warp Charge (10 mins for 20 hours playback), IP55 Water & Sweat Resistance, Acoustic Red",
    price: 2299,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 65,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.6,
    reviewCount: 78,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1402",
    name: "Realme Buds Wireless 3 Neckband Earphones",
    description: "30dB Active Noise Cancellation with 13.6mm Dynamic Bass Boost Drivers, 360-degree Spatial Audio Effect, 40 Hours Ultra Battery Life, 45ms Ultra-Low Latency, Dual-device Connection, Pure Black",
    price: 1699,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1578319439574-1a27e415c73f?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 70,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.5,
    reviewCount: 64,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1403",
    name: "boAt Rockerz 255 Pro+ Wireless Bluetooth Neckband",
    description: "Signature Sound with 10mm Drivers, ASAP Fast Charge (10 mins charge = 10 hours playtime), 40 Hours Total Playback, IPX7 Water & Sweat Resistance, Dual Pairing Bluetooth v5.2, Active Black",
    price: 1299,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 90,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.4,
    reviewCount: 145,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1404",
    name: "Sony WI-C100 Wireless in-Ear Bluetooth Neckband",
    description: "25 Hours Battery Life, DSEE Upscaling for high-frequency restoration, Splash-proof IPX4 design, 360 Reality Audio compatible, Built-in mic for clear hands-free calls, Blue",
    price: 1790,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 50,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.5,
    reviewCount: 52,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1405",
    name: "Boult Audio Curve ANC Wireless Bluetooth Neckband",
    description: "30dB Active Noise Cancellation with Zen Quad Mic Environmental Noise Cancellation, 40 Hours Playtime, Lightning Boult Type-C Fast Charging, BoomX Rich Deep Bass, IPX5 Water Resistant, Neon Green",
    price: 1399,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 60,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.3,
    reviewCount: 41,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "P-1406",
    name: "Noise Tune Charge Bluetooth Wireless Neckband",
    description: "Dedicated BASS Booster Button for punchy sound, 16 Hours Playtime with 10mm drivers, Dual Pairing with seamless switching between phone and laptop, IPX5 Sweat-proof, Stealth Black",
    price: 1199,
    categoryId: "C-01",
    images: ["https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=600&q=80"],
    stockQuantity: 55,
    availability: true,
    eligibleForReturn: true,
    averageRating: 4.4,
    reviewCount: 39,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let insertedCount = 0;
let updatedCount = 0;

for (const p of newProducts) {
  const res = db.products.updateOne(
    { _id: p._id },
    { $set: p },
    { upsert: true }
  );
  if (res.upsertedCount > 0) {
    insertedCount++;
  } else if (res.modifiedCount > 0 || res.matchedCount > 0) {
    updatedCount++;
  }
}

print("New products operation complete:");
print("  Upserted new: " + insertedCount);
print("  Updated: " + updatedCount);
print("Total products in DB now: " + db.products.countDocuments());

