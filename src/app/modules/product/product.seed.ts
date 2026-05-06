import mongoose from "mongoose";
import { ProductStatus} from "./product.interface";
import { Product } from "./product.model";
import { envVars } from "../../config/env";

const VENDOR_ID = "69f2280703f7578ed2b3aa00"; // Your provided vendor ID

export const realisticProducts = [
  // --- Laptops (69f9fefcb3ec6b0a77504b02) ---
  {
    name: "Apple MacBook Pro 16-inch (M3 Max)",
    sku: "SKU-MAC16-M3",
    description: "The ultimate pro laptop. Powered by the M3 Max chip with 36GB Unified Memory and 1TB SSD. Features a stunning Liquid Retina XDR display.",
    singleItemPrice: 3499.00,
    midWholesalePrice: 3350.00, midWholesaleMinQty: 3,
    wholesalePrice: 3200.00, wholesaleMinQty: 10,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefcb3ec6b0a77504b02",
    brand: "Apple", stock: 45, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID,
    specifications: [{ key: "Processor", value: "M3 Max" }, { key: "RAM", value: "36GB" }]
  },
  {
    name: "Dell XPS 15 OLED",
    sku: "SKU-DELL-XPS15",
    description: "15.6-inch 3.5K OLED touch display, Intel Core i9-13900H, 32GB DDR5 RAM, 1TB SSD, NVIDIA GeForce RTX 4070.",
    singleItemPrice: 2299.00,
    midWholesalePrice: 2150.00, midWholesaleMinQty: 5,
    wholesalePrice: 2000.00, wholesaleMinQty: 15,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefcb3ec6b0a77504b02",
    brand: "Dell", stock: 80, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID,
    specifications: [{ key: "Processor", value: "Intel i9" }, { key: "Storage", value: "1TB SSD" }]
  },

  // --- Smartphones (69f9fefbb3ec6b0a77504af3) ---
  {
    name: "iPhone 15 Pro Max - 256GB",
    sku: "SKU-IP15PM-256",
    description: "Forged in titanium. Features the A17 Pro chip, customizable Action button, and a powerful new camera system.",
    singleItemPrice: 1199.00,
    midWholesalePrice: 1150.00, midWholesaleMinQty: 10,
    wholesalePrice: 1100.00, wholesaleMinQty: 50,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefbb3ec6b0a77504af3",
    brand: "Apple", stock: 150, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID,
    variants: [{ label: "Color", value: "Natural Titanium" }, { label: "Color", value: "Black Titanium" }]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    sku: "SKU-SAMS24-ULT",
    description: "AI-powered smartphone with titanium exterior, 200MP camera, and built-in S Pen.",
    singleItemPrice: 1299.00,
    midWholesalePrice: 1220.00, midWholesaleMinQty: 5,
    wholesalePrice: 1180.00, wholesaleMinQty: 20,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefbb3ec6b0a77504af3",
    brand: "Samsung", stock: 120, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Men's Shoes (69f9fefeb3ec6b0a77504b3e) ---
  {
    name: "Nike Air Force 1 '07",
    sku: "SKU-NK-AF1",
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best.",
    singleItemPrice: 115.00,
    midWholesalePrice: 95.00, midWholesaleMinQty: 12,
    wholesalePrice: 80.00, wholesaleMinQty: 48,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefeb3ec6b0a77504b3e",
    brand: "Nike", stock: 300, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  {
    name: "Classic Oxford Leather Dress Shoes",
    sku: "SKU-OXF-LTH",
    description: "Premium full-grain leather dress shoes. Handcrafted for formal occasions and professional office wear.",
    singleItemPrice: 150.00,
    midWholesalePrice: 120.00, midWholesaleMinQty: 6,
    wholesalePrice: 95.00, wholesaleMinQty: 24,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1614252209825-9fa85fa22333?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefeb3ec6b0a77504b3e",
    brand: "Clarks", stock: 85, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Tea & Coffee (69f9ff09b3ec6b0a77504c6a) ---
  {
    name: "Organic Ceremonial Grade Matcha",
    sku: "SKU-TEA-MAT",
    description: "100% pure organic ceremonial grade matcha green tea powder sourced directly from Uji, Japan. 30g tin.",
    singleItemPrice: 28.00,
    midWholesalePrice: 22.00, midWholesaleMinQty: 10,
    wholesalePrice: 18.00, wholesaleMinQty: 50,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1582787049959-15854897c83f?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff09b3ec6b0a77504c6a",
    brand: "ZenLeaf", stock: 500, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  {
    name: "Dark Roast Arabica Coffee Beans (1kg)",
    sku: "SKU-COF-DRB",
    description: "Freshly roasted whole bean coffee. Rich, bold flavor with notes of dark chocolate and toasted caramel.",
    singleItemPrice: 24.00,
    midWholesalePrice: 19.00, midWholesaleMinQty: 5,
    wholesalePrice: 15.00, wholesaleMinQty: 20,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff09b3ec6b0a77504c6a",
    brand: "Morning Brew", stock: 1200, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Moisturizers & Creams (69f9ff00b3ec6b0a77504b7d) ---
  {
    name: "Daily Hydrating Face Cream with Hyaluronic Acid",
    sku: "SKU-BTY-HFC",
    description: "Lightweight daily moisturizer that locks in hydration for 24 hours. Suitable for all skin types. Fragrance-free.",
    singleItemPrice: 35.00,
    midWholesalePrice: 28.00, midWholesaleMinQty: 12,
    wholesalePrice: 22.00, wholesaleMinQty: 48,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1608248593801-ba1b2ce245b7?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff00b3ec6b0a77504b7d",
    brand: "DermaGlow", stock: 450, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Serums & Treatments (69f9ff00b3ec6b0a77504b83) ---
  {
    name: "Vitamin C Brightening Serum (30ml)",
    sku: "SKU-BTY-VCS",
    description: "Potent 15% Vitamin C serum with Ferulic Acid and Vitamin E. Brightens complexion and reduces dark spots.",
    singleItemPrice: 48.00,
    midWholesalePrice: 38.00, midWholesaleMinQty: 10,
    wholesalePrice: 30.00, wholesaleMinQty: 50,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff00b3ec6b0a77504b83",
    brand: "DermaGlow", stock: 320, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Desktop Computers (69f9fefcb3ec6b0a77504b05) ---
  {
    name: "Custom Gaming PC - RTX 4080 Build",
    sku: "SKU-PC-GAMING",
    description: "Pre-built high-performance gaming tower. Intel Core i7-14700K, 32GB RGB RAM, 2TB NVMe Gen4, RTX 4080 16GB, Liquid Cooled.",
    singleItemPrice: 2899.00,
    midWholesalePrice: 2700.00, midWholesaleMinQty: 2,
    wholesalePrice: 2550.00, wholesaleMinQty: 5,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1587202372773-823cd0898c8c?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefcb3ec6b0a77504b05",
    brand: "GamerTech", stock: 15, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Smart TVs (69f9fefcb3ec6b0a77504b11) ---
  {
    name: "LG C3 65-inch OLED evo Smart TV",
    sku: "SKU-TV-LGC3",
    description: "Experience perfect blacks and stunning color with LG's OLED evo technology. 120Hz refresh rate, ideal for gaming and movies.",
    singleItemPrice: 1699.00,
    midWholesalePrice: 1550.00, midWholesaleMinQty: 3,
    wholesalePrice: 1450.00, wholesaleMinQty: 10,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1593359677879-a410fd3bcbd7?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefcb3ec6b0a77504b11",
    brand: "LG", stock: 40, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Headphones & Earbuds (69f9fefcb3ec6b0a77504b17) ---
  {
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    sku: "SKU-AUD-XM5",
    description: "Industry-leading noise cancellation, 30-hour battery life, and crystal-clear hands-free calling. Lightweight and comfortable.",
    singleItemPrice: 398.00,
    midWholesalePrice: 350.00, midWholesaleMinQty: 5,
    wholesalePrice: 310.00, wholesaleMinQty: 20,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefcb3ec6b0a77504b17",
    brand: "Sony", stock: 250, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  {
    name: "Apple AirPods Pro (2nd Generation)",
    sku: "SKU-AUD-APP2",
    description: "Active Noise Cancellation reduces unwanted background noise. Adaptive Transparency lets outside sounds in while reducing loud environmental noise.",
    singleItemPrice: 249.00,
    midWholesalePrice: 220.00, midWholesaleMinQty: 10,
    wholesalePrice: 195.00, wholesaleMinQty: 50,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefcb3ec6b0a77504b17",
    brand: "Apple", stock: 500, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Gym Bags (69f9ff03b3ec6b0a77504bd1) ---
  {
    name: "Nike Brasilia Medium Training Duffel Bag",
    sku: "SKU-BAG-NKBR",
    description: "Spacious main compartment. Zippered bottom compartment separates your shoes or sweaty clothes. Water-resistant bottom.",
    singleItemPrice: 45.00,
    midWholesalePrice: 35.00, midWholesaleMinQty: 15,
    wholesalePrice: 25.00, wholesaleMinQty: 50,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1550977884-2578e9b626ec?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff03b3ec6b0a77504bd1",
    brand: "Nike", stock: 180, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Yoga Mats (69f9ff02b3ec6b0a77504bad) ---
  {
    name: "Eco-Friendly Non-Slip Cork Yoga Mat",
    sku: "SKU-YOG-CRK",
    description: "100% natural cork top and natural rubber bottom. Naturally antimicrobial, non-slip, and perfect for hot yoga.",
    singleItemPrice: 65.00,
    midWholesalePrice: 45.00, midWholesaleMinQty: 10,
    wholesalePrice: 35.00, wholesaleMinQty: 30,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1600881333168-2ef49b341f30?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff02b3ec6b0a77504bad",
    brand: "EcoYogi", stock: 200, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Shirts & T-Shirts (69f9fefdb3ec6b0a77504b20) ---
  {
    name: "Classic Premium Heavyweight White T-Shirt",
    sku: "SKU-CLO-WTS",
    description: "100% combed ringspun cotton. Thick, durable, yet ultra-soft. The perfect everyday white tee.",
    singleItemPrice: 25.00,
    midWholesalePrice: 18.00, midWholesaleMinQty: 24,
    wholesalePrice: 12.00, wholesaleMinQty: 100,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefdb3ec6b0a77504b20",
    brand: "Essentials", stock: 1500, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  {
    name: "Lumberjack Plaid Flannel Shirt",
    sku: "SKU-CLO-FLN",
    description: "Warm, thick woven flannel shirt featuring a classic red and black plaid pattern. Button-down collar and chest pocket.",
    singleItemPrice: 45.00,
    midWholesalePrice: 32.00, midWholesaleMinQty: 12,
    wholesalePrice: 24.00, wholesaleMinQty: 48,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1588850561407-a50d4f3b49e3?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefdb3ec6b0a77504b20",
    brand: "Timberline", stock: 400, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Cookware & Pots (69f9feffb3ec6b0a77504b5c) ---
  {
    name: "Lodge 10.25 Inch Cast Iron Skillet",
    sku: "SKU-KIT-LOD",
    description: "Pre-seasoned and ready to use. Excellent heat retention and even heating. Usable on all cooking surfaces, grills, and campfires.",
    singleItemPrice: 30.00,
    midWholesalePrice: 22.00, midWholesaleMinQty: 8,
    wholesalePrice: 18.00, wholesaleMinQty: 24,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1585002598858-a61bfa2b3225?auto=format&fit=crop&w=800&q=80"],
    category: "69f9feffb3ec6b0a77504b5c",
    brand: "Lodge", stock: 350, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  {
    name: "Tefal Hard Titanium Non-Stick Frying Pan (28cm)",
    sku: "SKU-KIT-TEF",
    description: "Scratch-resistant non-stick coating built to last. Thermo-Spot technology indicates when pan is preheated perfectly.",
    singleItemPrice: 55.00,
    midWholesalePrice: 42.00, midWholesaleMinQty: 6,
    wholesalePrice: 32.00, wholesaleMinQty: 20,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1592318049758-0056950e5015?auto=format&fit=crop&w=800&q=80"],
    category: "69f9feffb3ec6b0a77504b5c",
    brand: "Tefal", stock: 200, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Notebooks & Diaries (69f9ff04b3ec6b0a77504be6) ---
  {
    name: "Moleskine Classic Hard Cover Notebook (Ruled)",
    sku: "SKU-STA-MOL",
    description: "Large 5\" x 8.25\" notebook. Ivory-colored pages, rounded corners, elastic closure, and matching ribbon bookmark.",
    singleItemPrice: 22.00,
    midWholesalePrice: 16.00, midWholesaleMinQty: 15,
    wholesalePrice: 12.00, wholesaleMinQty: 50,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1531346878373-b3bc4f1a0e23?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff04b3ec6b0a77504be6",
    brand: "Moleskine", stock: 600, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  {
    name: "Handmade Vintage Leather Bound Journal",
    sku: "SKU-STA-LJR",
    description: "Genuine crazy horse leather journal with unlined antique deckle edge paper. Perfect for sketching or journaling.",
    singleItemPrice: 35.00,
    midWholesalePrice: 25.00, midWholesaleMinQty: 10,
    wholesalePrice: 18.00, wholesaleMinQty: 30,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff04b3ec6b0a77504be6",
    brand: "ArtisanCrafts", stock: 150, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Soft Drinks (69f9ff09b3ec6b0a77504c70) ---
  {
    name: "Coca-Cola Classic (12-Pack Cans)",
    sku: "SKU-BEV-COK12",
    description: "The original and iconic cola beverage. Crisp, cold, and refreshing. Includes 12 x 330ml aluminum cans.",
    singleItemPrice: 8.99,
    midWholesalePrice: 7.50, midWholesaleMinQty: 20,
    wholesalePrice: 6.00, wholesaleMinQty: 100,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1622483767028-fd167fc5cefc?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff09b3ec6b0a77504c70",
    brand: "Coca-Cola", stock: 800, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Water & Mineral Water (69f9ff0ab3ec6b0a77504c76) ---
  {
    name: "San Pellegrino Sparkling Natural Mineral Water (Glass, 6-Pack)",
    sku: "SKU-BEV-SPW",
    description: "Imported from Italy. Natural carbonation with a balanced mineral content. 6 bottles, 500ml each.",
    singleItemPrice: 12.50,
    midWholesalePrice: 10.00, midWholesaleMinQty: 15,
    wholesalePrice: 8.00, wholesaleMinQty: 60,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1557021110-6ec588e3bc63?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff0ab3ec6b0a77504c76",
    brand: "San Pellegrino", stock: 400, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Chocolates & Candies (69f9ff09b3ec6b0a77504c5e) ---
  {
    name: "Lindt Excellence 70% Cocoa Dark Chocolate Bar",
    sku: "SKU-SNC-LIN70",
    description: "Full-bodied dark chocolate with a perfectly balanced cocoa intensity. Smooth texture and lingering finish.",
    singleItemPrice: 4.50,
    midWholesalePrice: 3.50, midWholesaleMinQty: 24,
    wholesalePrice: 2.75, wholesaleMinQty: 100,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1548883354-949f3102cece?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff09b3ec6b0a77504c5e",
    brand: "Lindt", stock: 1500, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  {
    name: "Haribo Goldbears Party Pack (1kg)",
    sku: "SKU-SNC-HGB",
    description: "The original gummy bears in 5 fruity flavors. Bulk 1kg bag perfect for sharing and parties.",
    singleItemPrice: 14.00,
    midWholesalePrice: 11.00, midWholesaleMinQty: 10,
    wholesalePrice: 8.50, wholesaleMinQty: 40,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1582058091505-f483561a129d?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff09b3ec6b0a77504c5e",
    brand: "Haribo", stock: 350, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },

  // --- Board Games & Puzzles (69f9ff06b3ec6b0a77504c19) ---
  {
    name: "Monopoly Classic Family Board Game",
    sku: "SKU-TOY-MONO",
    description: "The fast-dealing property trading game. Buy, sell, dream, and scheme your way to riches.",
    singleItemPrice: 24.99,
    midWholesalePrice: 19.50, midWholesaleMinQty: 12,
    wholesalePrice: 15.00, wholesaleMinQty: 36,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1611117769611-3701633519c1?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff06b3ec6b0a77504c19",
    brand: "Hasbro", stock: 220, freeShipping: false, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  {
    name: "Catan Base Game",
    sku: "SKU-TOY-CATAN",
    description: "Trade, build, and settle the Island of Catan in this addictive strategy board game for 3-4 players.",
    singleItemPrice: 49.00,
    midWholesalePrice: 38.00, midWholesaleMinQty: 8,
    wholesalePrice: 30.00, wholesaleMinQty: 24,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1596568359556-91e0a811796c?auto=format&fit=crop&w=800&q=80"],
    category: "69f9ff06b3ec6b0a77504c19",
    brand: "Catan Studio", stock: 130, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  
  // --- Beds & Mattresses (69f9fefeb3ec6b0a77504b4d) ---
  {
    name: "Queen Size Memory Foam Mattress (12-inch)",
    sku: "SKU-FUR-QMM",
    description: "Cooling gel-infused memory foam mattress. Delivers perfect pressure relief and motion isolation for a deep sleep.",
    singleItemPrice: 499.00,
    midWholesalePrice: 390.00, midWholesaleMinQty: 3,
    wholesalePrice: 320.00, wholesaleMinQty: 10,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefeb3ec6b0a77504b4d",
    brand: "SleepTech", stock: 45, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  },
  
  // --- Smartwatches/Electronics (Using "Tablets" 69f9fefbb3ec6b0a77504af6 as closest hardware) ---
  {
    name: "Apple iPad Air (5th Gen) 64GB",
    sku: "SKU-TAB-IPADA",
    description: "Supercharged by the Apple M1 chip. 10.9-inch Liquid Retina display, 12MP Ultra Wide front camera with Center Stage.",
    singleItemPrice: 599.00,
    midWholesalePrice: 560.00, midWholesaleMinQty: 5,
    wholesalePrice: 530.00, wholesaleMinQty: 20,
    minOrderQty: 1,
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"],
    category: "69f9fefbb3ec6b0a77504af6",
    brand: "Apple", stock: 90, freeShipping: true, status: ProductStatus.ACTIVE, vendor: VENDOR_ID
  }
];

async function seedProducts() {
  const DB_URL = envVars.DB_URL;
  if (!DB_URL) throw new Error("DB_URL is not set in .env");

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(DB_URL);
  
  await Product.deleteMany({});
  console.log("🧹 Cleared existing mock products");

  for (const item of realisticProducts) {
    // Generate public IDs matching the image length so your schema doesn't fail
    const publicIds = item.images.map((_, idx) => `unsplash-static-${Date.now()}-${idx}`);
    
    await Product.create({
      ...item,
      imagePublicIds: publicIds,
    });
    console.log(` ✔ Created: "${item.name}"`);
  }

  console.log(`\n🎉 Seed complete! Successfully inserted ${realisticProducts.length} items.`);
  await mongoose.disconnect();
}

seedProducts().catch(err => {
  console.error("❌ Error seeding products:", err);
  process.exit(1);
})