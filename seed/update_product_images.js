// Update product images with high-resolution, matching Unsplash photos
db = db.getSiblingDB("ecom");

const productImages = {
  // Electronics (C-01)
  "P-1001": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"], // Wireless Headphones
  "P-1002": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"], // Smartphone
  "P-1003": ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"], // Laptop Ultra 14
  "P-1004": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"], // Smartwatch
  "P-1005": ["https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"], // Bluetooth Speaker
  "P-1006": ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80"], // Tablet Tab A11
  "P-1007": ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80"], // Mechanical Keyboard
  "P-1008": ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80"], // Drone SkyCam 4K

  // Fashion (C-02)
  "P-2001": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"], // Men Running Shoes
  "P-2002": ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80"], // Denim Jacket Classic
  "P-2003": ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"], // Women Handbag Tote
  "P-2004": ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"], // Sunglasses Aviator
  "P-2005": ["https://images.unsplash.com/photo-1692170743549-ec52be9102eb?auto=format&fit=crop&w=600&q=80"], // Cotton Kurta Festive
  "P-2006": ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"], // Leather Wallet RFID
  "P-2007": ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"], // Sports Backpack 35L

  // Home & Kitchen (C-03)
  "P-3001": ["https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80"], // Cookware Set (5pc)
  "P-3002": ["https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80"], // Air Fryer 4L
  "P-3003": ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"], // Cotton Bedsheet King
  "P-3004": ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"], // LED Desk Lamp
  "P-3005": ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80"], // Mixer Grinder 750W
  "P-3006": ["https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80"], // Ceramic Dinner Set
  "P-3007": ["https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"], // Room Heater

  // Books (C-04)
  "P-4001": ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"], // Atomic Habits
  "P-4002": ["https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?auto=format&fit=crop&w=600&q=80"], // DSA in Java
  "P-4003": ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80"], // Notebook Set
  "P-4004": ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80"], // Indian Polity Primer
  "P-4005": ["https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"], // Kids Story Box
  "P-4006": ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"], // Cookbook: 100 Curries

  // Sports (C-05)
  "P-5001": ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80"], // Yoga Mat Pro
  "P-5002": ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80"], // Dumbbell Set 10kg
  "P-5003": ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80"], // Cricket Bat
  "P-5004": ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"], // Steel Water Bottle
  "P-5005": ["https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80"], // Football
  "P-5006": ["https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80"], // Skipping Rope
  "P-5007": ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80"]  // Badminton Set
};

let count = 0;
for (const [id, imgs] of Object.entries(productImages)) {
  const res = db.products.updateOne(
    { _id: id },
    { $set: { images: imgs, updatedAt: new Date() } }
  );
  if (res.modifiedCount > 0 || res.matchedCount > 0) {
    count++;
  }
}

print("Successfully updated " + count + " products with high-resolution matching images.");

