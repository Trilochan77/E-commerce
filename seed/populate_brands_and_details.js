// Populate Brands, Detailed Descriptions, Highlights, and Specifications for all 59 products
db = db.getSiblingDB("ecom");

const updates = [
  // --- Electronics (C-01): Original Seed ---
  {
    id: "P-1001",
    brand: "Sony",
    description: "Premium over-ear wireless headphones engineered with Sony's industry-leading Active Noise Cancellation (ANC), custom 40mm HD drivers, and up to 40 hours of continuous high-fidelity audio playback. Features multipoint Bluetooth 5.3 and crystal-clear hands-free calling with beamforming microphones.",
    highlights: ["Industry-leading Active Noise Cancellation", "Up to 40 hours battery life with quick charge", "Bluetooth 5.3 with multipoint pairing", "Ultra-soft memory foam earcups for all-day comfort"],
    specifications: { "Brand": "Sony", "Model": "WH-1000X1", "Connectivity": "Bluetooth 5.3 / 3.5mm Aux", "Battery Life": "40 Hours", "Driver Size": "40mm", "Microphone": "Built-in Beamforming Dual Mic", "Warranty": "1 Year Sony India Warranty" }
  },
  {
    id: "P-1003",
    brand: "Dell",
    description: "Ultra-sleek 14-inch professional laptop powered by AMD Ryzen 7 octa-core processor, 16GB high-speed LPDDR5 RAM, and 512GB NVMe PCIe 4.0 SSD storage. Features an anti-glare FHD IPS display with 100% sRGB color gamut and all-day 60Whr battery life.",
    highlights: ["AMD Ryzen 7 7730U Octa-Core Processor", "16GB LPDDR5 RAM & 512GB Gen4 NVMe SSD", "14-inch FHD+ 16:10 Anti-Glare Display", "Precision backlit keyboard and fingerprint reader"],
    specifications: { "Brand": "Dell", "Model": "Inspiron 14 Ultra", "Processor": "AMD Ryzen 7 7730U", "RAM": "16GB LPDDR5", "Storage": "512GB PCIe 4.0 NVMe SSD", "Display": "14-inch FHD+ (1920x1200) IPS", "Weight": "1.42 kg", "Warranty": "1 Year Onsite Hardware Service" }
  },
  {
    id: "P-1004",
    brand: "Noise",
    description: "Feature-packed smart fitness watch featuring a vivid 1.85-inch HD curved touch display, continuous heart rate and SpO2 blood oxygen tracking, built-in dual-satellite GPS, and up to 10 days of battery life on a single charge. Rated 5ATM water-resistant for swimming and outdoor adventures.",
    highlights: ["1.85-inch HD Curved Touch Display", "Real-time HR, SpO2, and Sleep tracking", "Built-in GPS with 100+ sports modes", "Up to 10-day battery life & 5ATM water resistance"],
    specifications: { "Brand": "Noise", "Model": "Fit Pro 4 Max", "Display": "1.85-inch HD (240x284)", "Sensors": "Optical Heart Rate, SpO2, Accelerometer, GPS", "Water Resistance": "5ATM (up to 50 meters)", "Battery": "300mAh (Up to 10 Days)", "Warranty": "1 Year Brand Warranty" }
  },
  {
    id: "P-1005",
    brand: "JBL",
    description: "Rugged and compact portable Bluetooth speaker delivering 20W RMS punchy JBL Pro Sound with deep dual passive radiators. Built with an IPX7 fully waterproof and dustproof exterior, perfect for poolside, beach, or hiking. Up to 12 hours of party playtime.",
    highlights: ["20W RMS signature JBL Pro Sound", "IPX7 fully waterproof and ruggedized casing", "Up to 12 hours playtime on single charge", "PartyBoost support to pair multiple speakers"],
    specifications: { "Brand": "JBL", "Model": "Boom Go 2", "Output Power": "20W RMS", "Bluetooth": "Version 5.1", "Waterproof Rating": "IPX7", "Battery Capacity": "4800mAh (12h Playback)", "Warranty": "1 Year Brand Warranty" }
  },
  {
    id: "P-1006",
    brand: "Samsung",
    description: "Versatile 11-inch Android entertainment tablet featuring a 90Hz WQXGA display, quad Dolby Atmos surround speakers, and massive 8,000mAh battery with 15W fast charging. Powered by an octa-core chipset with 64GB expandable storage up to 1TB via microSD.",
    highlights: ["11-inch 90Hz WQXGA Immersive Screen", "Quad Stereo Speakers with Dolby Atmos", "Massive 8000mAh All-Day Battery", "Expandable microSD storage up to 1TB"],
    specifications: { "Brand": "Samsung", "Model": "Galaxy Tab A11", "Display": "11.0-inch 90Hz WQXGA LCD", "RAM / Storage": "4GB RAM / 64GB Storage", "Battery": "8000mAh", "Operating System": "One UI based on Android 14", "Warranty": "1 Year Manufacturer Warranty" }
  },
  {
    id: "P-1007",
    brand: "Logitech",
    description: "High-performance mechanical gaming keyboard with tactile mechanical switches, per-key customizable LIGHTSYNC RGB backlighting, durable aircraft-grade aluminum alloy top plate, and dedicated multimedia control keys with precision volume roller.",
    highlights: ["Tactile mechanical switches tested to 70M clicks", "Per-key customizable 16.8M color RGB lighting", "Aircraft-grade brushed aluminum top plate", "USB passthrough port and braided cable"],
    specifications: { "Brand": "Logitech", "Model": "G-Pro Mechanical RGB", "Switch Type": "Tactile Mechanical Switches", "Keycaps": "Double-shot PBT Keycaps", "Backlight": "Per-Key LIGHTSYNC RGB", "Connectivity": "Detachable Braided USB-A", "Warranty": "2 Year Limited Hardware Warranty" }
  },
  {
    id: "P-1008",
    brand: "DJI",
    description: "Ultralight foldable camera drone equipped with a 3-axis motorized gimbal and 4K HDR 60fps video sensor. Features 31 minutes of flight time per battery, 10km HD video transmission with OcuSync 3.0, and Level 5 wind resistance with automated Return-to-Home safety.",
    highlights: ["4K HDR video with 3-axis motorized gimbal", "31-minute max flight time per battery", "10km HD low-latency video transmission", "Automated QuickShots & Smart Return to Home"],
    specifications: { "Brand": "DJI", "Model": "SkyCam Mini 4K", "Camera Sensor": "1/2.3-inch CMOS, 12MP", "Video Resolution": "4K at 60fps, 2.7K, 1080p", "Takeoff Weight": "< 249 grams", "Flight Time": "Up to 31 Minutes", "Warranty": "1 Year DJI Official Warranty" }
  },
  {
    id: "P-DECF7989",
    brand: "Apple",
    description: "Apple iPhone 17 engineered with the cutting-edge A19 Pro Bionic chip, Super Retina XDR OLED ProMotion 120Hz display, and advanced 48MP triple-lens Fusion camera system with 5x optical telephoto zoom. Finished in aerospace-grade titanium with Ceramic Shield front glass.",
    highlights: ["A19 Pro Bionic Chip with 6-core GPU", "Super Retina XDR OLED with 120Hz ProMotion", "48MP Fusion Camera with 5x Telephoto Zoom", "Titanium design with USB-C and Action button"],
    specifications: { "Brand": "Apple", "Model": "iPhone 17", "Processor": "A19 Pro Bionic Chip", "Display": "6.3-inch Super Retina XDR OLED", "Camera": "48MP Main + 48MP Ultra Wide + 12MP 5x Telephoto", "Storage": "256GB", "Warranty": "1 Year Apple Limited Warranty" }
  },

  // --- Electronics (C-01): Flagship Smartphones ---
  {
    id: "P-1101",
    brand: "Samsung",
    description: "Samsung Galaxy S24 Ultra 5G featuring built-in Galaxy AI, Snapdragon 8 Gen 3 for Galaxy, 200MP quad camera setup with 100x Space Zoom, titanium frame, flat 6.8-inch Dynamic AMOLED 2X 120Hz display, and integrated S-Pen stylus.",
    highlights: ["Built-in Galaxy AI productivity tools", "200MP Quad Camera with 100x Space Zoom", "Snapdragon 8 Gen 3 Mobile Platform", "Titanium frame with integrated S-Pen stylus"],
    specifications: { "Brand": "Samsung", "Model": "Galaxy S24 Ultra 5G", "RAM / Storage": "12GB RAM / 256GB Storage", "Processor": "Snapdragon 8 Gen 3 for Galaxy", "Display": "6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits", "Battery": "5000mAh with 45W Fast Charging", "Warranty": "1 Year Samsung India Warranty" }
  },
  {
    id: "P-1102",
    brand: "Apple",
    description: "Apple iPhone 16 Pro Max 256GB designed in Grade 5 titanium with thinner borders on the largest 6.9-inch Super Retina XDR display. Powered by the A18 Pro chip with hardware-accelerated ray tracing, Camera Control capacitive button, and 4K 120fps Dolby Vision video recording.",
    highlights: ["A18 Pro Chip with 16-core Neural Engine", "6.9-inch Super Retina XDR OLED Display", "Camera Control button and 48MP Fusion camera", "All-day battery life with 4K 120fps Dolby Vision"],
    specifications: { "Brand": "Apple", "Model": "iPhone 16 Pro Max", "Storage": "256GB NVMe", "Processor": "A18 Pro Bionic", "Display": "6.9-inch OLED (2868x1320) ProMotion", "Camera": "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto", "Warranty": "1 Year Apple Limited Warranty" }
  },
  {
    id: "P-1103",
    brand: "OnePlus",
    description: "OnePlus 12 5G in Flowy Emerald featuring Qualcomm Snapdragon 8 Gen 3, 16GB LPDDR5X RAM, 512GB UFS 4.0 storage, 4th Gen Hasselblad Camera system, and 5400mAh battery with 100W SUPERVOOC cable charging and 50W AIRVOOC wireless charging.",
    highlights: ["Snapdragon 8 Gen 3 & 16GB LPDDR5X RAM", "4th Gen Hasselblad Camera with Sony LYT-808", "2K 120Hz ProXDR Display with 4500 nits peak", "100W SUPERVOOC cable + 50W wireless charging"],
    specifications: { "Brand": "OnePlus", "Model": "OnePlus 12 5G", "Color": "Flowy Emerald", "RAM / Storage": "16GB RAM / 512GB Storage", "Battery": "5400mAh (100W Wired / 50W Wireless)", "Display": "6.82-inch 2K 120Hz AMOLED", "Warranty": "1 Year OnePlus Official Warranty" }
  },
  {
    id: "P-1104",
    brand: "Google",
    description: "Google Pixel 9 Pro 5G with Google Tensor G4 chipset and 16GB RAM for advanced on-device Gemini AI models. Equipped with a triple pro camera system with 30x Super Res Zoom, Super Actua display, and 7 years of guaranteed OS and security updates.",
    highlights: ["Google Tensor G4 Chip with Gemini Live AI", "Triple Pro Rear Camera with 30x Super Res Zoom", "6.3-inch Super Actua LTPO OLED (1-120Hz)", "7 Years of guaranteed Android OS & Feature Drops"],
    specifications: { "Brand": "Google", "Model": "Pixel 9 Pro 5G", "Storage": "256GB UFS 3.1", "RAM": "16GB LPDDR5X", "Cameras": "50MP Main + 48MP Ultrawide + 48MP 5x Telephoto", "Security": "Titan M2 Security Chip", "Warranty": "1 Year Google India Warranty" }
  },
  {
    id: "P-1105",
    brand: "Xiaomi",
    description: "Redmi Note 13 Pro+ 5G featuring an ultra-clear 200MP OIS camera, 1.5K 120Hz curved AMOLED display, MediaTek Dimensity 7200-Ultra processor, IP68 water/dust resistance, and blazing-fast 120W HyperCharge that fuels 100% in just 19 minutes.",
    highlights: ["200MP Ultra-High Res Camera with OIS", "120W HyperCharge: 100% in 19 minutes", "1.5K 120Hz 3D Curved AMOLED Display", "IP68 Flagship Water and Dust Resistance"],
    specifications: { "Brand": "Xiaomi", "Model": "Redmi Note 13 Pro+ 5G", "Processor": "MediaTek Dimensity 7200-Ultra", "RAM / Storage": "8GB RAM / 256GB Storage", "Charging": "120W In-box HyperCharge (5000mAh)", "Protection": "Corning Gorilla Glass Victus", "Warranty": "1 Year Brand Warranty" }
  },
  {
    id: "P-1106",
    brand: "Realme",
    description: "Realme GT 6 5G powered by the flagship Snapdragon 8s Gen 3 chipset, Sony LYT-808 OIS camera, 6000-nit ultra-bright 8T LTPO display, and 120W SUPERVOOC charging with 5500mAh dual-cell battery. Finished in luxurious Fluid Silver reflective glass.",
    highlights: ["Snapdragon 8s Gen 3 4nm Flagship Processor", "Sony LYT-808 50MP Camera with OIS", "6000 nits Peak Brightness 8T LTPO Display", "120W SUPERVOOC Charge with 5500mAh Battery"],
    specifications: { "Brand": "Realme", "Model": "Realme GT 6 5G", "Color": "Fluid Silver", "RAM / Storage": "12GB RAM / 256GB Storage", "Display": "6.78-inch 1.5K 120Hz 8T LTPO", "Battery": "5500mAh", "Warranty": "1 Year Realme Warranty" }
  },

  // --- Electronics (C-01): Laptops ---
  {
    id: "P-1201",
    brand: "Apple",
    description: "Apple MacBook Air 15.3-inch powered by the breakthrough M3 chip. Delivering lightning-fast performance in an impossibly thin aluminum enclosure with up to 18 hours of battery life, Liquid Retina display, MagSafe 3 charging, and silent fanless operation.",
    highlights: ["Apple M3 Chip with 8-core CPU and 10-core GPU", "15.3-inch Liquid Retina Display with 500 nits", "Up to 18 hours battery life with MagSafe 3", "1080p FaceTime HD camera with 6-speaker spatial audio"],
    specifications: { "Brand": "Apple", "Model": "MacBook Air 15 (M3)", "Color": "Midnight", "Memory": "16GB Unified Memory", "Storage": "512GB SSD", "Weight": "1.51 kg", "Warranty": "1 Year Apple Care Warranty" }
  },
  {
    id: "P-1202",
    brand: "Dell",
    description: "Dell XPS 14 OLED crafted from CNC machined aluminum and Gorilla Glass. Features Intel Core Ultra 7 155H processor with integrated AI NPU, 32GB LPDDR5X RAM, 1TB PCIe NVMe SSD, and gorgeous 3.2K InfinityEdge 120Hz OLED touch display.",
    highlights: ["Intel Core Ultra 7 155H with Intel AI Boost NPU", "3.2K (3200x2000) 120Hz OLED Touchscreen Display", "32GB LPDDR5X 7467MHz RAM & 1TB Gen4 SSD", "CNC Machined Aluminum chassis with glass touchpad"],
    specifications: { "Brand": "Dell", "Model": "XPS 14 (9440)", "Processor": "Intel Core Ultra 7 155H", "RAM": "32GB LPDDR5X", "Storage": "1TB M.2 PCIe NVMe SSD", "Display": "14.5-inch 3.2K OLED 120Hz Touch", "Weight": "1.68 kg", "Warranty": "1 Year Premium Support Plus" }
  },
  {
    id: "P-1203",
    brand: "ASUS",
    description: "ASUS ROG Zephyrus G16 premium gaming laptop with Intel Core Ultra 9 185H, NVIDIA GeForce RTX 4070 8GB GDDR6 graphics, 32GB LPDDR5X RAM, and world's first 2.5K 240Hz ROG Nebula OLED display with 0.2ms response time and G-SYNC.",
    highlights: ["Intel Core Ultra 9 185H & NVIDIA RTX 4070 8GB", "16-inch 2.5K 240Hz ROG Nebula OLED Display", "Slash Lighting CNC aluminum lid design", "ROG Intelligent Cooling with liquid metal & vapor chamber"],
    specifications: { "Brand": "ASUS", "Model": "ROG Zephyrus G16 GU605", "GPU": "NVIDIA GeForce RTX 4070 8GB GDDR6", "RAM / Storage": "32GB LPDDR5X / 1TB PCIe 4.0 SSD", "Display": "16-inch 2.5K OLED, 240Hz / 0.2ms, DCI-P3 100%", "Weight": "1.85 kg", "Warranty": "1 Year International Warranty" }
  },
  {
    id: "P-1204",
    brand: "HP",
    description: "HP Pavilion Plus 14 equipped with AMD Ryzen 7 7840U processor featuring Radeon 780M graphics, 16GB LPDDR5x RAM, 1TB PCIe NVMe SSD, 2.8K 120Hz OLED display with IMAX Enhanced certification, and 5MP IR webcam with privacy shutter.",
    highlights: ["AMD Ryzen 7 7840U with Radeon 780M Graphics", "14-inch 2.8K (2880x1800) 120Hz OLED Display", "16GB LPDDR5x RAM & 1TB PCIe Gen4 NVMe SSD", "B&O Audio tuning and 5MP IR camera with shutter"],
    specifications: { "Brand": "HP", "Model": "Pavilion Plus 14-ey0000", "Processor": "AMD Ryzen 7 7840U (up to 5.1GHz)", "Display": "14-inch 2.8K OLED, 120Hz, HDR 500 nits", "Battery": "68Wh Li-ion polymer with Fast Charge", "Weight": "1.38 kg", "Warranty": "1 Year HP Onsite Warranty" }
  },
  {
    id: "P-1205",
    brand: "Lenovo",
    description: "Lenovo IdeaPad Slim 5 thin and light laptop powered by Intel Core Ultra 5 125H processor, 16GB RAM, 512GB SSD, 14-inch WUXGA 100% sRGB display, military-grade MIL-STD-810H durability, and rapid-charge 57Wh battery.",
    highlights: ["Intel Core Ultra 5 125H with AI accelerator", "14-inch WUXGA (1920x1200) IPS 100% sRGB Display", "Military-grade MIL-STD-810H tested durability", "FHD IR camera with physical privacy shutter"],
    specifications: { "Brand": "Lenovo", "Model": "IdeaPad Slim 5 14IMH9", "Processor": "Intel Core Ultra 5 125H", "RAM / Storage": "16GB LPDDR5X / 512GB SSD M.2", "Audio": "Dual 2W stereo speakers with Dolby Audio", "Weight": "1.46 kg", "Warranty": "1 Year Lenovo Courier/Carry-in" }
  },
  {
    id: "P-1206",
    brand: "Acer",
    description: "Acer Predator Helios Neo 16 high-performance gaming rig with 14th Gen Intel Core i7-14700HX, NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP), 16GB DDR5 RAM, 1TB Gen4 SSD, and 16-inch WQXGA 165Hz IPS display with 100% sRGB.",
    highlights: ["14th Gen Intel Core i7-14700HX (20 cores, 28 threads)", "NVIDIA GeForce RTX 4060 8GB (Full 140W TGP)", "16-inch WQXGA 165Hz 3ms G-SYNC IPS Display", "5th Gen AeroBlade 3D metal fans & liquid metal thermal grease"],
    specifications: { "Brand": "Acer", "Model": "Predator Helios Neo 16 PHN16", "GPU": "NVIDIA RTX 4060 8GB (140W TGP)", "Display": "16-inch WQXGA (2560x1600) 165Hz IPS", "RAM / Storage": "16GB DDR5 5600MHz / 1TB PCIe Gen4 SSD", "Weight": "2.6 kg", "Warranty": "1 Year Acer India Warranty" }
  },

  // --- Electronics (C-01): Audio & Speakers ---
  {
    id: "P-1301",
    brand: "Sony",
    description: "Sony WF-1000XM5 flagship true wireless earbuds with Integrated Processor V2 and HD Noise Cancelling Processor QN2e. Featuring custom Dynamic Driver X for rich vocals, LDAC High-Resolution Audio Wireless, bone-conduction AI voice pickup, and 24 hours total battery.",
    highlights: ["Best-in-class Active Noise Cancellation with dual processors", "Dynamic Driver X for rich bass and detailed vocals", "Hi-Res Audio Wireless with LDAC and DSEE Extreme", "Up to 24 hours total battery with Qi wireless charging case"],
    specifications: { "Brand": "Sony", "Model": "WF-1000XM5", "Driver": "Dynamic Driver X (8.4mm)", "Bluetooth": "Version 5.3 (Multipoint)", "Codec Support": "SBC, AAC, LDAC, LC3", "Water Resistance": "IPX4 splash resistant", "Warranty": "1 Year Sony India Warranty" }
  },
  {
    id: "P-1302",
    brand: "Apple",
    description: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C) powered by the H2 chip. Delivers up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking, and Conversation Awareness.",
    highlights: ["Apple H2 headphone chip with Adaptive Audio", "2x improved Active Noise Cancellation & Transparency mode", "Personalized Spatial Audio with dynamic head tracking", "MagSafe Case (USB-C) with speaker and lanyard loop"],
    specifications: { "Brand": "Apple", "Model": "AirPods Pro (2nd Gen)", "Chip": "Apple H2 in earbuds, Apple U1 in case", "Battery": "Up to 6 hours (30 hours with case)", "Charging": "USB-C, MagSafe, Apple Watch charger, Qi", "Sweat/Water Resistance": "IP54 dust, sweat, and water resistant", "Warranty": "1 Year Apple Limited Warranty" }
  },
  {
    id: "P-1303",
    brand: "JBL",
    description: "JBL Flip 6 portable 2-way speaker system with racetrack-shaped woofer, separate tweeter, and dual pumping passive radiators for powerful room-filling sound. Features IP67 waterproof and dustproof build with 12 hours of uninterrupted playback.",
    highlights: ["2-way speaker system with racetrack woofer and tweeter", "IP67 waterproof and dustproof outdoor durability", "Up to 12 hours playtime on single charge", "JBL PartyBoost support to link stereo sound"],
    specifications: { "Brand": "JBL", "Model": "Flip 6", "Frequency Response": "63 Hz - 20 kHz", "Output Power": "20W RMS woofer + 10W RMS tweeter", "Bluetooth": "Version 5.1", "Dimensions": "17.8 x 6.8 x 7.2 cm", "Warranty": "1 Year Brand Warranty" }
  },
  {
    id: "P-1304",
    brand: "boAt",
    description: "boAt Airdopes 141 ANC true wireless earbuds featuring 32dB Active Noise Cancellation, BEAST mode 50ms low latency for gaming, ASAP Fast Charge (10 mins = 150 mins playtime), 42 hours total playback, and ENx quad mics for clear calls.",
    highlights: ["Up to 32dB Active Noise Cancellation", "42 Hours total playback with case", "BEAST Mode 50ms low latency for mobile gaming", "ASAP Fast Charge: 10 mins = 150 mins playtime"],
    specifications: { "Brand": "boAt", "Model": "Airdopes 141 ANC", "Bluetooth": "Version 5.3", "Drivers": "10mm dynamic drivers", "Water Resistance": "IPX5 water and sweat resistant", "Playback": "Up to 42 hours", "Warranty": "1 Year boAt Warranty" }
  },
  {
    id: "P-1305",
    brand: "Bose",
    description: "Bose SoundLink Flex portable outdoor Bluetooth speaker engineered with custom transducer and PositionIQ technology that automatically optimizes sound orientation. Features IP67 waterproof/dustproof rating, floats in water, and resists drops.",
    highlights: ["PositionIQ technology auto-detects orientation for optimal sound", "IP67 waterproof, dustproof, and floats on water", "Up to 12 hours battery life per charge", "Rigid silicone body with powder-coated steel grille"],
    specifications: { "Brand": "Bose", "Model": "SoundLink Flex", "Bluetooth": "Version 4.2 (Up to 9m range)", "Battery Life": "Up to 12 Hours (USB-C)", "Inputs": "USB-C audio and charging", "Weight": "590 grams", "Warranty": "1 Year Bose Official Warranty" }
  },
  {
    id: "P-1306",
    brand: "Marshall",
    description: "Marshall Emberton II compact portable Bluetooth speaker delivering 360° True Stereophonic multidirectional sound. Boasts 30+ hours of portable playtime on a single charge, IP67 dust and water resistance, and classic vintage Marshall brass detailing.",
    highlights: ["Signature 360° True Stereophonic multidirectional audio", "30+ Hours of continuous portable playtime", "IP67 dust and water-resistant rugged build", "Stack Mode to connect multiple Emberton II speakers"],
    specifications: { "Brand": "Marshall", "Model": "Emberton II", "Amplifiers": "Two 10W Class D amplifiers", "Drivers": "Two 2-inch 10W full-range drivers", "Max SPL": "87 dB @ 1m", "Weight": "700 grams", "Warranty": "1 Year Official Warranty" }
  },

  // --- Electronics (C-01): Neckbands ---
  {
    id: "P-1401",
    brand: "OnePlus",
    description: "OnePlus Bullets Wireless Z2 ANC neckband with 45dB hybrid active noise cancellation, large 12.4mm deep bass dynamic drivers, anti-distortion audio technology, IP55 sweat resistance, and 28 hours battery with 10-minute ultra-fast warp charge.",
    highlights: ["45dB Hybrid Active Noise Cancellation", "12.4mm large dynamic drivers with bass boost", "Up to 28 hours battery life on single charge", "10-minute charge gives 20 hours of playtime"],
    specifications: { "Brand": "OnePlus", "Model": "Bullets Wireless Z2 ANC", "Drivers": "12.4mm Dynamic", "Noise Cancellation": "45dB Hybrid ANC", "Fast Charge": "10 min charge = 20 hours playback", "Water Resistance": "IP55", "Warranty": "1 Year Brand Warranty" }
  },
  {
    id: "P-1402",
    brand: "Realme",
    description: "Realme Buds Wireless 3 neckband featuring 30dB Active Noise Cancellation, 13.6mm dynamic bass boost driver, 360° spatial audio effect, 40 hours total playtime, dual-device connection, and 45ms ultra-low latency gaming mode.",
    highlights: ["30dB Active Noise Cancellation with dual mics", "13.6mm dynamic bass driver with titanium diaphragm", "360° spatial audio with cinematic immersion", "40 hours total playback & dual device switching"],
    specifications: { "Brand": "Realme", "Model": "Buds Wireless 3", "Drivers": "13.6mm Bass Driver", "Bluetooth": "Version 5.3 (Dual device)", "Low Latency": "45ms Game Mode", "Water Resistance": "IP55", "Warranty": "1 Year Brand Warranty" }
  },
  {
    id: "P-1403",
    brand: "boAt",
    description: "boAt Rockerz 255 Pro+ wireless Bluetooth neckband equipped with Qualcomm cVc noise cancellation, signature 10mm dynamic drivers, ASAP Fast Charge (10 mins = 10 hours), 40 hours continuous playback, and IPX7 water/sweat resistance.",
    highlights: ["40 Hours total playback with 300mAh battery", "ASAP Fast Charge: 10 mins = 10 hours playtime", "IPX7 water & sweat resistance for workouts", "Dual pairing Bluetooth v5.2 with magnetic earbuds"],
    specifications: { "Brand": "boAt", "Model": "Rockerz 255 Pro+", "Drivers": "10mm Dynamic Drivers", "Bluetooth": "Version 5.2", "Waterproof": "IPX7 Rating", "Color": "Active Black", "Warranty": "1 Year Brand Warranty" }
  },
  {
    id: "P-1404",
    brand: "Sony",
    description: "Sony WI-C100 wireless in-ear Bluetooth neckband featuring Sony DSEE audio upscaling technology, 25 hours long-lasting battery life, IPX4 splash-proof design, 360 Reality Audio compatibility, and customizable EQ via Sony Headphones Connect app.",
    highlights: ["25 Hours continuous battery life", "DSEE sound upscaling restores high-frequency fidelity", "IPX4 splash-proof and sweat-resistant build", "Compatible with Sony Headphones Connect custom EQ"],
    specifications: { "Brand": "Sony", "Model": "WI-C100", "Battery": "25 Hours Playback (Quick charge 10 min = 60 min)", "Bluetooth": "Version 5.0", "Water Resistance": "IPX4", "Weight": "20 grams", "Warranty": "1 Year Sony Warranty" }
  },
  {
    id: "P-1405",
    brand: "Boult",
    description: "Boult Audio Curve ANC wireless Bluetooth neckband featuring 30dB active noise cancellation, Zen environmental noise cancelling quad mics, 40 hours playtime, BoomX rich deep bass 12mm drivers, and Type-C lightning fast charging.",
    highlights: ["30dB Active Noise Cancellation with Zen Quad Mics", "40 Hours playtime on a single charge", "BoomX rich deep bass with 12mm drivers", "IPX5 water and sweat resistant for gym training"],
    specifications: { "Brand": "Boult", "Model": "Curve ANC", "Drivers": "12mm BoomX Dynamic", "ANC Depth": "30dB", "Fast Charge": "10 min = 15 hours", "Bluetooth": "Version 5.3", "Warranty": "1 Year Brand Warranty" }
  },
  {
    id: "P-1406",
    brand: "Noise",
    description: "Noise Tune Charge wireless Bluetooth neckband equipped with a dedicated Ultra BASS booster button, 10mm dynamic drivers, 16 hours continuous playtime, dual pairing to switch between smartphone and laptop, and IPX5 sweat-proof rating.",
    highlights: ["Dedicated BASS Booster button for instant deep bass", "16 Hours playtime with balanced dynamic drivers", "Dual pairing to connect phone and laptop simultaneously", "IPX5 sweat-proof with magnetic earbuds lock"],
    specifications: { "Brand": "Noise", "Model": "Tune Charge", "Drivers": "10mm Dynamic", "Battery": "16 Hours Playback", "Bluetooth": "Version 5.0", "Warranty": "1 Year Brand Warranty" }
  },

  // --- Fashion (C-02) ---
  {
    id: "P-2001",
    brand: "Nike",
    description: "Nike Revolution lightweight men's road running shoes crafted with breathable mesh upper, plush foam midsole for soft responsive cushioning, reinforced heel overlays, and flexible rubber outsole with computer-generated traction pattern.",
    highlights: ["Breathable engineered mesh upper for airflow", "Plush foam midsole delivers soft, stable ride", "Reinforced heel overlays for support and durability", "Full rubber outsole with multi-directional traction"],
    specifications: { "Brand": "Nike", "Model": "Revolution 6 Next Nature", "Upper Material": "Recycled Breathable Mesh", "Sole Material": "Rubber", "Closure": "Lace-Up", "Ideal For": "Running / Gym / Casual", "Warranty": "30-Day Manufacturer Defect Warranty" }
  },
  {
    id: "P-2002",
    brand: "Levi's",
    description: "Levi's Original Trucker Jacket crafted from 100% heavy-weight non-stretch cotton denim. Features point collar, button-flap chest pockets, side welt pockets, adjustable back waist tabs, and signature branded metal shank buttons.",
    highlights: ["Timeless iconic Levi's trucker jacket silhouette", "100% durable heavy-duty cotton denim fabric", "Button-flap chest pockets & side welt hand pockets", "Adjustable side hem tabs for tailored fit"],
    specifications: { "Brand": "Levi's", "Model": "Original Trucker Jacket", "Material": "100% Cotton Denim", "Fit": "Regular Fit", "Collar": "Point Collar", "Wash Care": "Machine wash cold with like colors", "Warranty": "Quality Guarantee" }
  },
  {
    id: "P-2003",
    brand: "Michael Kors",
    description: "Michael Kors luxury women's tote handbag crafted from premium Saffiano cross-grain leather with polished gold-tone hardware. Features spacious interior with zip compartment, slip pockets, double top handles, and protective metal feet.",
    highlights: ["Crafted from durable scratch-resistant Saffiano leather", "Polished gold-tone hardware and iconic MK charm", "Spacious interior fits 13-inch laptop, planner & wallet", "Double shoulder straps with protective base feet"],
    specifications: { "Brand": "Michael Kors", "Model": "Jet Set Travel Large Tote", "Material": "100% Saffiano Leather", "Dimensions": "38cm x 28cm x 11cm", "Closure": "Top Zip Closure", "Color": "Luggage Tan", "Warranty": "1 Year Authenticity Guarantee" }
  },
  {
    id: "P-2004",
    brand: "Ray-Ban",
    description: "Ray-Ban Aviator Classic sunglasses featuring teardrop-shaped crystal green G-15 mineral glass lenses and polished gold-tone metal frame. Offers 100% UV400 protection with superior visual clarity, contrast, and adjustable silicone nose pads.",
    highlights: ["Iconic Ray-Ban aviator design born in 1937", "Legendary G-15 green crystal glass lenses", "100% UVA / UVB ray protection", "Adjustable nose pads and thin lightweight temples"],
    specifications: { "Brand": "Ray-Ban", "Model": "Aviator Classic RB3025", "Frame Material": "Metal (Polished Gold)", "Lens Technology": "Classic G-15 Crystal Glass", "Bridge Size": "14mm / Temple: 135mm", "Warranty": "2 Years Official Luxottica Warranty" }
  },
  {
    id: "P-2005",
    brand: "FabIndia",
    description: "FabIndia festive collection men's long kurta crafted from 100% pure breathable handwoven cotton. Styled with a classic mandarin band collar, full button placket, long sleeves, and functional side pockets for elegant celebration wear.",
    highlights: ["100% Pure handwoven breathable cotton fabric", "Classic mandarin band collar with button placket", "Side slits and functional deep side pockets", "Pre-washed for shrink resistance and comfort"],
    specifications: { "Brand": "FabIndia", "Model": "Festive Handwoven Long Kurta", "Fabric": "100% Cotton", "Fit": "Regular Comfort Fit", "Length": "Knee Length", "Wash Care": "Hand wash or gentle machine wash", "Warranty": "FabIndia Quality Seal" }
  },
  {
    id: "P-2006",
    brand: "Tommy Hilfiger",
    description: "Tommy Hilfiger men's bifold wallet crafted from 100% genuine full-grain leather. Built with RFID-blocking security lining to protect credit cards, 6 dedicated card slots, 2 slip pockets, a billfold compartment, and embossed flag logo.",
    highlights: ["100% Genuine full-grain soft cowhide leather", "Integrated RFID-blocking protection against theft", "6 card slots, 2 slip pockets, and full bill compartment", "Signature Tommy Hilfiger embossed enamel ribbon logo"],
    specifications: { "Brand": "Tommy Hilfiger", "Model": "Cambridge RFID Bifold Wallet", "Material": "100% Genuine Leather", "Dimensions": "11cm x 8.5cm x 1.5cm", "RFID Protection": "Yes (13.56 MHz frequency)", "Warranty": "6 Months Manufacturer Warranty" }
  },
  {
    id: "P-2007",
    brand: "Puma",
    description: "Puma multi-utility 35L sports backpack crafted from durable water-resistant polyester. Features a padded 15.6-inch laptop sleeve, dual zippered main compartments, breathable mesh shoulder straps, side water bottle holders, and reflective details.",
    highlights: ["Spacious 35-liter capacity with 3 zippered compartments", "Padded internal sleeve fits up to 15.6-inch laptops", "Ergonomic breathable air-mesh padded back panel", "Durable water-repellent base and exterior fabric"],
    specifications: { "Brand": "Puma", "Model": "Puma Phase Plus 35L Backpack", "Material": "100% Tough Polyester", "Capacity": "35 Liters", "Laptop Compartment": "Up to 15.6-inch", "Weight": "450 grams", "Warranty": "1 Year Puma Warranty" }
  },

  // --- Home & Kitchen (C-03) ---
  {
    id: "P-3001",
    brand: "Prestige",
    description: "Prestige Omega Deluxe Granite 5-piece non-stick cookware set including fry pan, omni tawa, kadai with glass lid, and 2 spatulas. Engineered with durable 5-layer granite spatter coating, PFOA-free food-safe finish, and induction/gas compatible base.",
    highlights: ["5-Layer durable granite non-stick coating", "Gas and induction cooktop compatible base", "100% PFOA-free healthy oil-free cooking", "Tough stay-cool ergonomic bakelite handles"],
    specifications: { "Brand": "Prestige", "Model": "Omega Deluxe Granite 5pc", "Material": "Virgin Aluminum with Granite Finish", "Dishwasher Safe": "Yes", "Items Included": "Fry Pan (24cm), Omni Tawa (28cm), Kadai with Glass Lid (24cm), 2 Spatulas", "Warranty": "2 Years Prestige Warranty" }
  },
  {
    id: "P-3002",
    brand: "Philips",
    description: "Philips Digital Air Fryer 4L featuring Rapid Air Technology with unique starfish bottom design that fries with up to 90% less fat. Includes digital touchscreen with 7 preset cooking modes, keep-warm function, and dishwasher-safe QuickClean basket.",
    highlights: ["Rapid Air Technology with 90% less fat usage", "Digital touch display with 7 preset recipes", "QuickClean non-stick basket is dishwasher safe", "Keep-warm function maintains serving temperature"],
    specifications: { "Brand": "Philips", "Model": "HD9252/90 Air Fryer", "Capacity": "4.1 Liters (0.8 kg food)", "Power": "1400 Watts", "Temperature Range": "80°C - 200°C", "Timer": "Up to 60 Minutes", "Warranty": "2 Years Philips India Warranty" }
  },
  {
    id: "P-3003",
    brand: "Bombay Dyeing",
    description: "Bombay Dyeing pure 100% cotton king-size double bedsheet with 2 matching pillow covers. Crafted with 250 thread count breathable sateen weave, fade-resistant color fastness, and ultra-soft hypoallergenic skin feel.",
    highlights: ["100% Pure long-staple cotton bedsheet", "250 Thread Count luxurious smooth sateen weave", "Includes 1 King bedsheet + 2 large pillow covers", "Color-fast reactive dyeing prevents fading"],
    specifications: { "Brand": "Bombay Dyeing", "Model": "Royale King Bedsheet Set", "Material": "100% Cotton", "Thread Count": "250 TC", "Bedsheet Dimensions": "274cm x 274cm (108 x 108 inches)", "Pillow Cover Dimensions": "46cm x 69cm", "Warranty": "Authentic Brand Quality" }
  },
  {
    id: "P-3004",
    brand: "Wipro",
    description: "Wipro Smart LED Desk Lamp featuring eye-protection flicker-free illumination, 3 tunable color temperatures (Warm, Neutral, Cool White), touch-sensitive step-less dimming slider, flexible 360° silicone gooseneck, and built-in USB charging port.",
    highlights: ["Flicker-free eye-care LED with zero blue-light hazard", "3 Color modes: Warm White, Natural White, Cool Daylight", "Touch-sensitive step-less brightness dimming", "Flexible 360-degree durable gooseneck arm"],
    specifications: { "Brand": "Wipro", "Model": "Garnet Smart LED Desk Lamp", "Wattage": "9 Watts", "Color Temperature": "3000K - 6500K", "Power Source": "AC 220-240V Adapter with USB Out", "Lifespan": "30,000 Hours", "Warranty": "1 Year Wipro Warranty" }
  },
  {
    id: "P-3005",
    brand: "Bajaj",
    description: "Bajaj Rex 750W high-torque mixer grinder with 100% copper motor, 3 stainless steel heavy-gauge jars (1.5L liquidizing, 1.0L dry grind, 0.4L chutney jar), multi-functional sharp blades, and overload protection safety switch.",
    highlights: ["750-Watt 100% copper motor with overload protector", "3 Heavy-gauge stainless steel jars with transparent lids", "Multi-functional hardened stainless steel blades", "3-Speed control knob with incher pulse function"],
    specifications: { "Brand": "Bajaj", "Model": "Rex 750W Mixer Grinder", "Motor Power": "750 Watts (100% Copper Winding)", "Jars Included": "1.5L Liquidizing, 1.0L Grinding, 0.4L Chutney", "RPM": "20,000 RPM (No load)", "Warranty": "2 Years Motor & Product Warranty" }
  },
  {
    id: "P-3006",
    brand: "Borosil",
    description: "Borosil Opalware 18-piece dinner set engineered with break, chip, and scratch-resistant toughened opal glass. 100% vegetarian bone-ash free, microwave safe, dishwasher safe, and elegantly finished with scratch-resistant floral design.",
    highlights: ["100% Bone-ash free hygienic vegetarian opalware", "Toughened extra-resistant against chips and breaks", "Microwave, dishwasher, and refrigerator safe", "Stain resistant, odor free, and lightweight"],
    specifications: { "Brand": "Borosil", "Model": "Larah 18pc Opalware Dinner Set", "Material": "Toughened White Opal Glass", "Set Contains": "6 Full Plates (11in), 6 Veg Bowls, 6 Quarter Plates", "Microwave Safe": "Yes", "Warranty": "Borosil Quality Guarantee" }
  },
  {
    id: "P-3007",
    brand: "Havells",
    description: "Havells 11-fin oil-filled radiator room heater with 2500W heating element, PTC ceramic fan heater for instant warmth, 3 heat settings, adjustable thermostat, tip-over safety switch, and caster wheels for smooth room-to-room mobility.",
    highlights: ["11-Fin oil filled radiator with 2500W heating power", "Built-in PTC fan heater delivers instant warm airflow", "Overheat safety protection & tip-over tilt switch", "Cord winder and multidirectional caster wheels"],
    specifications: { "Brand": "Havells", "Model": "OFR 11-Fin Room Heater", "Power Consumption": "2500 Watts + 400W PTC Fan", "Heat Settings": "1000W / 1500W / 2500W", "Safety": "Overheat Protection & Tilt Cutoff", "Warranty": "1 Year Havells Comprehensive Warranty" }
  },

  // --- Books (C-04) ---
  {
    id: "P-4001",
    brand: "Penguin Books",
    description: "Atomic Habits by James Clear: An Easy & Proven Way to Build Good Habits & Break Bad Ones. The definitive #1 New York Times bestseller offering a framework for improving every day through small, incremental habit compounding.",
    highlights: ["#1 New York Times & International Bestseller", "Transformative 4-step framework for lasting behavioral change", "High-quality paperback edition with durable binding", "Includes practical habit scorecard and tracking exercises"],
    specifications: { "Brand": "Penguin Books", "Author": "James Clear", "Format": "Paperback", "Pages": "320 Pages", "Language": "English", "ISBN": "978-1847941831", "Publisher": "Random House Business (Penguin)" }
  },
  {
    id: "P-4002",
    brand: "O'Reilly Media",
    description: "Data Structures & Algorithms in Java: A comprehensive practical guide covering arrays, linked lists, trees, graphs, sorting, searching, dynamic programming, and Big-O complexity analysis with interview problem walkthroughs.",
    highlights: ["Complete reference for DSA in modern Java", "Covers Big-O analysis, graphs, trees, and dynamic programming", "Includes 150+ coding interview challenge solutions", "Clear architectural diagrams and memory representation charts"],
    specifications: { "Brand": "O'Reilly Media", "Publisher": "O'Reilly Media", "Language": "English", "Format": "Paperback Edition", "Pages": "680 Pages", "Subject": "Computer Science / Software Engineering", "Warranty": "Publisher Verified Copy" }
  },
  {
    id: "P-4003",
    brand: "Classmate",
    description: "Classmate Pulse 3-piece notebook set with single-line ruled pages, 300 pages each, high-opacity acid-free chlorine-free paper that prevents ink bleeding, durable spiral binding, and stylish motivational cover designs.",
    highlights: ["Set of 3 premium spiral-bound notebooks", "300 pages each with single-line ruled layout", "High-grade 70 GSM elemental chlorine-free paper", "Perforated pages for easy tear-out"],
    specifications: { "Brand": "Classmate", "Model": "Pulse Spiral Notebook Set (3pc)", "Pages per Notebook": "300 Pages", "Paper Density": "70 GSM", "Binding": "Spiral Bound with Polypropylene Cover", "Warranty": "ITC Classmate Guarantee" }
  },
  {
    id: "P-4004",
    brand: "McGraw Hill",
    description: "Indian Polity for Civil Services and other state examinations. The acclaimed gold-standard textbook detailing the Constitution of India, government structures, fundamental rights, judicial reviews, and landmark amendments.",
    highlights: ["Gold-standard reference for UPSC and civil service exams", "Covers Constitutional framework, rights, Parliament & Judiciary", "Includes recent constitutional amendments and judicial reviews", "Chapter-wise multiple choice questions with explanations"],
    specifications: { "Brand": "McGraw Hill", "Publisher": "McGraw Hill Education India", "Language": "English", "Format": "Paperback", "Pages": "920 Pages", "Subject": "Indian Polity & Governance" }
  },
  {
    id: "P-4005",
    brand: "Scholastic",
    description: "Scholastic Kids Story Box collection of 6 beautifully illustrated moral and adventure storybooks designed for early readers aged 4 to 9. Encourages vocabulary building, empathy, reading fluency, and creativity.",
    highlights: ["Box set containing 6 full-color illustrated storybooks", "Engaging moral fables and exciting animal adventures", "Printed on thick glossy non-tear child-friendly paper", "Ideal for bedtime reading and early reader vocabulary"],
    specifications: { "Brand": "Scholastic", "Publisher": "Scholastic Inc.", "Age Group": "4 - 9 Years", "Set Count": "6 Books in Gift Box", "Format": "Hardbound Paperboard", "Language": "English" }
  },
  {
    id: "P-4006",
    brand: "HarperCollins",
    description: "Cookbook: 100 Authentic Curries from Across India. A masterclass recipe collection covering Kashmiri Rogan Josh, Kerala Meen Curry, Mughlai Korma, Punjabi Dal Makhani, and Chettinad specialties with vibrant step-by-step photography.",
    highlights: ["100 authentic regional curry recipes from across India", "Step-by-step spice mixing and slow cooking techniques", "Stunning full-page food photography for every recipe", "Includes vegetarian and non-vegetarian specialties"],
    specifications: { "Brand": "HarperCollins", "Publisher": "HarperCollins India", "Format": "Hardcover Coffee Table Edition", "Pages": "240 Pages", "Language": "English", "Genre": "Culinary Arts & Cooking" }
  },

  // --- Sports (C-05) ---
  {
    id: "P-5001",
    brand: "Decathlon",
    description: "Decathlon Domyos 6mm high-density non-slip yoga and fitness mat. Designed with dual-textured grip surface to prevent slipping on tiles or wood, alignment position lines for posture guidance, and carry strap included.",
    highlights: ["6mm thick high-density cushioning protects joints", "Double-sided non-slip textured traction pattern", "Built-in laser etched posture alignment guides", "100% eco-friendly TPE material (latex & PVC free)"],
    specifications: { "Brand": "Decathlon", "Model": "Domyos Alignment Yoga Mat 6mm", "Material": "High-Density Eco TPE", "Dimensions": "183cm x 61cm x 6mm", "Weight": "850 grams", "Includes": "Carry Strap", "Warranty": "2 Years Decathlon Guarantee" }
  },
  {
    id: "P-5002",
    brand: "Kore",
    description: "Kore 10kg rubber encased hexagonal dumbbell set (2x 5kg) with solid cast iron core, ergonomic contoured knurled chrome handles, and durable anti-roll hexagonal rubber casing that protects gym floors from impacts.",
    highlights: ["Solid cast iron core encased in heavy-duty virgin rubber", "Hexagonal anti-roll design stays in place between sets", "Ergonomic knurled chrome grip handles prevent slippage", "Floor-protecting impact dampening rubber exterior"],
    specifications: { "Brand": "Kore", "Model": "Hex Rubber Dumbbells 10kg Set", "Set Weight": "10 kg Total (Pair of 5kg each)", "Material": "Cast Iron Core with Rubber Coating", "Grip": "Chromed Contoured Knurling", "Warranty": "6 Months Brand Warranty" }
  },
  {
    id: "P-5003",
    brand: "SG",
    description: "SG Sierra Kashmir Willow cricket bat traditionally crafted for power hitters and stroke players. Features thick edges, full spine profile, curved blade for balanced weight pick-up, and premium Sarawak cane handle with chevron grip.",
    highlights: ["Handcrafted from selected grade Kashmir Willow", "Thick edges (38-40mm) and full-bodied power profile", "Short Sarawak cane handle with shock-absorbing chevron grip", "Comes with full-length padded bat cover"],
    specifications: { "Brand": "SG", "Model": "Sierra Plus Kashmir Willow", "Wood Type": "Grade 1 Kashmir Willow", "Handle": "3-Piece Sarawak Cane", "Weight": "1180 - 1220 grams", "Size": "Full Size Men's (Size 6 / Short Handle)", "Warranty": "SG Official Authenticity" }
  },
  {
    id: "P-5004",
    brand: "Milton",
    description: "Milton Thermosteel 1-liter double-walled vacuum insulated stainless steel water bottle. Keeps liquids ice cold for 24 hours or piping hot for 24 hours with copper coating for temperature retention. 100% leak-proof and rust-free.",
    highlights: ["Double-wall vacuum insulation with inner copper coating", "Keeps drinks cold or hot for up to 24 hours", "100% Food-grade 18/8 stainless steel inside and out", "Leak-proof threaded cap with silicone seal and carry loop"],
    specifications: { "Brand": "Milton", "Model": "Thermosteel Duo Deluxe 1000", "Capacity": "1000 ml (1 Liter)", "Material": "Grade 304 (18/8) Stainless Steel", "BPA Free": "Yes", "Warranty": "1 Year Milton Warranty" }
  },
  {
    id: "P-5005",
    brand: "Cosco",
    description: "Cosco Torino Size 5 professional football constructed with 32-panel machine-stitched high-grade synthetic leather casing, multi-ply polyester backing for shape retention, and butyl bladder for long-lasting air retention.",
    highlights: ["Official Size 5 tournament match football", "32-panel durable synthetic leather construction", "Multi-cross polyester backing maintains spherical shape", "High-retention butyl bladder retains air pressure for weeks"],
    specifications: { "Brand": "Cosco", "Model": "Torino Size 5 Football", "Size": "Size 5 (Standard)", "Panels": "32 Panels", "Bladder": "Air-Lock Butyl Bladder", "Suitable For": "Grass / Turf / Hard Ground", "Warranty": "Brand Guarantee" }
  },
  {
    id: "P-5006",
    brand: "Nivia",
    description: "Nivia high-speed 360-degree ball-bearing jump rope with 3-meter adjustable steel wire cable encased in PVC, non-slip aluminum alloy handles, and frictionless dual-bearing rotation for double-unders and cardio workouts.",
    highlights: ["Dual 360° ball-bearing mechanism for frictionless spin", "Adjustable 3-meter tangle-free PVC-coated steel cable", "Non-slip knurled lightweight aluminum alloy handles", "Engineered for speed jumping, HIIT, and boxing workouts"],
    specifications: { "Brand": "Nivia", "Model": "Speed Pro Bearing Jump Rope", "Cable Length": "3 Meters (Fully Adjustable)", "Handle Material": "Anodized Aluminum Alloy", "Rotation": "360-degree High-Speed Bearings", "Weight": "180 grams", "Warranty": "6 Months Warranty" }
  },
  {
    id: "P-5007",
    brand: "Yonex",
    description: "Yonex GR 303 aluminum composite badminton racket pair with full-cover zippered bag and 3 nylon shuttles. Engineered with isometric head shape for 32% larger sweet spot, low torsion steel shaft, and pre-strung durable synthetic gut.",
    highlights: ["Pair of 2 genuine Yonex aluminum composite rackets", "Isometric head shape expands sweet spot for cleaner hits", "Includes 3 durable high-visibility nylon shuttlecocks", "Supplied in full-size protective zippered shoulder bag"],
    specifications: { "Brand": "Yonex", "Model": "GR 303 Combo Set", "Frame Material": "Aluminum", "Shaft Material": "Low Torsion Steel", "Grip Size": "G4", "String Tension": "18-20 lbs (Pre-strung)", "Package Contents": "2 Rackets + 3 Shuttles + Full Cover Bag", "Warranty": "100% Genuine Yonex Product" }
  }
];

let updatedCount = 0;
for (const u of updates) {
  const res = db.products.updateOne(
    { _id: u.id },
    {
      $set: {
        brand: u.brand,
        description: u.description,
        highlights: u.highlights,
        specifications: u.specifications,
        updatedAt: new Date()
      }
    }
  );
  if (res.matchedCount > 0) updatedCount++;
}

print("Successfully updated " + updatedCount + " products with brand, detailed description, highlights, and specifications.");

