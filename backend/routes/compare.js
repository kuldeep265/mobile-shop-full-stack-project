const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/compare
// @desc    Compare products
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4) {
      return res.status(400).json({ message: 'Please provide 2-4 product IDs to compare' });
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(404).json({ message: 'One or more products not found' });
    }

    // Format comparison data
    const comparison = products.map(product => ({
      id: product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      images: product.images,
      specifications: product.specifications,
      ratings: product.ratings,
      variants: product.variants,
      stock: product.stock
    }));

    res.json({ success: true, comparison });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

