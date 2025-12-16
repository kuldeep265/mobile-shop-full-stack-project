const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/coupons
// @desc    Get all active coupons (Admin only - get all coupons)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .populate('applicableProducts', 'name brand')
      .sort({ createdAt: -1 });

    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coupons/validate
// @desc    Validate coupon code with cart items
// @access  Public
router.post('/validate', async (req, res) => {
  try {
    const { code, cartItems } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).populate('applicableProducts');

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }

    // Calculate applicable discount
    let applicableItems = [];
    let totalApplicableAmount = 0;

    if (coupon.couponType === 'general') {
      // General coupon applies to all items
      applicableItems = cartItems;
      totalApplicableAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } else {
      // Product-specific coupon
      const applicableProductIds = coupon.applicableProducts.map(p => p._id.toString());
      applicableItems = cartItems.filter(item => 
        applicableProductIds.includes(item.product.toString())
      );
      totalApplicableAmount = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    if (applicableItems.length === 0) {
      return res.status(400).json({ 
        message: 'This coupon is not applicable to any items in your cart' 
      });
    }

    if (totalApplicableAmount < coupon.minPurchase) {
      return res.status(400).json({ 
        message: `Minimum purchase amount of ₹${coupon.minPurchase} required for this coupon` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (totalApplicableAmount * coupon.discount) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discount, totalApplicableAmount);
    }

    res.json({ 
      success: true, 
      coupon,
      applicableItems,
      totalApplicableAmount,
      discountAmount: Math.round(discountAmount)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coupons
// @desc    Create new coupon
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/coupons/:id
// @desc    Update coupon
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/coupons/product/:productId
// @desc    Get applicable coupons for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const currentDate = new Date();

    console.log(`Fetching coupons for product: ${productId}`);

    // Find general coupons and product-specific coupons
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: currentDate },
      validUntil: { $gte: currentDate },
      $or: [
        { couponType: 'general' },
        { 
          couponType: 'product-specific',
          applicableProducts: productId
        }
      ]
    })
    .populate('applicableProducts', 'name brand')
    .select('code discount discountType minPurchase maxDiscount description couponType applicableProducts usedCount usageLimit');

    console.log(`Found ${coupons.length} coupons for product ${productId}`);

    // Filter out coupons that have reached usage limit
    const availableCoupons = coupons.filter(coupon => 
      !coupon.usageLimit || coupon.usedCount < coupon.usageLimit
    );

    console.log(`Available coupons after filtering: ${availableCoupons.length}`);

    res.json({ success: true, coupons: availableCoupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/coupons/debug/all
// @desc    Get all coupons for debugging
// @access  Public (for testing only)
router.get('/debug/all', async (req, res) => {
  try {
    const allCoupons = await Coupon.find({})
      .populate('applicableProducts', 'name brand')
      .select('code discount discountType couponType applicableProducts isActive validFrom validUntil');
    
    console.log('All coupons in database:', allCoupons.length);
    res.json({ success: true, coupons: allCoupons, count: allCoupons.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coupons/validate-multiple
// @desc    Validate multiple coupons with cart items
// @access  Public
router.post('/validate-multiple', async (req, res) => {
  try {
    const { coupons, cartItems } = req.body; // coupons is array of coupon codes

    if (!coupons || !Array.isArray(coupons) || coupons.length === 0) {
      return res.status(400).json({ message: 'No coupons provided' });
    }

    const validatedCoupons = [];
    let totalDiscount = 0;
    const appliedProductIds = new Set(); // Track which products already have coupons applied

    for (const code of coupons) {
      try {
        const coupon = await Coupon.findOne({
          code: code.toUpperCase(),
          isActive: true,
          validFrom: { $lte: new Date() },
          validUntil: { $gte: new Date() }
        }).populate('applicableProducts');

        if (!coupon) {
          continue; // Skip invalid coupons
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          continue; // Skip coupons that reached usage limit
        }

        // Calculate applicable items for this coupon
        let applicableItems = [];
        
        if (coupon.couponType === 'general') {
          // General coupon applies to all items not already discounted
          applicableItems = cartItems.filter(item => 
            !appliedProductIds.has(item.product.toString())
          );
        } else {
          // Product-specific coupon
          const applicableProductIds = coupon.applicableProducts.map(p => p._id.toString());
          applicableItems = cartItems.filter(item => 
            applicableProductIds.includes(item.product.toString()) &&
            !appliedProductIds.has(item.product.toString())
          );
        }

        if (applicableItems.length === 0) {
          continue; // Skip if no applicable items
        }

        const totalApplicableAmount = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (totalApplicableAmount < coupon.minPurchase) {
          continue; // Skip if minimum purchase not met
        }

        // Calculate discount for this coupon
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
          discountAmount = (totalApplicableAmount * coupon.discount) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = Math.min(coupon.discount, totalApplicableAmount);
        }

        // Add to validated coupons
        validatedCoupons.push({
          coupon,
          applicableItems,
          totalApplicableAmount,
          discountAmount: Math.round(discountAmount)
        });

        // Mark these products as having coupons applied
        applicableItems.forEach(item => {
          appliedProductIds.add(item.product.toString());
        });

        totalDiscount += Math.round(discountAmount);
      } catch (error) {
        console.error(`Error validating coupon ${code}:`, error);
        continue; // Skip problematic coupons
      }
    }

    res.json({ 
      success: true, 
      validatedCoupons,
      totalDiscount,
      message: `${validatedCoupons.length} coupon(s) applied successfully`
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coupons/apply
// @desc    Apply coupon and increment usage count
// @access  Private
router.post('/apply', protect, async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });
    }

    // Increment usage count
    coupon.usedCount += 1;
    await coupon.save();

    res.json({ success: true, message: 'Coupon applied successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coupons/apply-multiple
// @desc    Apply multiple coupons and increment usage counts
// @access  Private
router.post('/apply-multiple', protect, async (req, res) => {
  try {
    const { codes } = req.body; // Array of coupon codes

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({ message: 'No coupon codes provided' });
    }

    const appliedCoupons = [];
    
    for (const code of codes) {
      try {
        const coupon = await Coupon.findOne({
          code: code.toUpperCase(),
          isActive: true,
          validFrom: { $lte: new Date() },
          validUntil: { $gte: new Date() }
        });

        if (coupon && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
          coupon.usedCount += 1;
          await coupon.save();
          appliedCoupons.push(code);
        }
      } catch (error) {
        console.error(`Error applying coupon ${code}:`, error);
      }
    }

    res.json({ 
      success: true, 
      appliedCoupons,
      message: `${appliedCoupons.length} coupon(s) applied successfully` 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/coupons/generate/:productId
// @desc    Generate quick coupon for product using its discount percentage
// @access  Private/Admin
router.post('/generate/:productId', protect, admin, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the product
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Generate random coupon code
    const generateCouponCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Use product's discount percentage, default to 10% if no discount set
    const discountPercentage = product.discount > 0 ? product.discount : 10;
    
    // Set validity dates
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1); // Valid for 1 month

    const couponCode = generateCouponCode();
    
    const couponData = {
      code: couponCode,
      discount: discountPercentage,
      discountType: 'percentage',
      minPurchase: 0,
      maxDiscount: null,
      validFrom,
      validUntil,
      usageLimit: 100,
      couponType: 'product-specific',
      applicableProducts: [productId],
      description: `Quick coupon for ${product.name} - ${discountPercentage}% off`,
      isActive: true
    };

    const coupon = await Coupon.create(couponData);
    
    res.status(201).json({ 
      success: true, 
      coupon,
      message: `Coupon ${couponCode} generated successfully with ${discountPercentage}% discount!`
    });
  } catch (error) {
    console.error('Error generating quick coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.deleteOne();

    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

