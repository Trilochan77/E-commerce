const updates = [
  // 1. boAt Airdopes 141 ANC TWS Earbuds -> True wireless earbuds in open case
  {
    id: 'P-1304',
    name: 'boAt Airdopes 141 ANC TWS Earbuds',
    brand: 'boAt',
    image: '/assets/products/tws_boat_airdopes.jpg',
    images: ['/assets/products/tws_boat_airdopes.jpg']
  },
  // 2. OnePlus Bullets Wireless Z2 ANC Neckband -> True wireless sports neckband
  {
    id: 'P-1401',
    name: 'OnePlus Bullets Wireless Z2 ANC Neckband',
    brand: 'OnePlus',
    image: '/assets/products/neckband_oneplus.jpg',
    images: ['/assets/products/neckband_oneplus.jpg']
  },
  // 3. Realme Buds Wireless 3 Neckband Earphones -> True wireless sports neckband
  {
    id: 'P-1402',
    name: 'Realme Buds Wireless 3 Neckband Earphones',
    brand: 'Realme',
    image: '/assets/products/neckband_realme.jpg',
    images: ['/assets/products/neckband_realme.jpg']
  },
  // 4. boAt Rockerz 255 Pro+ Wireless Bluetooth Neckband -> True wireless sports neckband
  {
    id: 'P-1403',
    name: 'boAt Rockerz 255 Pro+ Wireless Bluetooth Neckband',
    brand: 'boAt',
    image: '/assets/products/neckband_boat.jpg',
    images: ['/assets/products/neckband_boat.jpg']
  },
  // 5. Sony WI-C100 Wireless in-Ear Bluetooth Neckband -> True wireless in-ear neckband
  {
    id: 'P-1404',
    name: 'Sony WI-C100 Wireless in-Ear Bluetooth Neckband',
    brand: 'Sony',
    image: '/assets/products/neckband_sony.jpg',
    images: ['/assets/products/neckband_sony.jpg']
  },
  // 6. Boult Audio Curve ANC Wireless Bluetooth Neckband -> True wireless sports neckband
  {
    id: 'P-1405',
    name: 'Boult Audio Curve ANC Wireless Bluetooth Neckband',
    brand: 'Boult',
    image: '/assets/products/neckband_boult.jpg',
    images: ['/assets/products/neckband_boult.jpg']
  },
  // 7. Noise Tune Charge Bluetooth Wireless Neckband -> True wireless sports neckband
  {
    id: 'P-1406',
    name: 'Noise Tune Charge Bluetooth Wireless Neckband',
    brand: 'Noise',
    image: '/assets/products/neckband_noise.jpg',
    images: ['/assets/products/neckband_noise.jpg']
  },
  // 8. Marshall Emberton II Portable Bluetooth Speaker -> Authentic Marshall Speaker
  {
    id: 'P-1306',
    name: 'Marshall Emberton II Portable Bluetooth Speaker',
    brand: 'Marshall',
    image: 'https://images.unsplash.com/photo-1725016934951-5acd118169de?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1725016934951-5acd118169de?auto=format&fit=crop&w=600&q=80']
  },
  // 9. Sony Wireless Headphones X1 -> Authentic Sony WH-1000XM Over-Ear Headphones with gold Sony logo
  {
    id: 'P-1001',
    name: 'Wireless Headphones X1',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80']
  },
  // 10. Apple AirPods Pro (2nd Generation with MagSafe USB-C) -> Authentic AirPods Pro with Apple box
  {
    id: 'P-1302',
    name: 'Apple AirPods Pro (2nd Generation with MagSafe USB-C)',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80']
  },
  // 11. JBL Flip 6 Portable Waterproof Bluetooth Speaker -> Authentic JBL cylinder speaker
  {
    id: 'P-1303',
    name: 'JBL Flip 6 Portable Waterproof Bluetooth Speaker',
    brand: 'JBL',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80']
  },
  // 12. DSA in Java (Guide) -> Clean stack of computer science books (fixes 404)
  {
    id: 'P-4002',
    name: 'DSA in Java (Guide)',
    brand: "O'Reilly Media",
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80']
  },
  // 13. Apple IPhone 17 -> Clean studio Apple iPhone (fixes broken Apple CDN)
  {
    id: 'P-DECF7989',
    name: 'IPhone 17',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80']
  }
];

updates.forEach(item => {
  const res = db.products.updateOne(
    { $or: [{ id: item.id }, { _id: item.id }, { productId: item.id }] },
    {
      $set: {
        brand: item.brand,
        image: item.image,
        images: item.images
      }
    }
  );
  print(`[${item.id}] ${item.name} -> ${item.image} (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);
});
print('Finished updating images.');
