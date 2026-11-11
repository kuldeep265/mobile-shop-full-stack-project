const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort('-createdAt');

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if review already exists
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists. Update it instead.' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      rating,
      comment
    });

    // Update product ratings
    const reviews = await Review.find({ product: productId });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      'ratings.average': averageRating,
      'ratings.count': reviews.length,
      numReviews: reviews.length
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating: req.body.rating, comment: req.body.comment },
      { new: true, runValidators: true }
    ).populate('user', 'name');

    // Update product ratings
    const reviews = await Review.find({ product: review.product });
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.product, {
      'ratings.average': averageRating,
      'ratings.count': reviews.length
    });

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product ratings
    const reviews = await Review.find({ product: productId });
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Product.findByIdAndUpdate(productId, {
      'ratings.average': averageRating,
      'ratings.count': reviews.length,
      numReviews: reviews.length
    });

    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

