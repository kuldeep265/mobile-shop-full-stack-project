const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    description: 'Latest iPhone with A17 Pro chip, titanium design, and a 48MP camera system.',
    price: 134900,
    originalPrice: 144900,
    stock: 25,
    category: 'mobile',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    discount: 7,
    images: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', public_id: 'seed-iphone15' }],
    specifications: {
      display: '6.1-inch Super Retina XDR',
      processor: 'A17 Pro',
      camera: '48MP Main Camera',
      battery: 'Up to 23 hours video',
      os: 'iOS 17'
    },
    variants: [
      { storage: '128GB', color: 'Natural Titanium', ram: '8GB', price: 134900, stock: 10 },
      { storage: '256GB', color: 'Blue Titanium', ram: '8GB', price: 144900, stock: 15 }
    ]
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    description: 'Flagship Android phone with S Pen, 200MP camera, and Galaxy AI.',
    price: 129999,
    originalPrice: 139999,
    stock: 20,
    category: 'mobile',
    isFeatured: true,
    isBestSeller: true,
    discount: 7,
    images: [{ url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', public_id: 'seed-s24' }],
    specifications: {
      display: '6.8-inch Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      camera: '200MP Quad Camera',
      battery: '5000mAh',
      os: 'Android 14'
    }
  },
  {
    name: 'OnePlus 12',
    brand: 'OnePlus',
    description: 'Fast and smooth flagship with Hasselblad cameras and 100W charging.',
    price: 64999,
    originalPrice: 69999,
    stock: 30,
    category: 'mobile',
    isFeatured: true,
    isNewArrival: true,
    discount: 7,
    images: [{ url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', public_id: 'seed-oneplus12' }],
    specifications: {
      display: '6.82-inch LTPO AMOLED',
      processor: 'Snapdragon 8 Gen 3',
      camera: '50MP Hasselblad',
      battery: '5400mAh',
      os: 'OxygenOS 14'
    }
  },
  {
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    description: 'Best-in-class computational photography and clean Android experience.',
    price: 89999,
    originalPrice: 106999,
    stock: 18,
    category: 'mobile',
    isFeatured: true,
    isNewArrival: true,
    discount: 16,
    images: [{ url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', public_id: 'seed-pixel8' }],
    specifications: {
      display: '6.7-inch LTPO OLED',
      processor: 'Google Tensor G3',
      camera: '50MP Triple Camera',
      battery: '5050mAh',
      os: 'Android 14'
    }
  },
  {
    name: 'Nothing Phone (2)',
    brand: 'Nothing',
    description: 'Unique Glyph interface, clean software, and flagship-level performance.',
    price: 44999,
    originalPrice: 49999,
    stock: 22,
    category: 'mobile',
    isBestSeller: true,
    discount: 10,
    images: [{ url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800', public_id: 'seed-nothing2' }],
    specifications: {
      display: '6.7-inch LTPO OLED',
      processor: 'Snapdragon 8+ Gen 1',
      camera: '50MP Dual Camera',
      battery: '4700mAh',
      os: 'Nothing OS 2.5'
    }
  },
  {
    name: 'Xiaomi 14',
    brand: 'Xiaomi',
    description: 'Leica-tuned cameras and compact flagship design.',
    price: 54999,
    originalPrice: 69999,
    stock: 28,
    category: 'mobile',
    isNewArrival: true,
    discount: 21,
    images: [{ url: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800', public_id: 'seed-xiaomi14' }],
    specifications: {
      display: '6.36-inch LTPO AMOLED',
      processor: 'Snapdragon 8 Gen 3',
      camera: '50MP Leica',
      battery: '4610mAh',
      os: 'HyperOS'
    }
  }
];

async function seedProductsIfEmpty() {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Products already present (${count}). Skipping seed.`);
    return;
  }

  await Product.insertMany(sampleProducts);
  console.log(`Seeded ${sampleProducts.length} sample products.`);
}

module.exports = seedProductsIfEmpty;
