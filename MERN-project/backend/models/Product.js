const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Please add a brand'],
    enum: ['Samsung', 'Apple', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Nothing', 'Google', 'Motorola', 'Other']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  images: [{
    url: String,
    public_id: String
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  variants: [{
    storage: String, // e.g., "64GB", "128GB", "256GB"
    color: String,   // e.g., "Black", "White", "Blue"
    ram: String,     // e.g., "4GB", "6GB", "8GB"
    price: Number,
    stock: Number
  }],
  specifications: {
    display: String,
    processor: String,
    camera: String,
    battery: String,
    os: String,
    dimensions: String,
    weight: String
  },
  category: {
    type: String,
    default: 'mobile'
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  numReviews: {
    type: Number,
    default: 0
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null means store owner, otherwise vendor ID
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);

