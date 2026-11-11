const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/recommendations/:productId
// @desc    Get similar/recommended products
// @access  Public
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find similar products based on brand, price range, and ratings
    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      $or: [
        { brand: product.brand },
        { 
          price: { 
            $gte: product.price * 0.7, 
            $lte: product.price * 1.3 
          } 
        },
        { 'ratings.average': { $gte: product.ratings.average - 0.5 } }
      ]
    })
    .limit(8)
    .select('name brand price images ratings');

    res.json({ success: true, recommendations: similarProducts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/recommendations/user/based-on-views
// @desc    Get recommendations based on user's viewed products
// @access  Private
router.get('/user/based-on-views', protect, async (req, res) => {
  try {
    // This would typically use a user's view history
    // For now, return featured/best selling products
    const recommendations = await Product.find({
      $or: [
        { isFeatured: true },
        { isBestSeller: true }
      ]
    })
    .limit(8)
    .select('name brand price images ratings');

    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

