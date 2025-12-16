const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.cart || user.cart.length === 0) {
      return res.json({ success: true, cart: [], total: 0 });
    }

    // Populate product details
    const cartItems = await Promise.all(
      user.cart.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) return null;
        
        return {
          _id: item._id,
          product: product._id,
          name: product.name,
          image: product.images[0]?.url || '',
          price: item.variant?.price || product.price,
          quantity: item.quantity,
          variant: item.variant,
          stock: product.stock
        };
      })
    );

    const validCartItems = cartItems.filter(item => item !== null);
    const total = validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({ success: true, cart: validCartItems, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const user = await User.findById(req.user.id);
    
    // Check if item already exists in cart
    const existingItemIndex = user.cart?.findIndex(
      item => item.product.toString() === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    ) ?? -1;

    if (existingItemIndex >= 0) {
      // Update quantity
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      if (!user.cart) user.cart = [];
      user.cart.push({
        product: productId,
        quantity,
        variant: variant || {}
      });
    }

    await user.save();

    res.json({ success: true, message: 'Item added to cart', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user.id);

    const itemIndex = user.cart?.findIndex(
      item => item._id.toString() === req.params.itemId
    ) ?? -1;

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity <= 0) {
      user.cart.splice(itemIndex, 1);
    } else {
      user.cart[itemIndex].quantity = quantity;
    }

    await user.save();

    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = user.cart?.filter(
      item => item._id.toString() !== req.params.itemId
    ) || [];

    await user.save();

    res.json({ success: true, message: 'Item removed from cart', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

