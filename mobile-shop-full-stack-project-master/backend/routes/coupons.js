
const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Reusable helpers
const findCoupon = code => Coupon.findOne({
  code: code.toUpperCase(),
  isActive: true,
  validFrom: { $lte: new Date() },
  validUntil: { $gte: new Date() }
});

const available = c =>
  !c.usageLimit || c.usedCount < c.usageLimit;

const discount = (coupon, amount) => {
  let result = coupon.discountType === 'percentage'
    ? amount * coupon.discount / 100
    : Math.min(coupon.discount, amount);

  if (coupon.discountType === 'percentage' &&
      coupon.maxDiscount && result > coupon.maxDiscount) {
    result = coupon.maxDiscount;
  }

  return Math.round(result);
};

const amount = items =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const applicable = (coupon, items, excluded = new Set()) => {
  const ids = coupon.applicableProducts?.map(p =>
    (p._id || p).toString()
  );

  return items.filter(item =>
    !excluded.has(item.product.toString()) &&
    (coupon.couponType === 'general' ||
      ids?.includes(item.product.toString()))
  );
};

const serverError = (res, error) =>
  res.status(500).json({ message: 'Server error', error: error.message });

// GET all coupons (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .populate('applicableProducts', 'name brand')
      .sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (e) { serverError(res, e); }
});

// Validate one coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, cartItems } = req.body;
    const coupon = await findCoupon(code);
    if (coupon) await coupon.populate('applicableProducts');

    if (!coupon)
      return res.status(404).json({ message: 'Invalid or expired coupon' });

    if (!available(coupon))
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });

    const items = applicable(coupon, cartItems);
    const total = amount(items);

    if (!items.length)
      return res.status(400).json({
        message: 'This coupon is not applicable to any items in your cart'
      });

    if (total < coupon.minPurchase)
      return res.status(400).json({
        message: `Minimum purchase amount of ₹${coupon.minPurchase} required for this coupon`
      });

    res.json({
      success: true,
      coupon,
      applicableItems: items,
      totalApplicableAmount: total,
      discountAmount: discount(coupon, total)
    });
  } catch (e) { serverError(res, e); }
});

// Create coupon (Admin)
router.post('/', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (e) { serverError(res, e); }
});

// Update coupon (Admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!coupon)
      return res.status(404).json({ message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (e) { serverError(res, e); }
});

// Get coupons applicable to a product
router.get('/product/:productId', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { couponType: 'general' },
        { couponType: 'product-specific', applicableProducts: req.params.productId }
      ]
    })
      .populate('applicableProducts', 'name brand')
      .select('code discount discountType minPurchase maxDiscount description couponType applicableProducts usedCount usageLimit');

    res.json({ success: true, coupons: coupons.filter(available) });
  } catch (e) { serverError(res, e); }
});

// Debug: Get all coupons
router.get('/debug/all', async (req, res) => {
  try {
    const coupons = await Coupon.find({})
      .populate('applicableProducts', 'name brand')
      .select('code discount discountType couponType applicableProducts isActive validFrom validUntil');
    res.json({ success: true, coupons, count: coupons.length });
  } catch (e) { serverError(res, e); }
});

// Validate multiple coupons
router.post('/validate-multiple', async (req, res) => {
  try {
    const { coupons, cartItems } = req.body;
    if (!Array.isArray(coupons) || !coupons.length)
      return res.status(400).json({ message: 'No coupons provided' });

    const validatedCoupons = [];
    const usedProducts = new Set();
    let totalDiscount = 0;

    for (const code of coupons) {
      try {
        const coupon = await findCoupon(code);
        if (!coupon || !available(coupon)) continue;
        await coupon.populate('applicableProducts');

        const items = applicable(coupon, cartItems, usedProducts);
        const total = amount(items);
        if (!items.length || total < coupon.minPurchase) continue;

        const discountAmount = discount(coupon, total);
        validatedCoupons.push({
          coupon,
          applicableItems: items,
          totalApplicableAmount: total,
          discountAmount
        });

        items.forEach(item => usedProducts.add(item.product.toString()));
        totalDiscount += discountAmount;
      } catch (e) {
        console.error(`Error validating coupon ${code}:`, e);
      }
    }

    res.json({
      success: true,
      validatedCoupons,
      totalDiscount,
      message: `${validatedCoupons.length} coupon(s) applied successfully`
    });
  } catch (e) { serverError(res, e); }
});

// Apply one coupon
router.post('/apply', protect, async (req, res) => {
  try {
    const coupon = await findCoupon(req.body.code);
    if (!coupon)
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    if (!available(coupon))
      return res.status(400).json({ message: 'Coupon usage limit exceeded' });

    coupon.usedCount += 1;
    await coupon.save();
    res.json({ success: true, message: 'Coupon applied successfully' });
  } catch (e) { serverError(res, e); }
});

// Apply multiple coupons
router.post('/apply-multiple', protect, async (req, res) => {
  try {
    const { codes } = req.body;
    if (!Array.isArray(codes) || !codes.length)
      return res.status(400).json({ message: 'No coupon codes provided' });

    const appliedCoupons = [];
    for (const code of codes) {
      try {
        const coupon = await findCoupon(code);
        if (!coupon || !available(coupon)) continue;
        coupon.usedCount += 1;
        await coupon.save();
        appliedCoupons.push(code);
      } catch (e) {
        console.error(`Error applying coupon ${code}:`, e);
      }
    }

    res.json({
      success: true,
      appliedCoupons,
      message: `${appliedCoupons.length} coupon(s) applied successfully`
    });
  } catch (e) { serverError(res, e); }
});

// Generate product coupon (Admin)
router.post('/generate/:productId', protect, admin, async (req, res) => {
  try {
    const Product = require('../models/Product');
    const product = await Product.findById(req.params.productId);
    if (!product)
      return res.status(404).json({ message: 'Product not found' });

    const code = Array.from({ length: 8 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
    ).join('');

    const discountValue = product.discount > 0 ? product.discount : 10;
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1);

    const coupon = await Coupon.create({
      code,
      discount: discountValue,
      discountType: 'percentage',
      minPurchase: 0,
      maxDiscount: null,
      validFrom,
      validUntil,
      usageLimit: 100,
      couponType: 'product-specific',
      applicableProducts: [product._id],
      description: `Quick coupon for ${product.name} - ${discountValue}% off`,
      isActive: true
    });

    res.status(201).json({
      success: true,
      coupon,
      message: `Coupon ${code} generated successfully with ${discountValue}% discount!`
    });
  } catch (e) {
    console.error('Error generating quick coupon:', e);
    serverError(res, e);
  }
});

// Delete coupon (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon)
      return res.status(404).json({ message: 'Coupon not found' });

    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (e) { serverError(res, e); }
});

module.exports = router;
