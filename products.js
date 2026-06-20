const products = [
  // --- MOBILES ---
  {
    id: "mob-1",
    name: "iPhone 15 Pro (128 GB) - Natural Titanium",
    brand: "Apple",
    category: "Mobiles",
    price: 119900,
    originalPrice: 134900,
    rating: 4.7,
    reviewsCount: 3829,
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400",
    description: "Features a strong and light aerospace-grade titanium design with textured matte-glass back. It also features a Ceramic Shield front cover that’s tougher than any smartphone glass. Super Retina XDR display with ProMotion.",
    isDeal: true,
    deliveryDays: 2,
    specs: {
      "Model": "iPhone 15 Pro",
      "Display": "6.1-inch Super Retina XDR",
      "Processor": "A17 Pro chip with 6-core GPU",
      "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      "Battery": "Up to 23 hours video playback",
      "OS": "iOS 17"
    },
    reviews: [
      { user: "Aarav S.", rating: 5, date: "2026-05-12", comment: "The titanium finish is premium and lightweight. Battery easily lasts a full day under heavy usage." },
      { user: "Priya M.", rating: 4, date: "2026-06-01", comment: "Incredible camera performance, especially in low light. Docked one star for high price." }
    ]
  },
  {
    id: "mob-2",
    name: "Galaxy S24 Ultra (512 GB) - Titanium Gray",
    brand: "Samsung",
    category: "Mobiles",
    price: 129999,
    originalPrice: 139999,
    rating: 4.8,
    reviewsCount: 2984,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=400",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility starting with the most important device in your life.",
    isDeal: false,
    deliveryDays: 1,
    specs: {
      "Model": "Galaxy S24 Ultra",
      "Display": "6.8-inch Dynamic AMOLED 2X",
      "Processor": "Snapdragon 8 Gen 3 for Galaxy",
      "Camera": "200MP + 50MP + 12MP + 10MP",
      "S-Pen": "Included (embedded in chassis)",
      "Battery": "5000 mAh with 45W Charging"
    },
    reviews: [
      { user: "Rahul K.", rating: 5, date: "2026-05-20", comment: "The display is incredibly bright and clear. AI features like circle to search are very handy." }
    ]
  },
  {
    id: "mob-3",
    name: "OnePlus 12 (256 GB) - Silky Black",
    brand: "OnePlus",
    category: "Mobiles",
    price: 64999,
    originalPrice: 69999,
    rating: 4.6,
    reviewsCount: 1450,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400",
    description: "Redefined flagship specs. Powered by Snapdragon 8 Gen 3, 16GB LPDDR5X RAM, and 4th Gen Hasselblad Camera System for Mobile. Experience lightning-fast charging with 100W SUPERVOOC.",
    isDeal: true,
    deliveryDays: 3,
    specs: {
      "Model": "OnePlus 12",
      "Display": "6.82-inch 120Hz 2K ProXDR",
      "Processor": "Snapdragon 8 Gen 3",
      "RAM": "16 GB",
      "Battery": "5400 mAh with 100W Wired Charging",
      "Charging": "100W wired, 50W wireless"
    },
    reviews: [
      { user: "Devansh N.", rating: 5, date: "2026-06-15", comment: "Charges from 0 to 100 in under 30 minutes! Smooth performance, no lag at all." }
    ]
  },

  // --- ELECTRONICS ---
  {
    id: "elec-1",
    name: "WH-1000XM5 Wireless Noise Cancelling Headphones",
    brand: "Sony",
    category: "Electronics",
    price: 24999,
    originalPrice: 34990,
    rating: 4.7,
    reviewsCount: 18392,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400",
    description: "Sony’s industry-leading noise cancellation gets even better. Multi Noise Sensor technology with four microphones on each ear cup captures ambient noise more accurately for a dramatic reduction in high-frequency sound.",
    isDeal: true,
    deliveryDays: 2,
    specs: {
      "Model": "WH-1000XM5",
      "Headphone Type": "Over-Ear Wireless",
      "Battery Life": "Up to 30 hours",
      "Charging": "Quick charge (3 min for 3 hours)",
      "Bluetooth Version": "5.2",
      "Active Noise Cancellation": "Yes (Auto NC Optimizer)"
    },
    reviews: [
      { user: "Meera R.", rating: 5, date: "2026-04-18", comment: "Outstanding active noise cancellation. Extremely lightweight and comfortable to wear for hours." },
      { user: "Karan P.", rating: 4, date: "2026-05-29", comment: "Sound quality is amazing. Case is a bit large compared to previous XM4 model." }
    ]
  },
  {
    id: "elec-2",
    name: "10.9-inch iPad Air (Wi-Fi, 64GB) - Space Gray",
    brand: "Apple",
    category: "Electronics",
    price: 49999,
    originalPrice: 59900,
    rating: 4.8,
    reviewsCount: 8271,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400",
    description: "With an immersive 10.9-inch Liquid Retina display. The breakthrough Apple M1 chip delivers faster performance, making iPad Air a creative and mobile gaming powerhouse. Touch ID, advanced cameras, and USB-C.",
    isDeal: false,
    deliveryDays: 2,
    specs: {
      "Model": "iPad Air (5th Gen)",
      "Display": "10.9-inch Liquid Retina",
      "Processor": "Apple M1 chip",
      "Storage": "64 GB",
      "Biometrics": "Touch ID in Top Button",
      "Connector": "USB-C"
    },
    reviews: [
      { user: "Sneha G.", rating: 5, date: "2026-06-11", comment: "The M1 chip makes this tablet incredibly fast. Drawing with Apple Pencil feels natural and delay-free." }
    ]
  },
  {
    id: "elec-3",
    name: "MX Master 3S Wireless Ergonomic Mouse",
    brand: "Logitech",
    category: "Electronics",
    price: 9495,
    originalPrice: 10995,
    rating: 4.5,
    reviewsCount: 5219,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=400",
    description: "An icon remastered. Feel every moment of your workflow with even more precision, tactility, and performance, thanks to Quiet Clicks and an 8,000 DPI track-on-glass sensor.",
    isDeal: false,
    deliveryDays: 1,
    specs: {
      "Model": "MX Master 3S",
      "Sensor": "Darkfield high precision (8000 DPI)",
      "Buttons": "7 buttons (Left/Right-click, Back/Forward, App-Switch, Wheel mode-shift, Middle click)",
      "Battery": "Rechargeable Li-Po (500 mAh)",
      "Wireless Range": "10 meters"
    },
    reviews: [
      { user: "Suresh B.", rating: 5, date: "2026-06-14", comment: "Super ergonomic design. The scroll wheel is insanely satisfying and fast. Quiet clicks are nice too." }
    ]
  },

  // --- FASHION ---
  {
    id: "fash-1",
    name: "Men's Premium Classic Bomber Jacket",
    brand: "UrbanWear",
    category: "Fashion",
    price: 3499,
    originalPrice: 5999,
    rating: 4.3,
    reviewsCount: 1205,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400",
    description: "Crafted from durable high-quality water-resistant fabric. Features ribbed cuffs, collar, and hem, robust front zipper closure, and fleece lining for added warmth. Ideal for casual outings.",
    isDeal: true,
    deliveryDays: 3,
    specs: {
      "Material": "Polyester blend with fleece lining",
      "Fit": "Regular Fit",
      "Sleeve": "Full Sleeve",
      "Closure": "Zipper",
      "Pockets": "2 side pockets, 1 inner pocket"
    },
    reviews: [
      { user: "Amit V.", rating: 4, date: "2026-05-18", comment: "Warm, stylish, and fits perfectly. The zip quality is sturdy. Highly recommended." }
    ]
  },
  {
    id: "fash-2",
    name: "Minimalist Chronograph Leather Watch",
    brand: "Tempus",
    category: "Fashion",
    price: 7999,
    originalPrice: 12999,
    rating: 4.4,
    reviewsCount: 832,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400",
    description: "A clean, modern time-piece. Features a 42mm surgical-grade stainless steel case, genuine Italian leather strap, scratch-resistant mineral crystal glass, and Japanese quartz movement with triple sub-dials.",
    isDeal: false,
    deliveryDays: 2,
    specs: {
      "Case Diameter": "42 mm",
      "Movement": "Japanese Quartz Chronograph",
      "Strap Material": "Genuine Italian Leather",
      "Water Resistance": "5 ATM (50 meters)",
      "Warranty": "2 Years"
    },
    reviews: [
      { user: "Vikram S.", rating: 5, date: "2026-05-24", comment: "Elegant packaging and stunning design. It goes well with both formal and semi-formal clothes." }
    ]
  },
  {
    id: "fash-3",
    name: "Unisex Retro Streetwear Sneakers",
    brand: "Kickz",
    category: "Fashion",
    price: 4299,
    originalPrice: 7999,
    rating: 4.2,
    reviewsCount: 2311,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400",
    description: "Classic court-inspired lifestyle sneakers featuring a premium suede and synthetic leather upper. Padded collar for ankle comfort, cushioned footbed, and vulcanized rubber outsole for supreme traction.",
    isDeal: true,
    deliveryDays: 4,
    specs: {
      "Upper Material": "Suede and Synthetic Leather",
      "Sole": "Vulcanized Rubber",
      "Color": "Off-white / Forest Green",
      "Style": "Low-top retro sneaker",
      "Cushioning": "EVA midsole foam"
    },
    reviews: [
      { user: "Ananya R.", rating: 4, date: "2026-06-03", comment: "Super comfy! Fits true to size. Looks incredibly stylish with wide-leg jeans." }
    ]
  },

  // --- HOME & LIVING ---
  {
    id: "home-1",
    name: "Barista Express Espresso Coffee Machine",
    brand: "Breville",
    category: "Home & Living",
    price: 54999,
    originalPrice: 69999,
    rating: 4.8,
    reviewsCount: 3951,
    image: "https://images.unsplash.com/photo-1579888944880-d983411488cb?auto=format&fit=crop&q=80&w=400",
    description: "Create third wave specialty coffee at home from bean to espresso in less than a minute. The Barista Express allows you to grind the beans right before extraction for rich full flavor.",
    isDeal: true,
    deliveryDays: 3,
    specs: {
      "Model": "Barista Express",
      "Capacity": "2 Liters",
      "Pressure": "15 Bar Italian Pump",
      "Grinder": "Integrated conical burr grinder",
      "Wattage": "1600 Watts",
      "Interface": "Simple analog dials and buttons"
    },
    reviews: [
      { user: "Aditya G.", rating: 5, date: "2026-06-08", comment: "The best purchase I have ever made. Espresso tastes just like the coffee shop. Takes a bit of practice to dial in but totally worth it!" }
    ]
  },
  {
    id: "home-2",
    name: "Ergonomic Mesh Office Chair with Lumbar Support",
    brand: "Zenith",
    category: "Home & Living",
    price: 12999,
    originalPrice: 22000,
    rating: 4.4,
    reviewsCount: 4503,
    image: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=400",
    description: "Designed for comfort during long working hours. Features a breathable high-density mesh back, adjustable 3D armrests, dynamic lumbar support, tilt locking mechanism, and heavy-duty nylon wheelbase.",
    isDeal: false,
    deliveryDays: 5,
    specs: {
      "Back Type": "High Back Breathable Mesh",
      "Armrests": "3D Adjustable (Height, Depth, Angle)",
      "Mechanism": "Multi-angle tilt lock",
      "Gas Lift": "Class 4 heavy-duty cylinder",
      "Weight Capacity": "Up to 135 kg"
    },
    reviews: [
      { user: "Nikhil T.", rating: 5, date: "2026-05-15", comment: "Cured my lower back pain! Very sturdy build quality. The mesh keeps things cool during summers." }
    ]
  },
  {
    id: "home-3",
    name: "Smart LED Desk Lamp with Wireless Charger",
    brand: "Lumina",
    category: "Home & Living",
    price: 2499,
    originalPrice: 4999,
    rating: 4.3,
    reviewsCount: 932,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=400",
    description: "Modern minimalist desk lamp. Features 5 color modes, 7 brightness levels, auto-off timer, eye-caring diffusion plate, and an integrated 10W Qi-certified fast wireless charging base for smartphones.",
    isDeal: false,
    deliveryDays: 2,
    specs: {
      "Light Source": "Eye-caring LED",
      "Color Temperature": "2700K - 6500K (5 modes)",
      "Brightness Levels": "7 levels (Touch Slider)",
      "Wireless Charging": "10W Qi-Fast Charger",
      "USB Output": "5V/1A for charging other devices"
    },
    reviews: [
      { user: "Rohan D.", rating: 4, date: "2026-06-10", comment: "Very useful desk addition. The phone charger works perfectly. The color modes help transition from work to reading." }
  }
];

window.products = products;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = products;
}

