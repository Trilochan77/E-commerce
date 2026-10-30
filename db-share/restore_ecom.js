// restore_ecom.js - drops and restores all collections of the 'ecom' database from the embedded data below.
// Run with: mongosh "mongodb://localhost:27017" restore_ecom.js
// WARNING: this script DROPS each collection before inserting. Do not run it on a database you care about.
const DATA = {};
DATA["categories"] = [
  {
    "_id": "C-01",
    "name": "Electronics"
  },
  {
    "_id": "C-02",
    "name": "Fashion"
  },
  {
    "_id": "C-03",
    "name": "Home & Kitchen"
  },
  {
    "_id": "C-04",
    "name": "Books"
  },
  {
    "_id": "C-05",
    "name": "Sports"
  }
];
DATA["products"] = [
  {
    "_id": "P-1001",
    "name": "Wireless Headphones X1",
    "description": "Bluetooth 5.3, ANC, 40h battery",
    "price": 2499,
    "categoryId": "C-01",
    "images": [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 48,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-30T08:40:21.780Z"
    },
    "_class": "com.ecom.product.entity.Product"
  },
  {
    "_id": "P-1002",
    "name": "Smartphone Z5 128GB",
    "description": "6.5in AMOLED, 50MP camera",
    "price": 14999,
    "categoryId": "C-01",
    "images": [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 29,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.550Z"
    },
    "_class": "com.ecom.product.entity.Product"
  },
  {
    "_id": "P-1003",
    "name": "Laptop Ultra 14",
    "description": "Ryzen 7, 16GB RAM, 512GB SSD",
    "price": 62990,
    "categoryId": "C-01",
    "images": [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 15,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.552Z"
    }
  },
  {
    "_id": "P-1004",
    "name": "Smartwatch Fit Pro",
    "description": "HR + SpO2, GPS, 10-day battery",
    "price": 3999,
    "categoryId": "C-01",
    "images": [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 60,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.553Z"
    }
  },
  {
    "_id": "P-1005",
    "name": "Bluetooth Speaker Boom",
    "description": "20W, IPX7 waterproof",
    "price": 1999,
    "categoryId": "C-01",
    "images": [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 80,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.554Z"
    }
  },
  {
    "_id": "P-1006",
    "name": "Tablet Tab A11 64GB",
    "description": "11in display, quad speakers, 8000mAh",
    "price": 12999,
    "categoryId": "C-01",
    "images": [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 28,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.555Z"
    }
  },
  {
    "_id": "P-1007",
    "name": "Mechanical Keyboard RGB",
    "description": "Hot-swap brown switches, PBT caps",
    "price": 3499,
    "categoryId": "C-01",
    "images": [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 45,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.556Z"
    }
  },
  {
    "_id": "P-1008",
    "name": "Drone SkyCam 4K",
    "description": "3-axis gimbal, 30-min flight, carry case",
    "price": 24990,
    "categoryId": "C-01",
    "images": [
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 12,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.557Z"
    }
  },
  {
    "_id": "P-2001",
    "name": "Men Running Shoes",
    "description": "Lightweight mesh, size 6-11",
    "price": 1799,
    "categoryId": "C-02",
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 100,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.558Z"
    }
  },
  {
    "_id": "P-2002",
    "name": "Denim Jacket Classic",
    "description": "Cotton denim, all sizes",
    "price": 2299,
    "categoryId": "C-02",
    "images": [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 40,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.560Z"
    }
  },
  {
    "_id": "P-2003",
    "name": "Women Handbag Tote",
    "description": "Vegan leather tote",
    "price": 1499,
    "categoryId": "C-02",
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 54,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:26:00.717Z"
    },
    "_class": "com.ecom.product.entity.Product"
  },
  {
    "_id": "P-2004",
    "name": "Sunglasses Aviator",
    "description": "UV400 polarized",
    "price": 999,
    "categoryId": "C-02",
    "images": [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 120,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.561Z"
    }
  },
  {
    "_id": "P-2005",
    "name": "Cotton Kurta Festive",
    "description": "Breathable cotton, sizes S-XXL",
    "price": 1199,
    "categoryId": "C-02",
    "images": [
      "https://images.unsplash.com/photo-1692170743549-ec52be9102eb?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 75,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.562Z"
    }
  },
  {
    "_id": "P-2006",
    "name": "Leather Wallet RFID",
    "description": "Genuine leather, 8 card slots",
    "price": 749,
    "categoryId": "C-02",
    "images": [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 140,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.563Z"
    }
  },
  {
    "_id": "P-2007",
    "name": "Sports Backpack 35L",
    "description": "Water-repellent, laptop sleeve",
    "price": 1599,
    "categoryId": "C-02",
    "images": [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 65,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.564Z"
    }
  },
  {
    "_id": "P-3001",
    "name": "Non-stick Cookware Set (5pc)",
    "description": "Induction compatible",
    "price": 2999,
    "categoryId": "C-03",
    "images": [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 35,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.565Z"
    }
  },
  {
    "_id": "P-3002",
    "name": "Air Fryer 4L",
    "description": "8 presets, 1500W",
    "price": 7490,
    "categoryId": "C-03",
    "images": [
      "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 25,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.566Z"
    }
  },
  {
    "_id": "P-3003",
    "name": "Cotton Bedsheet King",
    "description": "300TC cotton, 2 pillow covers",
    "price": 1299,
    "categoryId": "C-03",
    "images": [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 90,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.567Z"
    }
  },
  {
    "_id": "P-3004",
    "name": "LED Desk Lamp",
    "description": "Dimmable, USB charging port",
    "price": 899,
    "categoryId": "C-03",
    "images": [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 70,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.569Z"
    }
  },
  {
    "_id": "P-3005",
    "name": "Mixer Grinder 750W",
    "description": "3 jars, overload protection",
    "price": 3299,
    "categoryId": "C-03",
    "images": [
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 40,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.570Z"
    }
  },
  {
    "_id": "P-3006",
    "name": "Ceramic Dinner Set (18pc)",
    "description": "Chip-resistant glaze, serves 6",
    "price": 2499,
    "categoryId": "C-03",
    "images": [
      "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 30,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.571Z"
    }
  },
  {
    "_id": "P-3007",
    "name": "Room Heater Oil-Filled",
    "description": "13-fin, 2900W, thermostat",
    "price": 8990,
    "categoryId": "C-03",
    "images": [
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 18,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.571Z"
    }
  },
  {
    "_id": "P-4001",
    "name": "Atomic Habits (Paperback)",
    "description": "Self-help bestseller",
    "price": 499,
    "categoryId": "C-04",
    "images": [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 200,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.572Z"
    }
  },
  {
    "_id": "P-4002",
    "name": "DSA in Java (Guide)",
    "description": "Interview prep, 500 problems",
    "price": 799,
    "categoryId": "C-04",
    "images": [
      "https://images.unsplash.com/photo-1532012164546-f432f2e3dd45?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 150,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.573Z"
    }
  },
  {
    "_id": "P-4003",
    "name": "Notebook Set (3pc)",
    "description": "A5 dotted notebooks",
    "price": 349,
    "categoryId": "C-04",
    "images": [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 300,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.574Z"
    }
  },
  {
    "_id": "P-4004",
    "name": "Indian Polity Primer",
    "description": "UPSC-ready reference, latest edition",
    "price": 650,
    "categoryId": "C-04",
    "images": [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 120,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.575Z"
    }
  },
  {
    "_id": "P-4005",
    "name": "Kids Story Box (6 books)",
    "description": "Illustrated bedtime collection",
    "price": 899,
    "categoryId": "C-04",
    "images": [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 95,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.576Z"
    }
  },
  {
    "_id": "P-4006",
    "name": "Cookbook: 100 Curries",
    "description": "Regional classics with photos",
    "price": 599,
    "categoryId": "C-04",
    "images": [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 110,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.577Z"
    }
  },
  {
    "_id": "P-5001",
    "name": "Yoga Mat Pro 6mm",
    "description": "Anti-slip, carry strap",
    "price": 1099,
    "categoryId": "C-05",
    "images": [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 85,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.578Z"
    }
  },
  {
    "_id": "P-5002",
    "name": "Dumbbell Set 10kg",
    "description": "Adjustable plates",
    "price": 2199,
    "categoryId": "C-05",
    "images": [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 45,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.579Z"
    }
  },
  {
    "_id": "P-5003",
    "name": "Cricket Bat Kashmir",
    "description": "Full size, with cover",
    "price": 1599,
    "categoryId": "C-05",
    "images": [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 30,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.580Z"
    }
  },
  {
    "_id": "P-5004",
    "name": "Water Bottle 1L Steel",
    "description": "Vacuum insulated, 24h hot/cold",
    "price": 699,
    "categoryId": "C-05",
    "images": [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 180,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.581Z"
    }
  },
  {
    "_id": "P-5005",
    "name": "Football Size 5 Pro",
    "description": "Machine-stitched, all-weather",
    "price": 1299,
    "categoryId": "C-05",
    "images": [
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 70,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.582Z"
    }
  },
  {
    "_id": "P-5006",
    "name": "Skipping Rope Speed",
    "description": "Ball-bearing handles, adjustable",
    "price": 349,
    "categoryId": "C-05",
    "images": [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 160,
    "availability": true,
    "eligibleForReturn": false,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.583Z"
    }
  },
  {
    "_id": "P-5007",
    "name": "Badminton Set (2+shuttle)",
    "description": "Aluminium rackets, carry bag",
    "price": 1499,
    "categoryId": "C-05",
    "images": [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80"
    ],
    "stockQuantity": 55,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-29T16:01:01.646Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T20:05:15.585Z"
    }
  },
  {
    "_id": "P-DECF7989",
    "name": "IPhone 17",
    "description": "",
    "price": 79000,
    "categoryId": "C-01",
    "images": [
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-17-storage-select-202509-black?wid=5120&hei=2880&fmt=webp&qlt=90&.v=cVgyTFRHeEI2NnFsOEV6aTB4OG83NFVVTEF4WTZKMHBlZ3U4MnlNZ3c1azBHUk0xampKNG9lbGhBOGJDblFiazg5ZFJsR0hrQnFVeEVSbnU0TWlpU0xrMVI0NlJMSGE3di9kc01Wd2tWbmprVng1NUJWemlmcmcyb3RHc0wxY3g&traceId=1"
    ],
    "stockQuantity": 2,
    "availability": true,
    "eligibleForReturn": true,
    "createdAt": {
      "$date": "2026-10-30T08:51:36.670Z"
    },
    "updatedAt": {
      "$date": "2026-10-30T08:54:34.443Z"
    },
    "_class": "com.ecom.product.entity.Product"
  }
];
DATA["users"] = [
  {
    "_id": "U-ADMIN01",
    "name": "Trilochan",
    "email": "trilochan@nextgen.com",
    "passwordHash": "$2a$10$UJ/SvSrycbF6WbzpKJnXjeUIWVmk6Nhcc1tGoq5PfHNP9LcvS23ru",
    "role": "ADMIN",
    "createdAt": {
      "$date": "2026-10-30T16:13:32.829Z"
    },
    "_class": "com.ecom.user.entity.User"
  },
  {
    "_id": "U-USER01",
    "name": "Demo Customer",
    "email": "user@shop.com",
    "passwordHash": "$2a$10$v0dhVUIX7p0AF6mBrnuAwe46r.OGyTTm4VGEQeUd.J3iP32Nn.xf.",
    "role": "CUSTOMER",
    "createdAt": {
      "$date": "2026-10-30T16:20:14.192Z"
    },
    "_class": "com.ecom.user.entity.User"
  }
];
DATA["addresses"] = [
  {
    "_id": "A-83EFB11E",
    "userId": "U-101",
    "fullName": "Test User",
    "phone": "9876543210",
    "pincode": "751001",
    "addressLine": "123 Main St",
    "city": "Jatani",
    "state": "Odisha",
    "landmark": "India",
    "addressType": "HOME",
    "isDefault": true,
    "createdAt": {
      "$date": "2026-09-25T13:21:22.998Z"
    },
    "updatedAt": {
      "$date": "2026-09-25T13:45:01.560Z"
    },
    "_class": "com.ecom.user.entity.Address"
  },
  {
    "_id": "A-94EE005C",
    "userId": "U-101",
    "fullName": "Test User",
    "phone": "9876543210",
    "pincode": "751001",
    "addressLine": "123 Main St",
    "city": "Jatani",
    "state": "Odisha",
    "landmark": "India",
    "addressType": "HOME",
    "isDefault": false,
    "createdAt": {
      "$date": "2026-09-25T13:26:06.315Z"
    },
    "updatedAt": {
      "$date": "2026-09-25T13:45:01.446Z"
    },
    "_class": "com.ecom.user.entity.Address"
  },
  {
    "_id": "A-5700FE66",
    "userId": "U-15087753",
    "fullName": "Jitendra Nayak",
    "phone": "7689849904",
    "pincode": "752050",
    "addressLine": "Sandhapur,Jatni,752050",
    "city": "Jatani",
    "state": "Odisha",
    "landmark": "India",
    "addressType": "HOME",
    "isDefault": true,
    "createdAt": {
      "$date": "2026-09-25T13:26:25.827Z"
    },
    "updatedAt": {
      "$date": "2026-09-25T13:26:25.827Z"
    },
    "_class": "com.ecom.user.entity.Address"
  },
  {
    "_id": "A-47503877",
    "userId": "U-8968B9AD",
    "fullName": "Trilochan Sahoo",
    "phone": "8984357974",
    "pincode": "752050",
    "addressLine": "Sandhapur,Jatni,752050",
    "city": "Jatani",
    "state": "Odisha",
    "landmark": "India",
    "addressType": "HOME",
    "isDefault": true,
    "createdAt": {
      "$date": "2026-10-29T19:07:12.098Z"
    },
    "updatedAt": {
      "$date": "2026-10-29T19:07:12.098Z"
    },
    "_class": "com.ecom.user.entity.Address"
  }
];
DATA["carts"] = [
  {
    "_id": "C-81051CFC",
    "userId": "U-85782E03",
    "items": [],
    "totalAmount": 0,
    "updatedAt": {
      "$date": "2026-09-18T13:42:07.927Z"
    },
    "_class": "com.ecom.cart.entity.Cart"
  },
  {
    "_id": "C-115B36E3",
    "userId": "U-USER01",
    "items": [],
    "totalAmount": 0,
    "updatedAt": {
      "$date": "2026-09-18T13:42:31.293Z"
    },
    "_class": "com.ecom.cart.entity.Cart"
  },
  {
    "_id": "C-7946E420",
    "userId": "U-ADMIN01",
    "items": [],
    "totalAmount": 0,
    "updatedAt": {
      "$date": "2026-09-18T13:42:49.763Z"
    },
    "_class": "com.ecom.cart.entity.Cart"
  },
  {
    "_id": "C-1E045090",
    "userId": "U-9E358C55",
    "items": [],
    "_class": "com.ecom.order.entity.CartRef"
  },
  {
    "_id": "C-F8B93D8E",
    "userId": "U-15087753",
    "items": [],
    "_class": "com.ecom.order.entity.CartRef"
  },
  {
    "_id": "C-2EC405A6",
    "userId": "U-8968B9AD",
    "items": [
      {
        "productId": "P-1003",
        "quantity": 1,
        "unitPrice": 62990
      }
    ],
    "totalAmount": 62990,
    "updatedAt": {
      "$date": "2026-10-30T09:17:11.987Z"
    },
    "_class": "com.ecom.cart.entity.Cart"
  },
  {
    "_id": "C-0DDBD1C5",
    "userId": "U-D52CAFCA",
    "items": [],
    "totalAmount": 0,
    "updatedAt": {
      "$date": "2026-10-30T09:16:36.656Z"
    },
    "_class": "com.ecom.cart.entity.Cart"
  }
];
DATA["orders"] = [
  {
    "_id": "ORD-247E7DBF",
    "userId": "U-9E358C55",
    "items": [
      {
        "productId": "P-1001",
        "quantity": 1,
        "price": 2499
      }
    ],
    "subTotal": 2499,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 2499,
    "paymentMethod": "COD",
    "paymentStatus": "PAID",
    "orderStatus": "DELIVERED",
    "orderDate": {
      "$date": "2026-09-25T09:16:17.696Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-723315F2",
    "userId": "U-15087753",
    "items": [
      {
        "productId": "P-1001",
        "quantity": 1,
        "price": 2499
      }
    ],
    "subTotal": 2499,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 2499,
    "paymentMethod": "COD",
    "paymentStatus": "PAID",
    "orderStatus": "DELIVERED",
    "orderDate": {
      "$date": "2026-09-25T09:34:40.346Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-14D449FB",
    "userId": "U-15087753",
    "items": [
      {
        "productId": "P-1002",
        "quantity": 1,
        "price": 14999
      }
    ],
    "subTotal": 14999,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 14999,
    "paymentMethod": "COD",
    "paymentStatus": "PAID",
    "orderStatus": "CANCELLED",
    "orderDate": {
      "$date": "2026-09-25T09:44:40.471Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-56D7C56A",
    "userId": "U-15087753",
    "items": [
      {
        "productId": "P-1004",
        "quantity": 1,
        "price": 3999
      }
    ],
    "subTotal": 3999,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 3999,
    "paymentMethod": "UPI",
    "paymentStatus": "PAID",
    "orderStatus": "CANCELLED",
    "orderDate": {
      "$date": "2026-09-25T09:45:09.962Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-05D8DF2D",
    "userId": "U-15087753",
    "items": [
      {
        "productId": "P-1003",
        "quantity": 1,
        "price": 62990
      }
    ],
    "subTotal": 62990,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 62990,
    "paymentMethod": "COD",
    "paymentStatus": "PAID",
    "orderStatus": "CANCELLED",
    "addressId": "A-5700FE66",
    "shippingAddress": {
      "fullName": "Jitendra Nayak",
      "phone": "7689849904",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-09-25T13:26:36.548Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-6BB7DFC4",
    "userId": "U-15087753",
    "items": [
      {
        "productId": "P-1007",
        "quantity": 1,
        "price": 3499
      }
    ],
    "subTotal": 3499,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 3499,
    "paymentMethod": "COD",
    "paymentStatus": "PAID",
    "orderStatus": "CANCELLED",
    "addressId": "A-5700FE66",
    "shippingAddress": {
      "fullName": "Jitendra Nayak",
      "phone": "7689849904",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-09-25T13:27:58.355Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-EC261256",
    "userId": "U-15087753",
    "items": [
      {
        "productId": "P-1008",
        "quantity": 1,
        "price": 24990
      }
    ],
    "subTotal": 24990,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 24990,
    "paymentMethod": "COD",
    "paymentStatus": "PAID",
    "orderStatus": "CANCELLED",
    "addressId": "A-5700FE66",
    "shippingAddress": {
      "fullName": "Jitendra Nayak",
      "phone": "7689849904",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-09-25T13:28:35.800Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-4C98B758",
    "userId": "U-15087753",
    "items": [
      {
        "productId": "P-2001",
        "quantity": 1,
        "price": 1799
      }
    ],
    "subTotal": 1799,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 1799,
    "paymentMethod": "COD",
    "paymentStatus": "PAID",
    "orderStatus": "DELIVERED",
    "addressId": "A-5700FE66",
    "shippingAddress": {
      "fullName": "Jitendra Nayak",
      "phone": "7689849904",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-09-25T14:02:48.696Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-F474AD83",
    "userId": "U-8968B9AD",
    "items": [
      {
        "productId": "P-1001",
        "quantity": 1,
        "price": 2499
      }
    ],
    "subTotal": 2499,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 2499,
    "paymentMethod": "CARD",
    "paymentStatus": "PAID",
    "orderStatus": "DELIVERED",
    "addressId": "A-47503877",
    "shippingAddress": {
      "fullName": "Trilochan Sahoo",
      "phone": "8984357974",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-10-29T19:07:26.371Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-C5753F9C",
    "userId": "U-8968B9AD",
    "subTotal": 14999,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 14999,
    "paymentMethod": "FAIL",
    "paymentStatus": "FAILED",
    "orderStatus": "CANCELLED",
    "addressId": "A-47503877",
    "shippingAddress": {
      "fullName": "Trilochan Sahoo",
      "phone": "8984357974",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-10-29T19:46:53.168Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-CF47DA4A",
    "userId": "U-8968B9AD",
    "items": [
      {
        "productId": "P-1002",
        "quantity": 1,
        "price": 14999
      }
    ],
    "subTotal": 14999,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 14999,
    "paymentMethod": "CARD",
    "paymentStatus": "PAID",
    "orderStatus": "DELIVERED",
    "addressId": "A-47503877",
    "shippingAddress": {
      "fullName": "Trilochan Sahoo",
      "phone": "8984357974",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-10-29T19:46:59.706Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-E33BCF5D",
    "userId": "U-8968B9AD",
    "items": [
      {
        "productId": "P-2003",
        "quantity": 1,
        "price": 1499
      }
    ],
    "subTotal": 1499,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 1499,
    "paymentMethod": "CARD",
    "paymentStatus": "PAID",
    "orderStatus": "DELIVERED",
    "addressId": "A-47503877",
    "shippingAddress": {
      "fullName": "Trilochan Sahoo",
      "phone": "8984357974",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-10-29T20:26:00.697Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-3D2EF6A2",
    "userId": "U-8968B9AD",
    "items": [
      {
        "productId": "P-1001",
        "quantity": 1,
        "price": 2499
      }
    ],
    "subTotal": 2499,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 2499,
    "paymentMethod": "UPI",
    "paymentStatus": "PAID",
    "orderStatus": "DELIVERED",
    "addressId": "A-47503877",
    "shippingAddress": {
      "fullName": "Trilochan Sahoo",
      "phone": "8984357974",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-10-30T08:40:21.673Z"
    },
    "_class": "com.ecom.order.entity.Order"
  },
  {
    "_id": "ORD-42548CD9",
    "userId": "U-8968B9AD",
    "items": [
      {
        "productId": "P-DECF7989",
        "quantity": 8,
        "price": 79000
      }
    ],
    "subTotal": 632000,
    "pointsUsed": 0,
    "discountValue": 0,
    "payableAmount": 632000,
    "paymentMethod": "CARD",
    "paymentStatus": "PAID",
    "orderStatus": "SHIPPED",
    "addressId": "A-47503877",
    "shippingAddress": {
      "fullName": "Trilochan Sahoo",
      "phone": "8984357974",
      "pincode": "752050",
      "addressLine": "Sandhapur,Jatni,752050",
      "city": "Jatani",
      "state": "Odisha",
      "landmark": "India",
      "addressType": "HOME"
    },
    "orderDate": {
      "$date": "2026-10-30T08:54:34.435Z"
    },
    "_class": "com.ecom.order.entity.Order"
  }
];
DATA["return_requests"] = [
  {
    "_id": "RET-D17F7CF3",
    "userId": "U-9E358C55",
    "orderId": "ORD-247E7DBF",
    "productId": "P-1001",
    "quantity": 1,
    "reason": "hggdhdt",
    "claimedCondition": "LIKE_NEW",
    "estimatedReward": 1999,
    "verifiedCondition": "GOOD",
    "finalReward": 1499,
    "status": "APPROVED_FOR_REWARD",
    "adminNote": "",
    "createdAt": {
      "$date": "2026-09-25T09:20:27.136Z"
    },
    "updatedAt": {
      "$date": "2026-09-25T09:36:52.636Z"
    },
    "_class": "com.ecom.reward.entity.ReturnRequest"
  },
  {
    "_id": "RET-DDBC3CA9",
    "userId": "U-8968B9AD",
    "orderId": "ORD-3D2EF6A2",
    "productId": "P-1001",
    "quantity": 1,
    "reason": "jjhrgohjoi",
    "claimedCondition": "LIKE_NEW",
    "estimatedReward": 0,
    "returnType": "FULL_REFUND",
    "estimatedRefund": 2499,
    "refundStatus": "PENDING",
    "refundMethod": "NONE",
    "status": "REQUESTED",
    "createdAt": {
      "$date": "2026-10-30T08:45:07.323Z"
    },
    "updatedAt": {
      "$date": "2026-10-30T08:45:07.323Z"
    },
    "_class": "com.ecom.reward.entity.ReturnRequest"
  }
];
DATA["reward_wallets"] = [
  {
    "_id": "W-6972548B",
    "userId": "U-ADMIN01",
    "pointBalance": 0,
    "updatedAt": {
      "$date": "2026-10-30T16:13:33.014Z"
    },
    "_class": "com.ecom.user.entity.RewardWallet"
  },
  {
    "_id": "W-01579B5F",
    "userId": "U-USER01",
    "pointBalance": 0,
    "updatedAt": {
      "$date": "2026-10-30T16:20:14.595Z"
    },
    "_class": "com.ecom.user.entity.RewardWallet"
  }
];
DATA["reward_transactions"] = [];
DATA["user_activities"] = [
  {
    "_id": "ACT-824468FA",
    "userId": "U-ADMIN01",
    "type": "SEARCH",
    "keyword": "wireless",
    "timestamp": {
      "$date": "2026-09-18T14:11:33.032Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-B0374FA4",
    "userId": "U-9E358C55",
    "type": "PURCHASE",
    "orderId": "ORD-247E7DBF",
    "timestamp": {
      "$date": "2026-09-25T09:16:19.383Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-00921EB4",
    "userId": "U-15087753",
    "type": "PURCHASE",
    "orderId": "ORD-723315F2",
    "timestamp": {
      "$date": "2026-09-25T09:34:40.388Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-CEAE16D2",
    "userId": "U-15087753",
    "type": "VIEW",
    "productId": "P-1001",
    "categoryId": "C-01",
    "timestamp": {
      "$date": "2026-09-25T09:36:12.228Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-3170ED65",
    "userId": "U-15087753",
    "type": "PURCHASE",
    "orderId": "ORD-14D449FB",
    "timestamp": {
      "$date": "2026-09-25T09:44:40.510Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-FA21FC9B",
    "userId": "U-15087753",
    "type": "PURCHASE",
    "orderId": "ORD-56D7C56A",
    "timestamp": {
      "$date": "2026-09-25T09:45:10.002Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-6539C676",
    "userId": "U-15087753",
    "type": "PURCHASE",
    "orderId": "ORD-05D8DF2D",
    "timestamp": {
      "$date": "2026-09-25T13:26:36.813Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-440DA5C4",
    "userId": "U-15087753",
    "type": "PURCHASE",
    "orderId": "ORD-6BB7DFC4",
    "timestamp": {
      "$date": "2026-09-25T13:27:58.373Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-E6AA372D",
    "userId": "U-15087753",
    "type": "PURCHASE",
    "orderId": "ORD-EC261256",
    "timestamp": {
      "$date": "2026-09-25T13:28:35.816Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-9180F248",
    "userId": "U-15087753",
    "type": "PURCHASE",
    "orderId": "ORD-4C98B758",
    "timestamp": {
      "$date": "2026-09-25T14:02:49.209Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-A8E99087",
    "userId": "U-8968B9AD",
    "type": "PURCHASE",
    "orderId": "ORD-F474AD83",
    "timestamp": {
      "$date": "2026-10-29T19:07:27.655Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-E0C05CB0",
    "userId": "U-8968B9AD",
    "type": "PURCHASE",
    "orderId": "ORD-CF47DA4A",
    "timestamp": {
      "$date": "2026-10-29T19:46:59.907Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-12FAD892",
    "userId": "U-8968B9AD",
    "type": "VIEW",
    "productId": "P-2005",
    "categoryId": "C-02",
    "timestamp": {
      "$date": "2026-10-29T19:59:07.988Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-9B1D0092",
    "userId": "U-8968B9AD",
    "type": "VIEW",
    "productId": "P-2005",
    "categoryId": "C-02",
    "timestamp": {
      "$date": "2026-10-29T20:06:06.911Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-48D856F6",
    "userId": "U-8968B9AD",
    "type": "VIEW",
    "productId": "P-2003",
    "categoryId": "C-02",
    "timestamp": {
      "$date": "2026-10-29T20:23:38.300Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-256097BF",
    "userId": "U-8968B9AD",
    "type": "PURCHASE",
    "orderId": "ORD-E33BCF5D",
    "timestamp": {
      "$date": "2026-10-29T20:26:00.752Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-67FBADB1",
    "userId": "U-8968B9AD",
    "type": "VIEW",
    "productId": "P-1001",
    "categoryId": "C-01",
    "timestamp": {
      "$date": "2026-10-30T08:38:50.186Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-8A08B5EA",
    "userId": "U-8968B9AD",
    "type": "PURCHASE",
    "orderId": "ORD-3D2EF6A2",
    "timestamp": {
      "$date": "2026-10-30T08:40:21.922Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  },
  {
    "_id": "ACT-291BEBD7",
    "userId": "U-8968B9AD",
    "type": "PURCHASE",
    "orderId": "ORD-42548CD9",
    "timestamp": {
      "$date": "2026-10-30T08:54:34.457Z"
    },
    "_class": "com.ecom.recommendation.entity.UserActivity"
  }
];
const target = db.getSiblingDB('ecom');
for (const name of Object.keys(DATA)) {
  const docs = EJSON.deserialize(DATA[name]);
  const col = target.getCollection(name);
  col.drop();
  if (docs.length) col.insertMany(docs);
  print(name + ': restored ' + docs.length + ' docs');
}