const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

// Initialize Stripe (only if key is provided)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const Razorpay = require('razorpay');

const router = express.Router();

// Initialize Razorpay (only if keys are provided)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      couponCode, 
      couponDiscount,
      appliedCoupons,
      totalCouponDiscount
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Calculate prices
    let itemsPrice = 0;
    const populatedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const price = item.variant?.price || product.price;
      itemsPrice += price * item.quantity;

      populatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price,
        quantity: item.quantity,
        variant: item.variant || {}
      });
    }

    // Handle both single coupon (backward compatibility) and multiple coupons
    let discount = 0;
    let finalAppliedCoupons = [];
    
    if (appliedCoupons && appliedCoupons.length > 0) {
      // Multiple coupons support
      discount = totalCouponDiscount || 0;
      finalAppliedCoupons = appliedCoupons;
    } else if (couponDiscount) {
      // Single coupon (backward compatibility)
      discount = couponDiscount;
      if (couponCode) {
        finalAppliedCoupons = [{
          code: couponCode,
          discount: couponDiscount,
          applicableItems: []
        }];
      }
    }

    const afterDiscount = itemsPrice - discount;
    const taxPrice = afterDiscount * 0.18; // 18% GST
    const shippingPrice = afterDiscount > 5000 ? 0 : 100;
    const totalPrice = afterDiscount + taxPrice + shippingPrice;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems: populatedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discount,
      couponCode: couponCode || (finalAppliedCoupons.length > 0 ? finalAppliedCoupons.map(c => c.code).join(', ') : undefined),
      appliedCoupons: finalAppliedCoupons,
      totalPrice,
      isPaid: paymentMethod === 'cod' ? false : false,
      status: 'pending'
    });

    // Update product stock
    for (const item of populatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    // Note: Coupon usage is updated in the frontend via /coupons/apply route

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/orders/:id/pay
// @desc    Process payment
// @access  Private
router.post('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.paymentMethod === 'stripe') {
      if (!stripe) {
        return res.status(400).json({ message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to .env' });
      }
      const { paymentIntentId } = req.body;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          email_address: paymentIntent.receipt_email
        };
        order.status = 'processing';
        await order.save();

        return res.json({ success: true, order });
      }
    } else if (order.paymentMethod === 'razorpay') {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(400).json({ message: 'Razorpay is not configured. Please add RAZORPAY_KEY_SECRET to .env' });
      }

      const { paymentId, orderId, signature } = req.body;
      
      // Verify signature
      const crypto = require('crypto');
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature === signature) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: paymentId,
          status: 'captured'
        };
        order.status = 'processing';
        await order.save();

        return res.json({ success: true, order });
      } else {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    res.status(400).json({ message: 'Payment processing failed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/orders/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to .env' });
    }

    const { amount, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { orderId }
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/orders/create-razorpay-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-razorpay-order', protect, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(400).json({ message: 'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env' });
    }

    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({ success: true, orderId: razorpayOrder.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('orderItems.product', 'name images')
      .sort('-createdAt');

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

