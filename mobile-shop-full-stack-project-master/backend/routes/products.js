
const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryConfigured = () =>
  ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    .every(key => process.env[key] &&
      !process.env[key].startsWith('your_'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only image files are allowed!'), false)
});

// Reusable helpers
const serverError = (res, error, message = 'Server error') =>
  res.status(500).json({ message, error: error.message });

const parseData = (req, res) => {
  try {
    return req.body.data ? JSON.parse(req.body.data) : req.body;
  } catch (error) {
    res.status(400).json({
      message: 'Invalid JSON data in request body',
      error: error.message
    });
    return null;
  }
};

const deleteCloudinaryImages = async images => {
  for (const image of images || []) {
    if (image.public_id && !image.public_id.startsWith('temp_')) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (error) {
        console.error('Error deleting Cloudinary image:', error);
      }
    }
  }
};

const uploadImages = async (files, prefix = 'Image') => {
  const images = [];
  const useCloudinary = cloudinaryConfigured();

  try {
    for (let i = 0; i < (files || []).length; i++) {
      const file = files[i];
      const dataUri =
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      if (useCloudinary) {
        try {
          const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'fone-factory',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          });

          images.push({
            url: result.secure_url,
            public_id: result.public_id
          });
        } catch (error) {
          await deleteCloudinaryImages(images);
          error.uploadMessage =
            `Failed to upload ${prefix.toLowerCase()} ${i + 1} to Cloudinary: ${error.message}`;
          error.suggestion =
            'Please check your Cloudinary configuration in the .env file';
          throw error;
        }
      } else {
        images.push({
          url: dataUri,
          public_id: `temp_${Date.now()}_${i}`
        });
      }
    }

    if (files?.length && !useCloudinary) {
      console.warn('WARNING: Images are being stored as base64 in the database.');
    }

    return images;
  } catch (error) {
    throw error;
  }
};

const handleProductError = (res, error, action) => {
  console.error(`Error ${action} product:`, error);

  if (error.uploadMessage) {
    return res.status(500).json({
      message: error.uploadMessage,
      error: error.message,
      suggestion: error.suggestion
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(error.errors).map(e => e.message)
    });
  }

  return serverError(res, error, `Server error while ${action} product`);
};

// GET all products with filters, sorting and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1, limit = 12, brand, minPrice, maxPrice,
      minRating, storage, ram, search, sort,
      newArrival, bestSeller, isFeatured
    } = req.query;

    const query = {};

    if (brand) query.brand = brand;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) query['ratings.average'] = { $gte: Number(minRating) };
    if (storage) query['variants.storage'] = storage;
    if (ram) query['variants.ram'] = ram;
    if (search) query.$text = { $search: search };
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (isFeatured === 'true') query.isFeatured = true;

    const sortOptions = {
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      newest: { createdAt: -1 },
      rating: { 'ratings.average': -1 }
    };

    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const products = await Product.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('vendor', 'name email');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    serverError(res, error);
  }
});

// GET all unique brands (must precede /:id)
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json({ success: true, brands });
  } catch (error) {
    serverError(res, error);
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    serverError(res, error);
  }
});

// POST create product (Admin)
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
  let images = [];

  try {
    const productData = parseData(req, res);
    if (!productData) return;

    images = await uploadImages(req.files);

    productData.images = images;

    if (!productData.name || !productData.brand ||
        !productData.description || !productData.price) {
      await deleteCloudinaryImages(images);

      return res.status(400).json({
        message: 'Missing required fields: name, brand, description, and price are required'
      });
    }

    const product = await Product.create(productData);
    console.log('Product created successfully with ID:', product._id);

    res.status(201).json({ success: true, product });
  } catch (error) {
    await deleteCloudinaryImages(images);
    handleProductError(res, error, 'creating');
  }
});

// PUT update product (Admin)
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res) => {
  let newImages = [];

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = parseData(req, res);
    if (!productData) return;

    const useCloudinary = cloudinaryConfigured();

    // Delete removed existing Cloudinary images
    if (Array.isArray(productData.images) && useCloudinary) {
      const oldIds = product.images.map(img => img.public_id);
      const newIds = productData.images
        .map(img => img.public_id)
        .filter(Boolean);

      await deleteCloudinaryImages(
        oldIds
          .filter(id => id && !newIds.includes(id) && !id.startsWith('temp_'))
          .map(public_id => ({ public_id }))
      );
    }

    // Upload and append new images
    if (req.files?.length) {
      newImages = await uploadImages(req.files, 'New image');

      productData.images = Array.isArray(productData.images)
        ? [...productData.images, ...newImages]
        : [...product.images, ...newImages];
    } else if (!productData.images) {
      productData.images = product.images;
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    console.log('Product updated successfully with ID:', product._id);
    res.json({ success: true, product });
  } catch (error) {
    await deleteCloudinaryImages(newImages);
    handleProductError(res, error, 'updating');
  }
});

// DELETE product (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (cloudinaryConfigured()) {
      await deleteCloudinaryImages(product.images);
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    serverError(res, error);
  }
});

module.exports = router;
