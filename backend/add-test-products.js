/**
 * Fone Factory - Populate 100 Products Script
 *
 * Usage:
 *   node add-test-products.js
 *
 * Populates the database with 100 realistic mobile products with high quality images.
 */

const API_URL = process.env.API_URL || 'https://mobile-shop-full-stack-project.onrender.com/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'piyush@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Piyush123';

const smartphoneImages = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1569770218135-bea267ed7e84?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583573636246-18cb2246697f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1605170439002-90845e8c0137?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577741314755-048d8525d31e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600087626014-e652e18bbff2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574755393849-623942496936?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=600&auto=format&fit=crop&q=80'
];

function getImages(index) {
  const p1 = index % smartphoneImages.length;
  const p2 = (index + 7) % smartphoneImages.length;
  return [
    { url: smartphoneImages[p1], public_id: `prod_img_${index}_1` },
    { url: smartphoneImages[p2], public_id: `prod_img_${index}_2` }
  ];
}

const rawList = [
  // ── APPLE (1-10) ──
  { name: 'Apple iPhone 16 Pro Max - 256GB - Desert Titanium', brand: 'Apple', price: 144900, originalPrice: 154900, ram: '8GB', storage: '256GB', color: 'Desert Titanium', display: '6.9-inch Super Retina XDR OLED 120Hz', processor: 'Apple A18 Pro (3nm)', camera: '48MP + 48MP + 12MP 5x Telephoto', battery: '4685mAh', os: 'iOS 18', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.9, reviews: 142 },
  { name: 'Apple iPhone 16 Pro - 128GB - Natural Titanium', brand: 'Apple', price: 119900, originalPrice: 129900, ram: '8GB', storage: '128GB', color: 'Natural Titanium', display: '6.3-inch Super Retina XDR OLED 120Hz', processor: 'Apple A18 Pro (3nm)', camera: '48MP + 48MP + 12MP 5x Telephoto', battery: '3582mAh', os: 'iOS 18', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.8, reviews: 98 },
  { name: 'Apple iPhone 16 Plus - 128GB - Ultramarine', brand: 'Apple', price: 89900, originalPrice: 99900, ram: '8GB', storage: '128GB', color: 'Ultramarine', display: '6.7-inch Super Retina XDR OLED', processor: 'Apple A18', camera: '48MP Dual Camera with 2x Telephoto', battery: '4674mAh', os: 'iOS 18', isFeatured: false, isNewArrival: true, isBestSeller: false, rating: 4.7, reviews: 64 },
  { name: 'Apple iPhone 16 - 128GB - Teal', brand: 'Apple', price: 79900, originalPrice: 89900, ram: '8GB', storage: '128GB', color: 'Teal', display: '6.1-inch Super Retina XDR OLED', processor: 'Apple A18', camera: '48MP Dual Camera with 2x Telephoto', battery: '3561mAh', os: 'iOS 18', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.8, reviews: 110 },
  { name: 'Apple iPhone 15 Pro Max - 256GB - Blue Titanium', brand: 'Apple', price: 134900, originalPrice: 159900, ram: '8GB', storage: '256GB', color: 'Blue Titanium', display: '6.7-inch Super Retina XDR OLED 120Hz', processor: 'Apple A17 Pro (3nm)', camera: '48MP + 12MP + 12MP 5x Telephoto', battery: '4422mAh', os: 'iOS 17', isFeatured: true, isNewArrival: false, isBestSeller: true, rating: 4.8, reviews: 320 },
  { name: 'Apple iPhone 15 Pro - 128GB - Black Titanium', brand: 'Apple', price: 109900, originalPrice: 134900, ram: '8GB', storage: '128GB', color: 'Black Titanium', display: '6.1-inch Super Retina XDR OLED 120Hz', processor: 'Apple A17 Pro (3nm)', camera: '48MP + 12MP + 12MP 3x Telephoto', battery: '3274mAh', os: 'iOS 17', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.7, reviews: 245 },
  { name: 'Apple iPhone 15 Plus - 128GB - Pink', brand: 'Apple', price: 79900, originalPrice: 89900, ram: '6GB', storage: '128GB', color: 'Pink', display: '6.7-inch Super Retina XDR OLED', processor: 'Apple A16 Bionic', camera: '48MP Dual Camera', battery: '4383mAh', os: 'iOS 17', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.6, reviews: 85 },
  { name: 'Apple iPhone 15 - 128GB - Green', brand: 'Apple', price: 69900, originalPrice: 79900, ram: '6GB', storage: '128GB', color: 'Green', display: '6.1-inch Super Retina XDR OLED', processor: 'Apple A16 Bionic', camera: '48MP Dual Camera', battery: '3349mAh', os: 'iOS 17', isFeatured: true, isNewArrival: false, isBestSeller: true, rating: 4.8, reviews: 412 },
  { name: 'Apple iPhone 14 - 128GB - Midnight', brand: 'Apple', price: 58900, originalPrice: 69900, ram: '6GB', storage: '128GB', color: 'Midnight', display: '6.1-inch Super Retina XDR OLED', processor: 'Apple A15 Bionic', camera: '12MP Dual Camera', battery: '3279mAh', os: 'iOS 16', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 520 },
  { name: 'Apple iPhone 13 - 128GB - Starlight', brand: 'Apple', price: 49900, originalPrice: 59900, ram: '4GB', storage: '128GB', color: 'Starlight', display: '6.1-inch Super Retina XDR OLED', processor: 'Apple A15 Bionic', camera: '12MP Dual Camera', battery: '3227mAh', os: 'iOS 15', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.7, reviews: 680 },

  // ── SAMSUNG (11-20) ──
  { name: 'Samsung Galaxy S24 Ultra - 256GB - Titanium Gray', brand: 'Samsung', price: 129999, originalPrice: 144999, ram: '12GB', storage: '256GB', color: 'Titanium Gray', display: '6.8-inch Dynamic AMOLED 2X 120Hz', processor: 'Snapdragon 8 Gen 3 for Galaxy', camera: '200MP + 50MP + 12MP + 10MP Quad', battery: '5000mAh', os: 'Android 14 (One UI 6.1)', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.9, reviews: 290 },
  { name: 'Samsung Galaxy S24+ - 256GB - Cobalt Violet', brand: 'Samsung', price: 99999, originalPrice: 109999, ram: '12GB', storage: '256GB', color: 'Cobalt Violet', display: '6.7-inch Dynamic AMOLED 2X 120Hz', processor: 'Exynos 2400 Deca-Core', camera: '50MP + 12MP + 10MP Triple', battery: '4900mAh', os: 'Android 14 (One UI 6.1)', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.7, reviews: 115 },
  { name: 'Samsung Galaxy S24 - 128GB - Onyx Black', brand: 'Samsung', price: 74999, originalPrice: 84999, ram: '8GB', storage: '128GB', color: 'Onyx Black', display: '6.2-inch Dynamic AMOLED 2X 120Hz', processor: 'Exynos 2400', camera: '50MP + 12MP + 10MP Triple', battery: '4000mAh', os: 'Android 14 (One UI 6.1)', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 185 },
  { name: 'Samsung Galaxy S23 Ultra - 256GB - Phantom Black', brand: 'Samsung', price: 94999, originalPrice: 124999, ram: '12GB', storage: '256GB', color: 'Phantom Black', display: '6.8-inch Dynamic AMOLED 2X 120Hz', processor: 'Snapdragon 8 Gen 2 for Galaxy', camera: '200MP + 12MP + 10MP + 10MP', battery: '5000mAh', os: 'Android 14', isFeatured: true, isNewArrival: false, isBestSeller: true, rating: 4.8, reviews: 450 },
  { name: 'Samsung Galaxy S23 FE - 128GB - Mint', brand: 'Samsung', price: 39999, originalPrice: 54999, ram: '8GB', storage: '128GB', color: 'Mint', display: '6.4-inch Dynamic AMOLED 2X 120Hz', processor: 'Exynos 2200', camera: '50MP + 12MP + 8MP Triple', battery: '4500mAh', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.5, reviews: 210 },
  { name: 'Samsung Galaxy Z Fold 6 - 256GB - Silver Shadow', brand: 'Samsung', price: 164999, originalPrice: 179999, ram: '12GB', storage: '256GB', color: 'Silver Shadow', display: '7.6-inch Foldable Dynamic AMOLED 2X', processor: 'Snapdragon 8 Gen 3 for Galaxy', camera: '50MP + 12MP + 10MP Triple', battery: '4400mAh', os: 'Android 14', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.8, reviews: 75 },
  { name: 'Samsung Galaxy Z Flip 6 - 256GB - Mint', brand: 'Samsung', price: 109999, originalPrice: 119999, ram: '12GB', storage: '256GB', color: 'Mint', display: '6.7-inch Foldable Dynamic AMOLED 2X', processor: 'Snapdragon 8 Gen 3 for Galaxy', camera: '50MP + 12MP Dual', battery: '4000mAh', os: 'Android 14', isFeatured: false, isNewArrival: true, isBestSeller: false, rating: 4.7, reviews: 88 },
  { name: 'Samsung Galaxy A55 5G - 128GB - Awesome Iceblue', brand: 'Samsung', price: 36999, originalPrice: 42999, ram: '8GB', storage: '128GB', color: 'Awesome Iceblue', display: '6.6-inch Super AMOLED 120Hz', processor: 'Exynos 1480 Octa-Core', camera: '50MP OIS + 12MP + 5MP', battery: '5000mAh', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 310 },
  { name: 'Samsung Galaxy A35 5G - 128GB - Awesome Navy', brand: 'Samsung', price: 27999, originalPrice: 33999, ram: '8GB', storage: '128GB', color: 'Awesome Navy', display: '6.6-inch Super AMOLED 120Hz', processor: 'Exynos 1380', camera: '50MP OIS + 8MP + 5MP', battery: '5000mAh', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.4, reviews: 140 },
  { name: 'Samsung Galaxy M35 5G - 128GB - Daybreak Blue', brand: 'Samsung', price: 19999, originalPrice: 24999, ram: '6GB', storage: '128GB', color: 'Daybreak Blue', display: '6.6-inch Super AMOLED 120Hz', processor: 'Exynos 1380', camera: '50MP OIS + 8MP + 2MP', battery: '6000mAh Monster', os: 'Android 14', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.5, reviews: 260 },

  // ── GOOGLE (21-30) ──
  { name: 'Google Pixel 9 Pro XL - 128GB - Obsidian', brand: 'Google', price: 124999, originalPrice: 134999, ram: '16GB', storage: '128GB', color: 'Obsidian', display: '6.8-inch Super Actua LTPO OLED 120Hz', processor: 'Google Tensor G4 (4nm)', camera: '50MP + 48MP 5x Tele + 48MP Ultrawide', battery: '5060mAh', os: 'Android 14 with 7 yrs updates', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.9, reviews: 105 },
  { name: 'Google Pixel 9 Pro - 128GB - Porcelain', brand: 'Google', price: 109999, originalPrice: 119999, ram: '16GB', storage: '128GB', color: 'Porcelain', display: '6.3-inch Super Actua LTPO OLED 120Hz', processor: 'Google Tensor G4', camera: '50MP + 48MP 5x Tele + 48MP Ultrawide', battery: '4700mAh', os: 'Android 14', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.8, reviews: 80 },
  { name: 'Google Pixel 9 - 128GB - Wintergreen', brand: 'Google', price: 79999, originalPrice: 89999, ram: '12GB', storage: '128GB', color: 'Wintergreen', display: '6.3-inch Actua OLED 120Hz', processor: 'Google Tensor G4', camera: '50MP Main + 48MP Ultrawide', battery: '4700mAh', os: 'Android 14', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 92 },
  { name: 'Google Pixel 8 Pro - 128GB - Bay Blue', brand: 'Google', price: 84999, originalPrice: 106999, ram: '12GB', storage: '128GB', color: 'Bay Blue', display: '6.7-inch Super Actua LTPO OLED 120Hz', processor: 'Google Tensor G3', camera: '50MP + 48MP 5x Tele + 48MP Ultrawide', battery: '5050mAh', os: 'Android 14', isFeatured: true, isNewArrival: false, isBestSeller: true, rating: 4.7, reviews: 340 },
  { name: 'Google Pixel 8 - 128GB - Rose', brand: 'Google', price: 59999, originalPrice: 75999, ram: '8GB', storage: '128GB', color: 'Rose', display: '6.2-inch Actua OLED 120Hz', processor: 'Google Tensor G3', camera: '50MP + 12MP Ultrawide', battery: '4575mAh', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 220 },
  { name: 'Google Pixel 8a - 128GB - Aloe Green', brand: 'Google', price: 47999, originalPrice: 52999, ram: '8GB', storage: '128GB', color: 'Aloe Green', display: '6.1-inch Actua OLED 120Hz', processor: 'Google Tensor G3', camera: '64MP + 13MP Ultrawide', battery: '4492mAh', os: 'Android 14', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.6, reviews: 155 },
  { name: 'Google Pixel 7 Pro - 128GB - Hazel', brand: 'Google', price: 64999, originalPrice: 84999, ram: '12GB', storage: '128GB', color: 'Hazel', display: '6.7-inch LTPO AMOLED 120Hz', processor: 'Google Tensor G2', camera: '50MP + 48MP 5x Tele + 12MP Ultrawide', battery: '5000mAh', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.5, reviews: 390 },
  { name: 'Google Pixel 7 - 128GB - Lemongrass', brand: 'Google', price: 42999, originalPrice: 59999, ram: '8GB', storage: '128GB', color: 'Lemongrass', display: '6.3-inch AMOLED 90Hz', processor: 'Google Tensor G2', camera: '50MP + 12MP Ultrawide', battery: '4355mAh', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.5, reviews: 280 },
  { name: 'Google Pixel 7a - 128GB - Sea', brand: 'Google', price: 34999, originalPrice: 43999, ram: '8GB', storage: '128GB', color: 'Sea', display: '6.1-inch OLED 90Hz', processor: 'Google Tensor G2', camera: '64MP + 13MP Ultrawide', battery: '4385mAh', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.5, reviews: 420 },
  { name: 'Google Pixel Fold - 256GB - Obsidian', brand: 'Google', price: 139999, originalPrice: 174999, ram: '12GB', storage: '256GB', color: 'Obsidian', display: '7.6-inch Foldable OLED 120Hz', processor: 'Google Tensor G2', camera: '48MP + 10.8MP 5x Tele + 10.8MP Ultrawide', battery: '4821mAh', os: 'Android 14', isFeatured: true, isNewArrival: false, isBestSeller: false, rating: 4.6, reviews: 55 },

  // ── ONEPLUS (31-40) ──
  { name: 'OnePlus 12 - 256GB - Flowy Emerald', brand: 'OnePlus', price: 64999, originalPrice: 69999, ram: '12GB', storage: '256GB', color: 'Flowy Emerald', display: '6.82-inch 2K LTPO ProXDR AMOLED 120Hz', processor: 'Snapdragon 8 Gen 3', camera: '50MP Sony LYT-808 + 64MP 3x + 48MP Hasselblad', battery: '5400mAh 100W SUPERVOOC', os: 'OxygenOS 14', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.8, reviews: 310 },
  { name: 'OnePlus 12R - 128GB - Cool Blue', brand: 'OnePlus', price: 39999, originalPrice: 42999, ram: '8GB', storage: '128GB', color: 'Cool Blue', display: '6.78-inch 1.5K LTPO4 AMOLED 120Hz', processor: 'Snapdragon 8 Gen 2', camera: '50MP Sony IMX890 + 8MP + 2MP', battery: '5500mAh 100W SUPERVOOC', os: 'OxygenOS 14', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 450 },
  { name: 'OnePlus 11 5G - 128GB - Titan Black', brand: 'OnePlus', price: 49999, originalPrice: 56999, ram: '8GB', storage: '128GB', color: 'Titan Black', display: '6.7-inch 2K Fluid AMOLED 120Hz', processor: 'Snapdragon 8 Gen 2', camera: '50MP + 32MP 2x Tele + 48MP Hasselblad', battery: '5000mAh 100W', os: 'OxygenOS 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 380 },
  { name: 'OnePlus 11R 5G - 128GB - Galactic Silver', brand: 'OnePlus', price: 29999, originalPrice: 39999, ram: '8GB', storage: '128GB', color: 'Galactic Silver', display: '6.74-inch 1.5K Super Fluid AMOLED 120Hz', processor: 'Snapdragon 8+ Gen 1', camera: '50MP Sony IMX890 + 8MP + 2MP', battery: '5000mAh 100W', os: 'OxygenOS 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.7, reviews: 620 },
  { name: 'OnePlus Open - 512GB - Emerald Dusk', brand: 'OnePlus', price: 139999, originalPrice: 149999, ram: '16GB', storage: '512GB', color: 'Emerald Dusk', display: '7.82-inch Flexi-fluid AMOLED 120Hz', processor: 'Snapdragon 8 Gen 2', camera: '48MP + 64MP 3x Tele + 48MP Hasselblad', battery: '4805mAh 67W', os: 'OxygenOS 14', isFeatured: true, isNewArrival: false, isBestSeller: false, rating: 4.9, reviews: 72 },
  { name: 'OnePlus Nord 4 - 256GB - Mercurial Silver', brand: 'OnePlus', price: 32999, originalPrice: 35999, ram: '8GB', storage: '256GB', color: 'Mercurial Silver', display: '6.74-inch AMOLED 120Hz', processor: 'Snapdragon 7+ Gen 3', camera: '50MP Sony LYT-600 OIS + 8MP', battery: '5500mAh 100W', os: 'OxygenOS 14.1', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 180 },
  { name: 'OnePlus Nord CE4 - 128GB - Celadon Marble', brand: 'OnePlus', price: 24999, originalPrice: 27999, ram: '8GB', storage: '128GB', color: 'Celadon Marble', display: '6.7-inch Fluid AMOLED 120Hz', processor: 'Snapdragon 7 Gen 3', camera: '50MP Sony LYT-600 + 8MP', battery: '5500mAh 100W SUPERVOOC', os: 'OxygenOS 14', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.6, reviews: 290 },
  { name: 'OnePlus Nord CE4 Lite - 128GB - Mega Blue', brand: 'OnePlus', price: 19999, originalPrice: 21999, ram: '8GB', storage: '128GB', color: 'Mega Blue', display: '6.67-inch AMOLED 120Hz', processor: 'Snapdragon 695 5G', camera: '50MP Sony LYT-600 OIS + 2MP', battery: '5500mAh 80W', os: 'OxygenOS 14', isFeatured: false, isNewArrival: true, isBestSeller: false, rating: 4.4, reviews: 110 },
  { name: 'OnePlus Nord 3 5G - 128GB - Tempest Gray', brand: 'OnePlus', price: 27999, originalPrice: 33999, ram: '8GB', storage: '128GB', color: 'Tempest Gray', display: '6.74-inch Super Fluid AMOLED 120Hz', processor: 'MediaTek Dimensity 9000', camera: '50MP Sony IMX890 OIS + 8MP + 2MP', battery: '5000mAh 80W', os: 'OxygenOS 13.1', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.5, reviews: 230 },
  { name: 'OnePlus 10T 5G - 128GB - Moonstone Black', brand: 'OnePlus', price: 34999, originalPrice: 49999, ram: '8GB', storage: '128GB', color: 'Moonstone Black', display: '6.7-inch Fluid AMOLED 120Hz', processor: 'Snapdragon 8+ Gen 1', camera: '50MP Sony IMX766 + 8MP + 2MP', battery: '4800mAh 150W SUPERVOOC', os: 'OxygenOS 13', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.4, reviews: 310 },

  // ── XIAOMI (41-50) ──
  { name: 'Xiaomi 14 Ultra - 512GB - White', brand: 'Xiaomi', price: 99999, originalPrice: 119999, ram: '16GB', storage: '512GB', color: 'White', display: '6.73-inch WQHD+ LTPO AMOLED 120Hz', processor: 'Snapdragon 8 Gen 3', camera: '50MP 1-inch LYT-900 + 50MP + 50MP + 50MP Leica Quad', battery: '5000mAh 90W HyperCharge', os: 'Xiaomi HyperOS', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.9, reviews: 95 },
  { name: 'Xiaomi 14 - 512GB - Jade Green', brand: 'Xiaomi', price: 69999, originalPrice: 79999, ram: '12GB', storage: '512GB', color: 'Jade Green', display: '6.36-inch 1.5K LTPO AMOLED 120Hz', processor: 'Snapdragon 8 Gen 3', camera: '50MP Light Hunter 900 + 50MP 3.2x Tele + 50MP Leica', battery: '4610mAh 90W', os: 'Xiaomi HyperOS', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.8, reviews: 140 },
  { name: 'Xiaomi 13T Pro - 256GB - Alpine Blue', brand: 'Xiaomi', price: 44999, originalPrice: 54999, ram: '12GB', storage: '256GB', color: 'Alpine Blue', display: '6.67-inch CrystalRes AMOLED 144Hz', processor: 'MediaTek Dimensity 9200+', camera: '50MP + 50MP Tele + 12MP Leica', battery: '5000mAh 120W', os: 'HyperOS', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.6, reviews: 85 },
  { name: 'Xiaomi Redmi Note 13 Pro+ 5G - 256GB - Fusion Purple', brand: 'Xiaomi', price: 31999, originalPrice: 35999, ram: '8GB', storage: '256GB', color: 'Fusion Purple', display: '6.67-inch 1.5K Curved AMOLED 120Hz', processor: 'MediaTek Dimensity 7200 Ultra', camera: '200MP Samsung ISOCELL HP3 OIS + 8MP + 2MP', battery: '5000mAh 120W HyperCharge', os: 'HyperOS', isFeatured: true, isNewArrival: false, isBestSeller: true, rating: 4.7, reviews: 520 },
  { name: 'Xiaomi Redmi Note 13 Pro - 128GB - Midnight Black', brand: 'Xiaomi', price: 24999, originalPrice: 28999, ram: '8GB', storage: '128GB', color: 'Midnight Black', display: '6.67-inch 1.5K AMOLED 120Hz', processor: 'Snapdragon 7s Gen 2', camera: '200MP OIS + 8MP + 2MP', battery: '5100mAh 67W Turbo Charge', os: 'HyperOS', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 430 },
  { name: 'Xiaomi Redmi Note 13 5G - 128GB - Prism Gold', brand: 'Xiaomi', price: 16999, originalPrice: 20999, ram: '6GB', storage: '128GB', color: 'Prism Gold', display: '6.67-inch FHD+ AMOLED 120Hz', processor: 'MediaTek Dimensity 6080', camera: '108MP 3x In-sensor zoom + 2MP', battery: '5000mAh 33W', os: 'MIUI 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.5, reviews: 680 },
  { name: 'Xiaomi Poco F6 Pro - 256GB - Black', brand: 'Xiaomi', price: 39999, originalPrice: 45999, ram: '12GB', storage: '256GB', color: 'Black', display: '6.67-inch WQHD+ Flow AMOLED 120Hz', processor: 'Snapdragon 8 Gen 2', camera: '50MP Light Fusion 800 OIS + 8MP + 2MP', battery: '5000mAh 120W', os: 'Xiaomi HyperOS', isFeatured: false, isNewArrival: true, isBestSeller: false, rating: 4.7, reviews: 110 },
  { name: 'Xiaomi Poco F6 5G - 256GB - Titanium', brand: 'Xiaomi', price: 29999, originalPrice: 33999, ram: '8GB', storage: '256GB', color: 'Titanium', display: '6.67-inch 1.5K AMOLED 120Hz', processor: 'Snapdragon 8s Gen 3', camera: '50MP Sony IMX882 OIS + 8MP', battery: '5000mAh 90W Turbo', os: 'HyperOS', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 290 },
  { name: 'Xiaomi Poco X6 Pro 5G - 256GB - Yellow', brand: 'Xiaomi', price: 23999, originalPrice: 26999, ram: '8GB', storage: '256GB', color: 'Yellow', display: '6.67-inch 1.5K Flow AMOLED 120Hz', processor: 'MediaTek Dimensity 8300 Ultra', camera: '64MP OIS + 8MP + 2MP', battery: '5000mAh 67W', os: 'HyperOS', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 490 },
  { name: 'Xiaomi Redmi 13C 5G - 128GB - Starlight Black', brand: 'Xiaomi', price: 10499, originalPrice: 13999, ram: '4GB', storage: '128GB', color: 'Starlight Black', display: '6.74-inch 90Hz Display', processor: 'MediaTek Dimensity 6100+', camera: '50MP AI Dual Camera', battery: '5000mAh 18W', os: 'MIUI 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.3, reviews: 350 },

  // ── VIVO (51-60) ──
  { name: 'Vivo X100 Pro 5G - 512GB - Asteroid Black', brand: 'Vivo', price: 89999, originalPrice: 99999, ram: '16GB', storage: '512GB', color: 'Asteroid Black', display: '6.78-inch LTPO AMOLED 120Hz 3000nits', processor: 'MediaTek Dimensity 9300', camera: '50MP 1-inch Sony IMX989 + 50MP ZEISS APO Tele + 50MP', battery: '5400mAh 100W FlashCharge', os: 'Funtouch OS 14', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.9, reviews: 130 },
  { name: 'Vivo X100 5G - 256GB - Stargaze Blue', brand: 'Vivo', price: 63999, originalPrice: 69999, ram: '12GB', storage: '256GB', color: 'Stargaze Blue', display: '6.78-inch LTPO AMOLED 120Hz', processor: 'MediaTek Dimensity 9300', camera: '50MP Sony IMX920 + 64MP Tele + 50MP ZEISS', battery: '5000mAh 120W FlashCharge', os: 'Funtouch OS 14', isFeatured: false, isNewArrival: true, isBestSeller: false, rating: 4.8, reviews: 90 },
  { name: 'Vivo V30 Pro 5G - 256GB - Andaman Blue', brand: 'Vivo', price: 41999, originalPrice: 46999, ram: '8GB', storage: '256GB', color: 'Andaman Blue', display: '6.78-inch 1.5K 3D Curved AMOLED 120Hz', processor: 'MediaTek Dimensity 8200', camera: '50MP Sony IMX920 + 50MP Portrait + 50MP ZEISS', battery: '5000mAh 80W FlashCharge', os: 'Funtouch OS 14', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 220 },
  { name: 'Vivo V30 5G - 128GB - Peacock Green', brand: 'Vivo', price: 33999, originalPrice: 38999, ram: '8GB', storage: '128GB', color: 'Peacock Green', display: '6.78-inch 1.5K 3D Curved AMOLED 120Hz', processor: 'Snapdragon 7 Gen 3', camera: '50MP Studio Aura Light OIS + 50MP Ultrawide', battery: '5000mAh 80W', os: 'Funtouch OS 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 180 },
  { name: 'Vivo V29 5G - 128GB - Himalayan Blue', brand: 'Vivo', price: 31999, originalPrice: 37999, ram: '8GB', storage: '128GB', color: 'Himalayan Blue', display: '6.78-inch 1.5K 3D Curved AMOLED 120Hz', processor: 'Snapdragon 778G', camera: '50MP OIS Night + 8MP + 2MP', battery: '4600mAh 80W', os: 'Funtouch OS 13', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.5, reviews: 290 },
  { name: 'Vivo T3 Pro 5G - 128GB - Sandstone Orange', brand: 'Vivo', price: 24999, originalPrice: 28999, ram: '8GB', storage: '128GB', color: 'Sandstone Orange', display: '6.77-inch 3D Curved AMOLED 120Hz', processor: 'Snapdragon 7 Gen 3', camera: '50MP Sony IMX882 OIS + 8MP Ultrawide', battery: '5500mAh 80W FlashCharge', os: 'Funtouch OS 14', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 160 },
  { name: 'Vivo T3 5G - 128GB - Cosmic Blue', brand: 'Vivo', price: 19999, originalPrice: 22999, ram: '8GB', storage: '128GB', color: 'Cosmic Blue', display: '6.67-inch AMOLED 120Hz', processor: 'MediaTek Dimensity 7200', camera: '50MP Sony IMX882 OIS + 2MP', battery: '5000mAh 44W FlashCharge', os: 'Funtouch OS 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 340 },
  { name: 'Vivo T3x 5G - 128GB - Crimson Bliss', brand: 'Vivo', price: 13499, originalPrice: 17499, ram: '6GB', storage: '128GB', color: 'Crimson Bliss', display: '6.72-inch FHD+ 120Hz Ultra Vision', processor: 'Snapdragon 6 Gen 1', camera: '50MP Dual Camera', battery: '6000mAh Turbo Battery', os: 'Funtouch OS 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.5, reviews: 420 },
  { name: 'Vivo Y200 5G - 128GB - Desert Gold', brand: 'Vivo', price: 21999, originalPrice: 26999, ram: '8GB', storage: '128GB', color: 'Desert Gold', display: '6.67-inch Ultra Vision AMOLED 120Hz', processor: 'Snapdragon 4 Gen 1', camera: '64MP OIS Anti-Shake + 2MP Bokeh', battery: '4800mAh 44W', os: 'Funtouch OS 13', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.4, reviews: 175 },
  { name: 'Vivo Y28 5G - 128GB - Crystal Purple', brand: 'Vivo', price: 13999, originalPrice: 17999, ram: '4GB', storage: '128GB', color: 'Crystal Purple', display: '6.56-inch 90Hz High Brightness', processor: 'MediaTek Dimensity 6020', camera: '50MP Dual Rear Camera', battery: '5000mAh 15W', os: 'Funtouch OS 13', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.3, reviews: 120 },

  // ── OPPO (61-70) ──
  { name: 'Oppo Find X7 Ultra - 256GB - Ocean Blue', brand: 'Oppo', price: 89999, originalPrice: 104999, ram: '16GB', storage: '256GB', color: 'Ocean Blue', display: '6.82-inch LTPO AMOLED 120Hz 4500nits', processor: 'Snapdragon 8 Gen 3', camera: '50MP 1-inch LYT-900 + Dual Periscope 50MP + 50MP Hasselblad', battery: '5000mAh 100W SuperVOOC', os: 'ColorOS 14', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.9, reviews: 60 },
  { name: 'Oppo Find N3 Flip - 256GB - Sleek Black', brand: 'Oppo', price: 74999, originalPrice: 94999, ram: '12GB', storage: '256GB', color: 'Sleek Black', display: '6.8-inch Foldable LTPO AMOLED 120Hz', processor: 'MediaTek Dimensity 9200', camera: '50MP + 32MP 2x Tele + 48MP Hasselblad Triple', battery: '4300mAh 44W', os: 'ColorOS 13.2', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.6, reviews: 75 },
  { name: 'Oppo Reno 12 Pro 5G - 256GB - Sunset Gold', brand: 'Oppo', price: 36999, originalPrice: 40999, ram: '12GB', storage: '256GB', color: 'Sunset Gold', display: '6.7-inch Quad-Curved AMOLED 120Hz', processor: 'MediaTek Dimensity 7300-Energy', camera: '50MP Sony LYT-600 OIS + 50MP Tele + 8MP AI Phone', battery: '5000mAh 80W SuperVOOC', os: 'ColorOS 14.1 (GenAI Features)', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 140 },
  { name: 'Oppo Reno 12 5G - 256GB - Astro Silver', brand: 'Oppo', price: 32999, originalPrice: 36999, ram: '8GB', storage: '256GB', color: 'Astro Silver', display: '6.7-inch 3D Curved AMOLED 120Hz', processor: 'MediaTek Dimensity 7300-Energy', camera: '50MP Sony LYT-600 OIS + 8MP + 2MP', battery: '5000mAh 80W', os: 'ColorOS 14.1', isFeatured: false, isNewArrival: true, isBestSeller: false, rating: 4.6, reviews: 88 },
  { name: 'Oppo Reno 11 Pro 5G - 256GB - Pearl White', brand: 'Oppo', price: 34999, originalPrice: 39999, ram: '12GB', storage: '256GB', color: 'Pearl White', display: '6.7-inch 3D Curved AMOLED 120Hz', processor: 'MediaTek Dimensity 8200', camera: '50MP Sony IMX890 OIS + 32MP Tele + 8MP', battery: '4600mAh 80W', os: 'ColorOS 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 230 },
  { name: 'Oppo Reno 11 5G - 128GB - Wave Green', brand: 'Oppo', price: 27999, originalPrice: 32999, ram: '8GB', storage: '128GB', color: 'Wave Green', display: '6.7-inch 3D Curved AMOLED 120Hz', processor: 'MediaTek Dimensity 7050', camera: '50MP Sony LYT-600 OIS + 32MP Tele + 8MP', battery: '5000mAh 67W', os: 'ColorOS 14', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.5, reviews: 190 },
  { name: 'Oppo F27 Pro+ 5G - 128GB - Dusk Pink', brand: 'Oppo', price: 27999, originalPrice: 31999, ram: '8GB', storage: '128GB', color: 'Dusk Pink', display: '6.7-inch 3D Curved AMOLED 120Hz IP69 Waterproof', processor: 'MediaTek Dimensity 7050', camera: '64MP AI Portrait OIS + 2MP', battery: '5000mAh 67W SuperVOOC', os: 'ColorOS 14', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 170 },
  { name: 'Oppo F25 Pro 5G - 128GB - Lava Red', brand: 'Oppo', price: 23999, originalPrice: 28999, ram: '8GB', storage: '128GB', color: 'Lava Red', display: '6.7-inch Borderless AMOLED 120Hz', processor: 'MediaTek Dimensity 7050', camera: '64MP Ultra-Clear Triple Camera', battery: '5000mAh 67W', os: 'ColorOS 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.5, reviews: 310 },
  { name: 'Oppo A79 5G - 128GB - Mystery Black', brand: 'Oppo', price: 17499, originalPrice: 21999, ram: '8GB', storage: '128GB', color: 'Mystery Black', display: '6.72-inch FHD+ 90Hz Sunlight Display', processor: 'MediaTek Dimensity 6020', camera: '50MP AI Dual Camera', battery: '5000mAh 33W', os: 'ColorOS 13.1', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.4, reviews: 160 },
  { name: 'Oppo A38 - 128GB - Glowing Gold', brand: 'Oppo', price: 9999, originalPrice: 12999, ram: '4GB', storage: '128GB', color: 'Glowing Gold', display: '6.56-inch 90Hz Sunlight Display', processor: 'MediaTek Helio G85', camera: '50MP AI Camera', battery: '5000mAh 33W SUPERVOOC', os: 'ColorOS 13.1', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.3, reviews: 220 },

  // ── REALME (71-80) ──
  { name: 'Realme GT 6 - 256GB - Fluid Silver', brand: 'Realme', price: 40999, originalPrice: 44999, ram: '12GB', storage: '256GB', color: 'Fluid Silver', display: '6.78-inch 1.5K 8T LTPO AMOLED 120Hz 6000nits', processor: 'Snapdragon 8s Gen 3', camera: '50MP Sony LYT-808 OIS + 50MP Tele + 8MP', battery: '5500mAh 120W Ultra Charge', os: 'realme UI 5.0 (AI Smart)', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.8, reviews: 180 },
  { name: 'Realme GT 6T - 128GB - Razor Green', brand: 'Realme', price: 30999, originalPrice: 34999, ram: '8GB', storage: '128GB', color: 'Razor Green', display: '6.78-inch 1.5K 8T LTPO AMOLED 120Hz 6000nits', processor: 'Snapdragon 7+ Gen 3', camera: '50MP Sony LYT-600 OIS + 8MP', battery: '5500mAh 120W SuperVOOC', os: 'realme UI 5.0', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 250 },
  { name: 'Realme 12 Pro+ 5G - 256GB - Submarine Blue', brand: 'Realme', price: 29999, originalPrice: 34999, ram: '12GB', storage: '256GB', color: 'Submarine Blue', display: '6.7-inch 120Hz Curved Vision AMOLED', processor: 'Snapdragon 7s Gen 2', camera: '64MP Periscope Telephoto 3x + 50MP Sony IMX890 OIS', battery: '5000mAh 67W', os: 'realme UI 5.0', isFeatured: true, isNewArrival: false, isBestSeller: true, rating: 4.7, reviews: 410 },
  { name: 'Realme 12 Pro 5G - 128GB - Navigator Beige', brand: 'Realme', price: 23999, originalPrice: 28999, ram: '8GB', storage: '128GB', color: 'Navigator Beige', display: '6.7-inch 120Hz Curved Vision AMOLED', processor: 'Snapdragon 6 Gen 1', camera: '50MP Sony IMX882 OIS + 32MP Telephoto 2x', battery: '5000mAh 67W', os: 'realme UI 5.0', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.6, reviews: 190 },
  { name: 'Realme 12+ 5G - 128GB - Pioneer Green', brand: 'Realme', price: 18999, originalPrice: 22999, ram: '8GB', storage: '128GB', color: 'Pioneer Green', display: '6.67-inch 120Hz Ultra Smooth AMOLED', processor: 'MediaTek Dimensity 7050', camera: '50MP Sony LYT-600 OIS + 8MP + 2MP', battery: '5000mAh 67W', os: 'realme UI 5.0', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.5, reviews: 320 },
  { name: 'Realme 12 5G - 128GB - Woodland Green', brand: 'Realme', price: 16999, originalPrice: 19999, ram: '6GB', storage: '128GB', color: 'Woodland Green', display: '6.72-inch 120Hz FHD+ Display', processor: 'MediaTek Dimensity 6100+', camera: '108MP 3x Zoom Camera + 2MP', battery: '5000mAh 45W', os: 'realme UI 5.0', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.4, reviews: 170 },
  { name: 'Realme P1 Pro 5G - 128GB - Phoenix Red', brand: 'Realme', price: 19999, originalPrice: 22999, ram: '8GB', storage: '128GB', color: 'Phoenix Red', display: '6.7-inch 120Hz Curved AMOLED', processor: 'Snapdragon 6 Gen 1', camera: '50MP Sony LYT-600 OIS + 8MP', battery: '5000mAh 45W SUPERVOOC', os: 'realme UI 5.0', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.6, reviews: 195 },
  { name: 'Realme P1 5G - 128GB - Peacock Green', brand: 'Realme', price: 14999, originalPrice: 17999, ram: '6GB', storage: '128GB', color: 'Peacock Green', display: '6.67-inch 120Hz AMOLED', processor: 'MediaTek Dimensity 7050', camera: '50MP Dual Camera', battery: '5000mAh 45W', os: 'realme UI 5.0', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.5, reviews: 310 },
  { name: 'Realme Narzo 70 Pro 5G - 128GB - Glass Green', brand: 'Realme', price: 18999, originalPrice: 23999, ram: '8GB', storage: '128GB', color: 'Glass Green', display: '6.67-inch 120Hz Horizon AMOLED', processor: 'MediaTek Dimensity 7050', camera: '50MP Sony IMX890 OIS Flagship + 8MP + 2MP', battery: '5000mAh 67W', os: 'realme UI 5.0', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 480 },
  { name: 'Realme C67 5G - 128GB - Sunny Oasis', brand: 'Realme', price: 11999, originalPrice: 14999, ram: '4GB', storage: '128GB', color: 'Sunny Oasis', display: '6.72-inch 120Hz FHD+ Display', processor: 'MediaTek Dimensity 6100+', camera: '50MP AI Camera', battery: '5000mAh 33W', os: 'realme UI', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.3, reviews: 290 },

  // ── MOTOROLA (81-90) ──
  { name: 'Motorola Edge 50 Ultra - 512GB - Peach Fuzz', brand: 'Motorola', price: 59999, originalPrice: 64999, ram: '16GB', storage: '512GB', color: 'Peach Fuzz', display: '6.7-inch Super HD 1.5K pOLED 144Hz', processor: 'Snapdragon 8s Gen 3', camera: '50MP OIS + 64MP 3x Telephoto + 50MP Ultrawide', battery: '4500mAh 125W TurboPower + 50W Wireless', os: 'Hello UI (Android 14)', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.8, reviews: 75 },
  { name: 'Motorola Edge 50 Pro - 256GB - Black Beauty', brand: 'Motorola', price: 31999, originalPrice: 36999, ram: '12GB', storage: '256GB', color: 'Black Beauty', display: '6.7-inch 1.5K 144Hz 3D Curved pOLED', processor: 'Snapdragon 7 Gen 3', camera: '50MP OIS AI + 10MP 3x Tele + 13MP Ultrawide', battery: '4500mAh 125W TurboPower', os: 'Hello UI', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 380 },
  { name: 'Motorola Edge 50 Fusion - 128GB - Marshmallow Blue', brand: 'Motorola', price: 22999, originalPrice: 25999, ram: '8GB', storage: '128GB', color: 'Marshmallow Blue', display: '6.7-inch 144Hz 3D Curved pOLED', processor: 'Snapdragon 7s Gen 2', camera: '50MP Sony LYT-700C OIS + 13MP Ultrawide/Macro', battery: '5000mAh 68W TurboPower', os: 'Hello UI', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 490 },
  { name: 'Motorola Razr 50 Ultra - 512GB - Midnight Blue', brand: 'Motorola', price: 99999, originalPrice: 119999, ram: '12GB', storage: '512GB', color: 'Midnight Blue', display: '6.9-inch Foldable 165Hz LTPO pOLED + 4-inch External', processor: 'Snapdragon 8s Gen 3', camera: '50MP OIS + 50MP 2x Telephoto Dual', battery: '4000mAh 45W TurboPower', os: 'Hello UI (Moto AI)', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.8, reviews: 45 },
  { name: 'Motorola Razr 40 Ultra - 256GB - Viva Magenta', brand: 'Motorola', price: 69999, originalPrice: 89999, ram: '8GB', storage: '256GB', color: 'Viva Magenta', display: '6.9-inch Foldable 165Hz pOLED + 3.6-inch External', processor: 'Snapdragon 8+ Gen 1', camera: '12MP OIS + 13MP Ultrawide', battery: '3800mAh 30W', os: 'Android 13', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.5, reviews: 110 },
  { name: 'Motorola Moto G85 5G - 128GB - Olive Green', brand: 'Motorola', price: 17999, originalPrice: 20999, ram: '8GB', storage: '128GB', color: 'Olive Green', display: '6.67-inch 120Hz 3D Curved pOLED', processor: 'Snapdragon 6s Gen 3', camera: '50MP Sony LYT-600 OIS + 8MP Ultrawide', battery: '5000mAh 33W', os: 'Hello UI', isFeatured: false, isNewArrival: true, isBestSeller: true, rating: 4.6, reviews: 260 },
  { name: 'Motorola Moto G64 5G - 128GB - Mint Green', brand: 'Motorola', price: 14999, originalPrice: 17999, ram: '8GB', storage: '128GB', color: 'Mint Green', display: '6.5-inch 120Hz FHD+ Display', processor: 'MediaTek Dimensity 7025', camera: '50MP OIS + 8MP Ultrawide', battery: '6000mAh Monster', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.5, reviews: 340 },
  { name: 'Motorola Moto G34 5G - 128GB - Ocean Green', brand: 'Motorola', price: 11999, originalPrice: 14999, ram: '8GB', storage: '128GB', color: 'Ocean Green', display: '6.5-inch 120Hz Display', processor: 'Snapdragon 695 5G', camera: '50MP Quad Pixel + 2MP', battery: '5000mAh 18W', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.4, reviews: 410 },
  { name: 'Motorola Edge 40 Neo - 128GB - Caneel Bay', brand: 'Motorola', price: 20999, originalPrice: 27999, ram: '8GB', storage: '128GB', color: 'Caneel Bay', display: '6.55-inch 144Hz 3D Curved pOLED IP68', processor: 'MediaTek Dimensity 7030', camera: '50MP OIS + 13MP Ultrawide/Macro', battery: '5000mAh 68W', os: 'Android 13', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.5, reviews: 520 },
  { name: 'Motorola Moto G24 Power - 128GB - Ink Blue', brand: 'Motorola', price: 8999, originalPrice: 11999, ram: '4GB', storage: '128GB', color: 'Ink Blue', display: '6.56-inch 90Hz Punch Hole', processor: 'MediaTek Helio G85', camera: '50MP Quad Pixel + 2MP Macro', battery: '6000mAh Massive Battery 33W', os: 'Android 14', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.3, reviews: 190 },

  // ── NOTHING (91-100) ──
  { name: 'Nothing Phone (2) - 256GB - Dark Grey', brand: 'Nothing', price: 36999, originalPrice: 49999, ram: '12GB', storage: '256GB', color: 'Dark Grey', display: '6.7-inch LTPO OLED 120Hz with Glyph Interface', processor: 'Snapdragon 8+ Gen 1', camera: '50MP Sony IMX890 OIS + 50MP Ultrawide', battery: '4700mAh 45W + 15W Wireless', os: 'Nothing OS 2.5 (Android 14)', isFeatured: true, isNewArrival: false, isBestSeller: true, rating: 4.7, reviews: 390 },
  { name: 'Nothing Phone (2) - 512GB - White', brand: 'Nothing', price: 42999, originalPrice: 54999, ram: '12GB', storage: '512GB', color: 'White', display: '6.7-inch LTPO OLED 120Hz Glyph Interface', processor: 'Snapdragon 8+ Gen 1', camera: '50MP Sony IMX890 OIS + 50MP Samsung JN1', battery: '4700mAh 45W', os: 'Nothing OS 2.5', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.7, reviews: 180 },
  { name: 'Nothing Phone (2a) Plus - 256GB - Metallic Grey', brand: 'Nothing', price: 29999, originalPrice: 32999, ram: '12GB', storage: '256GB', color: 'Metallic Grey', display: '6.7-inch Flexible AMOLED 120Hz 1300nits', processor: 'MediaTek Dimensity 7350 Pro 5G', camera: '50MP Samsung GN9 OIS + 50MP Ultrawide + 50MP Selfie', battery: '5000mAh 50W Fast Charging', os: 'Nothing OS 2.6', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.8, reviews: 145 },
  { name: 'Nothing Phone (2a) - 128GB - Black', brand: 'Nothing', price: 23999, originalPrice: 25999, ram: '8GB', storage: '128GB', color: 'Black', display: '6.7-inch Flexible AMOLED 120Hz Glyph Design', processor: 'MediaTek Dimensity 7200 Pro', camera: '50MP OIS + 50MP Ultrawide Dual 50MP', battery: '5000mAh 45W', os: 'Nothing OS 2.5', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.6, reviews: 520 },
  { name: 'Nothing Phone (2a) - 256GB - Milk White', brand: 'Nothing', price: 25999, originalPrice: 27999, ram: '8GB', storage: '256GB', color: 'Milk White', display: '6.7-inch Flexible AMOLED 120Hz', processor: 'MediaTek Dimensity 7200 Pro', camera: '50MP OIS + 50MP Ultrawide Dual 50MP', battery: '5000mAh 45W', os: 'Nothing OS 2.5', isFeatured: false, isNewArrival: false, isBestSeller: true, rating: 4.7, reviews: 310 },
  { name: 'Nothing Phone (2a) Special Edition - 256GB - Multi', brand: 'Nothing', price: 27999, originalPrice: 29999, ram: '12GB', storage: '256GB', color: 'Special Edition Multi', display: '6.7-inch Flexible AMOLED 120Hz Color Accent', processor: 'MediaTek Dimensity 7200 Pro', camera: '50MP OIS + 50MP Dual', battery: '5000mAh 45W', os: 'Nothing OS 2.6', isFeatured: true, isNewArrival: true, isBestSeller: false, rating: 4.8, reviews: 85 },
  { name: 'Nothing Phone (1) - 128GB - Black', brand: 'Nothing', price: 28999, originalPrice: 37999, ram: '8GB', storage: '128GB', color: 'Black', display: '6.55-inch OLED 120Hz Glyph Interface', processor: 'Snapdragon 778G+', camera: '50MP Sony IMX766 OIS + 50MP', battery: '4500mAh 33W', os: 'Nothing OS 2.0', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.4, reviews: 460 },
  { name: 'Nothing Phone (1) - 256GB - White', brand: 'Nothing', price: 31999, originalPrice: 39999, ram: '8GB', storage: '256GB', color: 'White', display: '6.55-inch OLED 120Hz Glyph Interface', processor: 'Snapdragon 778G+', camera: '50MP Sony IMX766 OIS + 50MP', battery: '4500mAh 33W', os: 'Nothing OS 2.0', isFeatured: false, isNewArrival: false, isBestSeller: false, rating: 4.5, reviews: 390 },
  { name: 'CMF Phone 1 by Nothing - 128GB - Orange', brand: 'Nothing', price: 15999, originalPrice: 19999, ram: '6GB', storage: '128GB', color: 'Orange', display: '6.67-inch Super AMOLED 120Hz 2000nits Modular Back', processor: 'MediaTek Dimensity 7300 5G', camera: '50MP Sony Main + Portrait Sensor', battery: '5000mAh 33W', os: 'Nothing OS 2.6 (Clean UI)', isFeatured: true, isNewArrival: true, isBestSeller: true, rating: 4.7, reviews: 290 },
  { name: 'CMF Phone 1 by Nothing - 256GB - Light Green', brand: 'Nothing', price: 17999, originalPrice: 21999, ram: '8GB', storage: '256GB', color: 'Light Green', display: '6.67-inch Super AMOLED 120Hz Modular Accessory Point', processor: 'MediaTek Dimensity 7300 5G', camera: '50MP Sony Main + Portrait', battery: '5000mAh 33W', os: 'Nothing OS 2.6', isFeatured: false, isNewArrival: true, isBestSeller: false, rating: 4.6, reviews: 140 }
];

const products = rawList.map((item, index) => {
  const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  const images = getImages(index);
  return {
    name: item.name,
    brand: item.brand,
    description: `${item.name} featuring ${item.processor}, ${item.display}, ${item.camera}, and ${item.battery}. Pre-loaded with ${item.os}.`,
    price: item.price,
    originalPrice: item.originalPrice,
    discount,
    stock: 25 + (index % 35),
    category: 'mobile',
    isNewArrival: item.isNewArrival,
    isBestSeller: item.isBestSeller,
    isFeatured: item.isFeatured,
    ratings: {
      average: item.rating,
      count: item.reviews * 3
    },
    numReviews: item.reviews,
    images,
    variants: [
      {
        storage: item.storage,
        color: item.color,
        ram: item.ram,
        price: item.price,
        stock: 25 + (index % 35)
      }
    ],
    specifications: {
      display: item.display,
      processor: item.processor,
      camera: item.camera,
      battery: item.battery,
      os: item.os,
      dimensions: '162 x 75 x 8 mm',
      weight: '190g'
    }
  };
});

async function run() {
  console.log(`🔑 Logging in to ${API_URL}...`);
  let token;
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');
    token = loginData.token;
    console.log('✅ Admin login successful!\n');
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  let existingMap = new Map();
  try {
    const res = await fetch(`${API_URL}/products?limit=200`);
    const data = await res.json();
    const existing = data.products || [];
    for (const p of existing) existingMap.set(p.name, p._id);
  } catch (err) {}

  console.log(`🚀 Inserting/Updating ${products.length} products...`);
  let inserted = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const existingId = existingMap.get(p.name);
    try {
      if (existingId) {
        await fetch(`${API_URL}/products/${existingId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });
      } else {
        const createRes = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });
        const createData = await createRes.json();
        if (createData.product?._id) {
          await fetch(`${API_URL}/products/${createData.product._id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: p.images })
          });
        }
      }
      inserted++;
      process.stdout.write(`\r   ✅ Done ${inserted}/${products.length}`);
    } catch (err) {
      console.log(`\n❌ Error: ${p.name} - ${err.message}`);
    }
  }

  console.log(`\n\n🎉 Done! All ${inserted} products ready!`);
}

run();
